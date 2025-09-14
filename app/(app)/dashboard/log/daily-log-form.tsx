"use client";

import { useState, useEffect } from "react";
import { createDailyLog } from "@/app/actions/daily-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { DailyLog } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductInfo } from "@/lib/product-lookup";
import { Clock, Utensils, Search } from "lucide-react";

interface DailyLogFormProps {
  existingLog?: DailyLog | null;
}

export default function DailyLogForm({ existingLog = null }: DailyLogFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form fields
  const [sugarIntake, setSugarIntake] = useState("");
  const [weight, setWeight] = useState("");
  const [moodRating, setMoodRating] = useState("");
  const [cravingsRating, setCravingsRating] = useState("");
  const [energyRating, setEnergyRating] = useState("");
  const [sleepRating, setSleepRating] = useState("");
  const [notes, setNotes] = useState("");
  const [productName, setProductName] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [mealCategory, setMealCategory] = useState("");
  const [mealTime, setMealTime] = useState("");
  
  // Barcode lookup
  const [lookupBarcode, setLookupBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);

  // Get barcode data from URL if available
  const barcodeParam = searchParams.get("barcode");
  const productNameParam = searchParams.get("name");
  const sugarParam = searchParams.get("sugar");
  
  // Initialize form with existing log data if editing
  useEffect(() => {
    if (existingLog) {
      if (existingLog.sugar_intake_grams) setSugarIntake(existingLog.sugar_intake_grams.toString());
      if (existingLog.weight_kg) setWeight(existingLog.weight_kg.toString());
      if (existingLog.mood_rating) setMoodRating(existingLog.mood_rating.toString());
      if (existingLog.cravings_rating) setCravingsRating(existingLog.cravings_rating.toString());
      if (existingLog.energy_rating) setEnergyRating(existingLog.energy_rating.toString());
      if (existingLog.sleep_rating) setSleepRating(existingLog.sleep_rating.toString());
      if (existingLog.notes) setNotes(existingLog.notes);
      if (existingLog.product_name) setProductName(existingLog.product_name);
      if (existingLog.product_barcode) {
        setProductBarcode(existingLog.product_barcode);
        setLookupBarcode(existingLog.product_barcode);
      }
      if (existingLog.meal_category) setMealCategory(existingLog.meal_category);
      if (existingLog.meal_time) setMealTime(existingLog.meal_time);
    }
  }, [existingLog]);

  // Initialize form with URL parameters if available
  useEffect(() => {
    if (barcodeParam) {
      setProductBarcode(barcodeParam);
    }

    if (productNameParam) {
      setProductName(decodeURIComponent(productNameParam));
    }

    if (sugarParam && !existingLog?.sugar_intake_grams) {
      setSugarIntake(sugarParam);
    }
  }, [
    barcodeParam,
    productNameParam,
    sugarParam,
    existingLog?.sugar_intake_grams,
  ]);

  // New function to manually look up a barcode
  const handleBarcodeLookup = async () => {
    if (!lookupBarcode) {
      setError("Please enter a barcode");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Using the OpenFoodFacts API to look up the barcode
      console.log("Initiating barcode lookup for:", lookupBarcode);
      const response = await fetch(
        `/api/product-lookup?barcode=${lookupBarcode}`
      );
      const data = await response.json();
      console.log("API response:", data);

      if (data.error) {
        console.error("Barcode lookup error:", data.error);
        setError(data.error);
        return;
      }

      if (data.product) {
        console.log("Product data received:", JSON.stringify(data, null, 2));
        setProductBarcode(lookupBarcode);
        setProductName(data.product.name || `Product (${lookupBarcode})`);

        // Set scanned product info with all required fields
        setScannedProduct({
          name: data.product.name || `Product (${lookupBarcode})`,
          brand: data.product.brand || "",
          barcode: lookupBarcode,
          imageUrl: data.product.imageUrl || "https://via.placeholder.com/200",
          nutrition: {
            sugarPer100g: data.product.nutrition?.sugarPer100g || 0,
            sugarPerServing: data.product.nutrition?.sugarPerServing || 0,
            caloriesPer100g: data.product.nutrition?.caloriesPer100g || 0,
            caloriesPerServing: data.product.nutrition?.caloriesPerServing || 0,
            fatPer100g: data.product.nutrition?.fatPer100g || 0,
            proteinPer100g: data.product.nutrition?.proteinPer100g || 0,
            carbsPer100g: data.product.nutrition?.carbsPer100g || 0,
            sodiumPer100g: data.product.nutrition?.sodiumPer100g,
          },
          servingSize: data.product.servingSize,
          ingredients: data.product.ingredients || ["No ingredients listed"],
          nutritionGrade: data.product.nutritionGrade || "",
          ecoScore: data.product.ecoScore || "",
          novaGroup: data.product.novaGroup || 0,
          allergens: data.product.allergens || [],
          additives: data.product.additives || [],
        });

        // Set sugar intake if none is set yet
        if (!sugarIntake && data.product.nutrition?.sugarPerServing) {
          setSugarIntake(data.product.nutrition.sugarPerServing.toFixed(1));
        }

        setSuccess(`Product found: ${data.product.name || "Unknown product"}`);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to lookup barcode");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSugarIntake("");
    setWeight("");
    setMoodRating("");
    setCravingsRating("");
    setEnergyRating("");
    setSleepRating("");
    setNotes("");
    setProductName("");
    setProductBarcode("");
    setMealCategory("");
    setMealTime("");
    setScannedProduct(null);
    setLookupBarcode("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("date", today);
    if (sugarIntake) formData.append("sugar_intake_grams", sugarIntake);
    if (weight) formData.append("weight_kg", weight);
    if (moodRating) formData.append("mood_rating", moodRating);
    if (cravingsRating) formData.append("cravings_rating", cravingsRating);
    if (energyRating) formData.append("energy_rating", energyRating);
    if (sleepRating) formData.append("sleep_rating", sleepRating);
    if (notes) formData.append("notes", notes);
    if (productName) formData.append("product_name", productName);
    if (productBarcode) formData.append("product_barcode", productBarcode);
    if (mealCategory) formData.append("meal_category", mealCategory);
    if (mealTime) formData.append("meal_time", mealTime);

    try {
      await createDailyLog(formData);
      setSuccess("Meal logged successfully!");
      resetForm();
      // Refresh the page to show the new log in the list
      router.refresh();
    } catch (err) {
      console.error("Error saving meal log:", err);
      setError("Failed to log meal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Manual Barcode Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Product Lookup</CardTitle>
          <CardDescription>
            Enter a barcode to look up product information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter barcode (e.g., 5000112546415)"
              value={lookupBarcode}
              onChange={(e) => setLookupBarcode(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleBarcodeLookup}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                "Looking up..."
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup
                </>
              )}
            </Button>
          </div>

          {/* Display product name prominently when found */}
          {productName && productBarcode && (
            <div className="mt-4 p-4 bg-primary/10 rounded-md">
              <h3 className="font-medium text-lg text-primary">
                {productName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Barcode: {productBarcode}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mt-2">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm mt-2">
              {success}
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 2: Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Information about the scanned product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_barcode">Barcode</Label>
                <Input
                  id="product_barcode"
                  value={productBarcode}
                  onChange={(e) => setProductBarcode(e.target.value)}
                  placeholder="Enter barcode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_category">
                  <Utensils className="inline-block mr-1 h-4 w-4" /> Meal
                  Category
                </Label>
                <Select value={mealCategory} onValueChange={setMealCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="drink">Drink</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_time">
                  <Clock className="inline-block mr-1 h-4 w-4" /> Time Consumed
                </Label>
                <Input
                  id="meal_time"
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sugar_intake">Sugar Content (grams)</Label>
                <Input
                  id="sugar_intake"
                  type="number"
                  min="0"
                  step="0.1"
                  value={sugarIntake}
                  onChange={(e) => setSugarIntake(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {scannedProduct && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h4 className="font-medium mb-2">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="md:col-span-2">
                    <span className="font-medium">Product Name:</span>{" "}
                    {scannedProduct.name}
                  </div>
                  {scannedProduct.brand && (
                    <div>
                      <span className="text-muted-foreground">Brand:</span>{" "}
                      {scannedProduct.brand}
                    </div>
                  )}
                  {scannedProduct.nutrition.sugarPer100g && (
                    <div>
                      <span className="text-muted-foreground">
                        Sugar per 100g:
                      </span>{" "}
                      {scannedProduct.nutrition.sugarPer100g}g
                    </div>
                  )}
                  {scannedProduct.nutrition.caloriesPer100g && (
                    <div>
                      <span className="text-muted-foreground">
                        Calories per 100g:
                      </span>{" "}
                      {scannedProduct.nutrition.caloriesPer100g}kcal
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Track your health and well-being</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="20"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood (1-10)</Label>
                  <Input
                    id="mood"
                    type="number"
                    min="1"
                    max="10"
                    value={moodRating}
                    onChange={(e) => setMoodRating(e.target.value)}
                    placeholder="1-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Very bad, 10 = Excellent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cravings">Sugar Cravings (1-10)</Label>
                  <Input
                    id="cravings"
                    type="number"
                    min="1"
                    max="10"
                    value={cravingsRating}
                    onChange={(e) => setCravingsRating(e.target.value)}
                    placeholder="1-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = No cravings, 10 = Extreme cravings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energy">Energy Level (1-10)</Label>
                  <Input
                    id="energy"
                    type="number"
                    min="1"
                    max="10"
                    value={energyRating}
                    onChange={(e) => setEnergyRating(e.target.value)}
                    placeholder="1-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Exhausted, 10 = Very energetic
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep">Sleep Quality (1-10)</Label>
                  <Input
                    id="sleep"
                    type="number"
                    min="1"
                    max="10"
                    value={sleepRating}
                    onChange={(e) => setSleepRating(e.target.value)}
                    placeholder="1-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Very poor, 10 = Excellent
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about your day..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : existingLog ? "Update Log" : "Save Log"}
        </Button>
      </form>
    </div>
  );
}
