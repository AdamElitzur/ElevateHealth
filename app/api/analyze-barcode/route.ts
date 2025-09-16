import { NextRequest, NextResponse } from 'next/server';

interface BarcodeAnalysisRequest {
  barcode: string;
}

interface BarcodeAnalysisResponse {
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
  overallHealthScore: number;
  recommendations: string[];
  timestamp: number;
  barcode: string;
  productInfo?: {
    brand?: string;
    category?: string;
    description?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BarcodeAnalysisRequest = await request.json();
    const { barcode } = body;

    if (!barcode || barcode.trim().length < 8) {
      return NextResponse.json(
        { error: 'Valid barcode is required (minimum 8 digits)' },
        { status: 400 }
      );
    }

    console.log('Analyzing barcode:', barcode);

    // For now, we'll use mock data based on barcode patterns
    // In a real implementation, you would integrate with a barcode database API
    const analysis = await analyzeBarcodeWithMockData(barcode);
    
    const response: BarcodeAnalysisResponse = {
      ...analysis,
      barcode: barcode.trim(),
      timestamp: Date.now()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error analyzing barcode:', error);
    return NextResponse.json(
      { error: 'Failed to analyze barcode' },
      { status: 500 }
    );
  }
}

// Mock barcode analysis function
async function analyzeBarcodeWithMockData(barcode: string): Promise<Omit<BarcodeAnalysisResponse, 'barcode' | 'timestamp'>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock data based on barcode patterns
  const mockProducts = [
    {
      name: "Coca-Cola Classic 12oz Can",
      brand: "Coca-Cola",
      category: "Beverages",
      description: "Classic cola soft drink",
      confidence: 0.95,
      ingredients: ["carbonated water", "high fructose corn syrup", "caramel color", "phosphoric acid", "natural flavors", "caffeine"],
      calories: 140,
      healthScore: 25,
      allergens: [],
      nutritionalInfo: {
        protein: 0,
        carbs: 39,
        fat: 0,
        fiber: 0,
        sugar: 39,
        sodium: 45
      }
    },
    {
      name: "Lay's Classic Potato Chips",
      brand: "Lay's",
      category: "Snacks",
      description: "Classic salted potato chips",
      confidence: 0.92,
      ingredients: ["potatoes", "vegetable oil", "salt"],
      calories: 160,
      healthScore: 30,
      allergens: [],
      nutritionalInfo: {
        protein: 2,
        carbs: 15,
        fat: 10,
        fiber: 1,
        sugar: 1,
        sodium: 170
      }
    },
    {
      name: "Nature Valley Granola Bars",
      brand: "Nature Valley",
      category: "Snacks",
      description: "Oats and honey granola bars",
      confidence: 0.88,
      ingredients: ["whole grain oats", "sugar", "canola oil", "honey", "brown sugar syrup", "salt", "baking soda", "soy lecithin"],
      calories: 190,
      healthScore: 60,
      allergens: ["soy"],
      nutritionalInfo: {
        protein: 4,
        carbs: 29,
        fat: 7,
        fiber: 2,
        sugar: 12,
        sodium: 160
      }
    },
    {
      name: "Quaker Oats Old Fashioned",
      brand: "Quaker",
      category: "Breakfast",
      description: "100% whole grain rolled oats",
      confidence: 0.98,
      ingredients: ["100% whole grain rolled oats"],
      calories: 150,
      healthScore: 90,
      allergens: [],
      nutritionalInfo: {
        protein: 5,
        carbs: 27,
        fat: 3,
        fiber: 4,
        sugar: 1,
        sodium: 0
      }
    },
    {
      name: "Chobani Greek Yogurt Strawberry",
      brand: "Chobani",
      category: "Dairy",
      description: "Greek yogurt with strawberry",
      confidence: 0.94,
      ingredients: ["cultured pasteurized nonfat milk", "strawberries", "cane sugar", "natural flavors", "pectin", "locust bean gum", "fruit and vegetable juice concentrate"],
      calories: 120,
      healthScore: 75,
      allergens: ["milk"],
      nutritionalInfo: {
        protein: 12,
        carbs: 18,
        fat: 0,
        fiber: 0,
        sugar: 16,
        sodium: 50
      }
    },
    {
      name: "Kraft Macaroni & Cheese",
      brand: "Kraft",
      category: "Pasta",
      description: "Original macaroni and cheese dinner",
      confidence: 0.91,
      ingredients: ["enriched macaroni product", "cheese sauce mix", "whey", "milkfat", "milk protein concentrate", "salt", "sodium tripolyphosphate", "contains less than 2% of citric acid", "sodium phosphate", "lactose", "milk", "yellow 5", "yellow 6", "enzymes", "cheese culture"],
      calories: 250,
      healthScore: 40,
      allergens: ["wheat", "milk"],
      nutritionalInfo: {
        protein: 9,
        carbs: 47,
        fat: 3,
        fiber: 2,
        sugar: 6,
        sodium: 570
      }
    }
  ];

  // Select a random product or one based on barcode pattern
  const selectedProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
  
  // Modify based on barcode to make it seem more realistic
  const barcodeNum = parseInt(barcode.slice(-2)) || 0;
  const variation = (barcodeNum % 10) / 10;
  
  const healthScore = Math.max(10, Math.min(95, selectedProduct.healthScore + (variation - 0.5) * 20));
  const calories = Math.round(selectedProduct.calories * (0.8 + variation * 0.4));
  
  const recommendations = [
    "Check the sugar content - aim for less than 25g per day",
    "Look for products with higher protein and fiber content",
    "Be mindful of sodium levels in processed foods",
    "Choose whole foods over processed alternatives when possible"
  ];

  return {
    foodItems: [{
      ...selectedProduct,
      healthScore: Math.round(healthScore),
      calories: calories,
      nutritionalInfo: {
        ...selectedProduct.nutritionalInfo,
        sugar: Math.round(selectedProduct.nutritionalInfo.sugar * (0.8 + variation * 0.4)),
        sodium: Math.round(selectedProduct.nutritionalInfo.sodium * (0.8 + variation * 0.4))
      }
    }],
    overallHealthScore: Math.round(healthScore),
    recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
    productInfo: {
      brand: selectedProduct.brand,
      category: selectedProduct.category,
      description: selectedProduct.description
    }
  };
}
