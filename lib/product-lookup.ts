// Type definitions for OpenFoodFacts API response
interface OpenFoodFactsNutriments {
  sugars_100g?: number;
  'energy-kcal_100g'?: number;
  fat_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  sodium_100g?: number;
}

interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  image_url?: string;
  nutriments?: OpenFoodFactsNutriments;
  serving_quantity?: string;
  serving_quantity_unit?: string;
  ingredients_text?: string;
  nutrition_grade_fr?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  allergens_tags?: string[];
  additives_tags?: string[];
}

interface OpenFoodFactsResponse {
  product?: OpenFoodFactsProduct;
  status: number;
  status_verbose: string;
}

export interface ProductInfo {
  name: string;
  brand: string;
  barcode: string;
  imageUrl: string;
  nutrition: {
    sugarPer100g: number;
    sugarPerServing: number;
    caloriesPer100g: number;
    caloriesPerServing: number;
    fatPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    sodiumPer100g?: number;
  };
  servingSize?: number;
  ingredients: string[];
  allergens: string[];
  additives: string[];
  nutritionGrade: string;
  ecoScore: string;
  novaGroup: number;
}

import { OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

const client = new OpenFoodFacts(globalThis.fetch);

export async function lookupProduct(barcode: string): Promise<ProductInfo | null> {
  try {
    console.log(`Looking up product with barcode: ${barcode}`);

    // Get product data from OpenFoodFacts
    const response = await client.getProductV3(barcode) as any;
    
    // Handle different response formats
    const product = response?.product || response;
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Safely access product properties with type assertions
    const productData = product as OpenFoodFactsProduct;
    const nutriments = productData.nutriments || {} as OpenFoodFactsNutriments;
    
    // Safely access product properties with defaults and calculate serving size
    const servingQuantity = parseFloat(productData.serving_quantity || '0');
    const servingUnit = productData.serving_quantity_unit || 'g';
    const servingSize = servingQuantity > 0 ? servingQuantity * (servingUnit === 'g' ? 1 : 100) : 100;
      
    // Calculate nutrition per serving
    const sugarPerServing = (nutriments.sugars_100g || 0) * (servingSize / 100);
    const caloriesPerServing = (nutriments['energy-kcal_100g'] || 0) * (servingSize / 100);
    
    // Map the response to our ProductInfo type
    return {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      barcode: barcode,
      imageUrl: product.image_url || 'https://via.placeholder.com/200',
      nutrition: {
        sugarPer100g: nutriments.sugars_100g || 0,
        sugarPerServing: sugarPerServing,
        caloriesPer100g: nutriments['energy-kcal_100g'] || 0,
        caloriesPerServing: caloriesPerServing,
        fatPer100g: nutriments.fat_100g || 0,
        proteinPer100g: nutriments.proteins_100g || 0,
        carbsPer100g: nutriments.carbohydrates_100g || 0,
        sodiumPer100g: nutriments.sodium_100g
      },
      // Use calculated serving size
      servingSize: servingSize,
      ingredients: productData.ingredients_text ? [productData.ingredients_text] : ['No ingredients listed'],
      nutritionGrade: productData.nutrition_grade_fr || '',
      ecoScore: productData.ecoscore_grade || '',
      novaGroup: productData.nova_group || 0,
      allergens: (productData.allergens_tags || []).map((tag: string) => tag.replace('en:', '')),
      additives: (productData.additives_tags || []).map((tag: string) => tag.replace('en:', ''))
    };
  } catch (error) {
    console.error('Error looking up product:', error);
    return null;
  }
}

export function formatNutritionValue(
  value: number | undefined,
  unit: string = "g"
): string {
  if (value === undefined || value === null) return "N/A";
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function getNutritionGradeColor(grade: string | undefined): string {
  switch (grade?.toLowerCase()) {
    case "a":
      return "text-green-600";
    case "b":
      return "text-yellow-600";
    case "c":
      return "text-orange-600";
    case "d":
      return "text-red-600";
    case "e":
      return "text-red-800";
    default:
      return "text-gray-600";
  }
}

export function getNovaGroupDescription(group: number | undefined): string {
  switch (group) {
    case 1:
      return "Unprocessed or minimally processed foods";
    case 2:
      return "Processed culinary ingredients";
    case 3:
      return "Processed foods";
    case 4:
      return "Ultra-processed foods";
    default:
      return "Unknown processing level";
  }
}
