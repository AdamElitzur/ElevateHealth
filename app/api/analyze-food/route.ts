import { NextRequest, NextResponse } from 'next/server';
import { RestaurantScraper } from '@/lib/restaurant-scraper';
import OpenAI from 'openai';

interface FoodAnalysisRequest {
  image: string; // base64 image
  location?: {
    latitude: number;
    longitude: number;
  };
  restaurantUrl?: string;
}

interface FoodAnalysisResponse {
  foodItems: Array<{
    name: string;
    confidence: number;
    ingredients: string[];
    calories: number;
    healthScore: number;
    allergens: string[];
    nutritionalInfo: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
  }>;
  location?: {
    address: string;
    restaurant?: string;
    menuItems?: Array<{
      name: string;
      price: string;
      description: string;
    }>;
  };
  overallHealthScore: number;
  recommendations: string[];
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: FoodAnalysisRequest = await request.json();
    const { image, location, restaurantUrl } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Validate image format
    if (!image.startsWith('data:image/')) {
      console.error('Invalid image format:', image.substring(0, 50) + '...');
      return NextResponse.json(
        { error: 'Invalid image format. Please provide a valid base64 image.' },
        { status: 400 }
      );
    }

    console.log('Analyzing food image with OpenAI Vision API...');
    console.log('Image length:', image.length);
    console.log('Image starts with:', image.substring(0, 50));
    console.log('Location:', location);
    console.log('Restaurant URL:', restaurantUrl);

    // Call OpenAI Vision API to analyze the food image
    let foodAnalysis;
    try {
      // Ensure image is properly formatted for OpenAI
      const imageData = typeof image === 'string' ? image : String(image);
      console.log('Image data type for OpenAI:', typeof imageData);
      console.log('Image data length:', imageData.length);
      
      foodAnalysis = await analyzeFoodWithOpenAI(imageData);
    } catch (openaiError) {
      console.error('OpenAI analysis failed:', openaiError);
      throw new Error(`Food analysis failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`);
    }
    
    // Get restaurant information if location or URL is provided
    let restaurantInfo = null;
    if (restaurantUrl) {
      try {
        console.log('Scraping restaurant from URL:', restaurantUrl);
        restaurantInfo = await RestaurantScraper.scrapeRestaurant(restaurantUrl);
        console.log('Restaurant info obtained:', restaurantInfo.name);
      } catch (error) {
        console.error('Error scraping restaurant:', error);
        // Continue without restaurant info rather than failing
      }
    } else if (location) {
      try {
        console.log('Finding restaurant by location:', location);
        restaurantInfo = await RestaurantScraper.findRestaurantByLocation(
          location.latitude,
          location.longitude
        );
        if (restaurantInfo) {
          console.log('Restaurant found by location:', restaurantInfo.name);
        }
      } catch (error) {
        console.error('Error finding restaurant:', error);
        // Continue without restaurant info rather than failing
      }
    }

    const response: FoodAnalysisResponse = {
      ...foodAnalysis,
      location: restaurantInfo ? {
        address: restaurantInfo.address,
        restaurant: restaurantInfo.name,
        menuItems: restaurantInfo.menuItems.map(item => ({
          name: item.name,
          price: item.price,
          description: item.description
        }))
      } : undefined,
      timestamp: Date.now()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error analyzing food:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food' },
      { status: 500 }
    );
  }
}

// Real OpenAI Vision API function
async function analyzeFoodWithOpenAI(image: string): Promise<Omit<FoodAnalysisResponse, 'location' | 'timestamp'>> {
  // Check if OpenAI API key is available
  console.log('OpenAI API key check:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
  console.log('API key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'N/A');
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found');
    throw new Error('OpenAI API key is required for food analysis');
  }

  // Validate image format
  if (!image || typeof image !== 'string') {
    throw new Error('Invalid image data: must be a string');
  }

  if (!image.startsWith('data:image/')) {
    throw new Error('Invalid image format: must start with data:image/');
  }

  console.log('Image format validation passed');
  console.log('Image starts with:', image.substring(0, 30));

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('Calling OpenAI Vision API...');
    
    // Add timeout to prevent hanging
    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o", // Using the latest vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a food analysis expert. Analyze this food image and identify all visible food items with detailed nutritional information. 

IMPORTANT: Even if the image is unclear, try to identify at least one food item. Look for common foods like:
- Sandwiches, burgers, pizza
- Salads, fruits, vegetables
- Pasta, rice, bread
- Meat, fish, chicken
- Desserts, snacks, drinks

You MUST respond with valid JSON only, no other text.

Required JSON format:
{
  "foodItems": [
    {
      "name": "specific food name",
      "confidence": 0.8,
      "ingredients": ["main ingredients"],
      "calories": 250,
      "healthScore": 75,
      "allergens": ["gluten", "dairy"],
      "nutritionalInfo": {
        "protein": 15,
        "carbs": 30,
        "fat": 8,
        "fiber": 5,
        "sugar": 12,
        "sodium": 400
      }
    }
  ],
  "overallHealthScore": 75,
  "recommendations": ["health recommendation"]
}

Focus especially on sugar content in grams. Make reasonable estimates based on what you can see. If you see ANY food, provide analysis for it.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI API timeout')), 30000)
      )
    ]);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI response received, parsing...');
    console.log('Raw response content:', content.substring(0, 200) + '...');
    
    // Parse the JSON response - handle markdown code blocks
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned JSON content:', jsonContent.substring(0, 200) + '...');
    
    // Check if response looks like JSON
    if (!jsonContent.startsWith('{') && !jsonContent.startsWith('[')) {
      console.error('Response does not appear to be JSON:', jsonContent.substring(0, 100));
      
      // If OpenAI says it can't analyze the image, throw an error
      if (jsonContent.toLowerCase().includes("can't") || jsonContent.toLowerCase().includes("cannot") || jsonContent.toLowerCase().includes("unable") || jsonContent.toLowerCase().includes("no food")) {
        console.log('OpenAI cannot analyze image');
        throw new Error('Unable to analyze this food image. Please try with a clearer photo.');
      }
      
      throw new Error(`OpenAI returned non-JSON response: ${jsonContent.substring(0, 100)}...`);
    }
    
    let analysis;
    try {
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed to parse content:', jsonContent);
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // Validate and structure the response
    const foodItems = analysis.foodItems || [];
    const overallHealthScore = analysis.overallHealthScore || 0;
    const recommendations = analysis.recommendations || [];
    
    // If OpenAI returns empty results, throw an error
    if (foodItems.length === 0 && overallHealthScore === 0) {
      console.log('OpenAI returned empty results');
      throw new Error('Unable to analyze the food image. Please try with a clearer image.');
    }
    
    return {
      foodItems,
      overallHealthScore,
      recommendations
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('401')) {
      console.warn('❌ Invalid OpenAI API key - please check your .env.local file');
      console.warn('Make sure your API key starts with "sk-" and is valid');
      console.warn('Get a new key from: https://platform.openai.com/api-keys');
      console.warn('Current key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'Not found');
    } else if (error instanceof Error && error.message.includes('429')) {
      console.warn('⚠️ Rate limit exceeded - too many requests');
    } else if (error instanceof Error && error.message.includes('insufficient_quota')) {
      console.warn('💳 Insufficient quota - check your OpenAI account billing');
    } else if (error instanceof Error && error.message.includes('400')) {
      console.warn('🖼️ Image format error - please use a valid image format (png, jpeg, gif, webp)');
    }
    
    // Return error instead of mock data
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mock data fallback function with variety
function getMockFoodAnalysis(): Omit<FoodAnalysisResponse, 'location' | 'timestamp'> {
  const mockFoods = [
    {
      name: "Grilled Chicken Salad",
      confidence: 0.95,
      ingredients: ["chicken breast", "lettuce", "tomatoes", "cucumbers", "olive oil", "lemon"],
      calories: 320,
      healthScore: 85,
      allergens: [],
      nutritionalInfo: {
        protein: 35,
        carbs: 12,
        fat: 15,
        fiber: 4,
        sugar: 6,
        sodium: 280
      }
    },
    {
      name: "Caesar Dressing",
      confidence: 0.88,
      ingredients: ["mayonnaise", "parmesan cheese", "garlic", "anchovies", "lemon juice"],
      calories: 150,
      healthScore: 45,
      allergens: ["dairy", "fish"],
      nutritionalInfo: {
        protein: 2,
        carbs: 3,
        fat: 16,
        fiber: 0,
        sugar: 2,
        sodium: 450
      }
    },
    {
      name: "Chocolate Chip Cookie",
      confidence: 0.92,
      ingredients: ["flour", "butter", "sugar", "chocolate chips", "eggs", "vanilla"],
      calories: 250,
      healthScore: 25,
      allergens: ["gluten", "dairy", "eggs"],
      nutritionalInfo: {
        protein: 3,
        carbs: 35,
        fat: 12,
        fiber: 1,
        sugar: 22,
        sodium: 180
      }
    },
    {
      name: "Fresh Fruit Bowl",
      confidence: 0.90,
      ingredients: ["strawberries", "blueberries", "banana", "apple", "grapes"],
      calories: 120,
      healthScore: 95,
      allergens: [],
      nutritionalInfo: {
        protein: 2,
        carbs: 30,
        fat: 0,
        fiber: 6,
        sugar: 24,
        sodium: 5
      }
    },
    {
      name: "Avocado Toast",
      confidence: 0.87,
      ingredients: ["sourdough bread", "avocado", "lemon", "salt", "pepper", "olive oil"],
      calories: 280,
      healthScore: 75,
      allergens: ["gluten"],
      nutritionalInfo: {
        protein: 8,
        carbs: 25,
        fat: 18,
        fiber: 8,
        sugar: 3,
        sodium: 320
      }
    }
  ];

  // Randomly select 1-2 food items
  const numItems = Math.random() < 0.5 ? 1 : 2;
  const selectedFoods = mockFoods.sort(() => 0.5 - Math.random()).slice(0, numItems);
  
  const overallHealthScore = Math.round(
    selectedFoods.reduce((sum, food) => sum + food.healthScore, 0) / selectedFoods.length
  );

  const recommendations = [
    "Consider the sugar content when making food choices",
    "Look for foods with higher protein and fiber content",
    "Be mindful of sodium levels in processed foods",
    "Choose whole foods over processed alternatives when possible"
  ];

  return {
    foodItems: selectedFoods,
    overallHealthScore,
    recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2)
  };
}

