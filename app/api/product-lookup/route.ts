import { NextResponse } from "next/server";
import { OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

const client = new OpenFoodFacts(globalThis.fetch);

interface ProductResponse {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriments?: {
      sugars_100g?: number;
      sugars_serving?: number;
      'energy-kcal_100g'?: number;
      'energy-kcal_serving'?: number;
      fat_100g?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      sodium_100g?: number;
    };
    serving_quantity?: number;
    serving_size?: string;
    ingredients_text?: string;
    allergens_tags?: string[];
  };
  status: number;
  status_verbose: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode parameter is required" },
        { status: 400 }
      );
    }

    console.log('Looking up barcode:', barcode);
    
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!response.ok) {
      console.error('Failed to fetch product:', response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch product information" },
        { status: response.status }
      );
    }

    const data: ProductResponse = await response.json();
    
    if (data.status === 0) {
      console.error('Product not found:', barcode);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productName = data.product?.product_name || `Product (${barcode})`;
    console.log('Found product:', productName);
    
    // Map the OpenFoodFacts response to our expected format
    const mappedProduct = {
      name: productName,
      brand: data.product?.brands || '',
      barcode: barcode,
      imageUrl: data.product?.image_url || 'https://via.placeholder.com/200',
      nutrition: {
        sugarPer100g: data.product?.nutriments?.sugars_100g || 0,
        sugarPerServing: data.product?.nutriments?.sugars_serving || 0,
        caloriesPer100g: data.product?.nutriments?.['energy-kcal_100g'] || 0,
        caloriesPerServing: data.product?.nutriments?.['energy-kcal_serving'] || 0,
        fatPer100g: data.product?.nutriments?.fat_100g || 0,
        proteinPer100g: data.product?.nutriments?.proteins_100g || 0,
        carbsPer100g: data.product?.nutriments?.carbohydrates_100g || 0,
        sodiumPer100g: data.product?.nutriments?.sodium_100g || 0,
      },
      servingSize: data.product?.serving_quantity || 100,
      servingUnit: data.product?.serving_size?.match(/\d+(.*)/)?.[1]?.trim() || 'g',
      ingredients: data.product?.ingredients_text || '',
      allergens: data.product?.allergens_tags?.map(tag => tag.replace('en:', '')) || [],
    };

    return NextResponse.json({ product: mappedProduct });
  } catch (error) {
    console.error('Error in product lookup:', error);
    return NextResponse.json(
      { error: 'Failed to process product lookup' },
      { status: 500 }
    );
  }
}
