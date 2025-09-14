"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import {
  lookupProduct,
  ProductInfo,
  formatNutritionValue,
  getNutritionGradeColor,
  getNovaGroupDescription,
} from "@/lib/product-lookup";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string, productInfo?: ProductInfo) => void;
}

export default function BarcodeScannerComponent({
  onBarcodeDetected,
}: BarcodeScannerProps) {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [lookupError, setLookupError] = useState<string>("");
  const [detectionError, setDetectionError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeDetected = async (barcode: string) => {
    setIsLookingUp(true);
    setLookupError("");
    setProductInfo(null);

    try {
      const product = await lookupProduct(barcode);

      if (product) {
        setProductInfo(product);
        onBarcodeDetected(barcode, product);
      } else {
        setLookupError("Product not found in database");
        onBarcodeDetected(barcode);
      }
    } catch (err) {
      console.error("Error looking up product:", err);
      setLookupError("Error looking up product information");
      onBarcodeDetected(barcode);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setDetectionError("");
      // For file upload, we'll use a simple approach
      // In a real implementation, you might want to use a different library for file-based detection
      const reader = new FileReader();
      reader.onload = (event) => {
        // This is a placeholder - react-barcode-scanner is primarily for camera scanning
        // For file upload, you might need a different approach or library
        setDetectionError(
          "File upload detection not implemented. Please use camera scanning or manual entry."
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setDetectionError("Error processing image. Please try again.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      await handleBarcodeDetected(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  const handleScan = (result: any) => {
    if (result && result.text) {
      handleBarcodeDetected(result.text);
      setIsScannerActive(false);
    }
  };

  const handleError = (error: any) => {
    console.error("Barcode scanner error:", error);
    setDetectionError(
      "Camera access denied or scanner error. Please check permissions."
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scan Product Barcode</CardTitle>
        <CardDescription>
          Scan a barcode to get product information and sugar content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isScannerActive ? (
          <div className="relative">
            <BarcodeScanner
              onUpdate={(err, result) => {
                if (result) {
                  handleScan(result);
                } else if (err) {
                  handleError(err);
                }
              }}
              width={480}
              height={320}
              style={{
                width: "100%",
                height: "256px",
                borderRadius: "0.375rem",
                backgroundColor: "#f3f4f6",
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setIsScannerActive(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/50 text-white text-center py-2 px-4 rounded-md">
                <p className="text-sm">Point your camera at a barcode</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setIsScannerActive(true)}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="manual-barcode" className="sr-only">
                  Enter Barcode Manually
                </Label>
                <Input
                  id="manual-barcode"
                  placeholder="Enter barcode number"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLookingUp}>
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Error Messages */}
        {detectionError && (
          <div className="mt-4 p-4 border rounded-md bg-destructive/10 text-destructive">
            <p className="font-medium">Detection Error</p>
            <p className="text-sm">{detectionError}</p>
          </div>
        )}

        {/* Product Information Display */}
        {isLookingUp && (
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Looking up product information...</span>
            </div>
          </div>
        )}

        {lookupError && (
          <div className="mt-4 p-4 border rounded-md bg-destructive/10 text-destructive">
            <p className="font-medium">Error</p>
            <p className="text-sm">{lookupError}</p>
          </div>
        )}

        {productInfo && (
          <div className="mt-4 space-y-4">
            <div className="p-4 border rounded-md bg-green-50">
              <div className="flex items-start space-x-3">
                {productInfo.imageUrl && (
                  <img
                    src={productInfo.imageUrl}
                    alt={productInfo.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{productInfo.name}</h3>
                  {productInfo.brand && (
                    <p className="text-sm text-muted-foreground">
                      {productInfo.brand}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Barcode: {productInfo.barcode}
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium text-sm mb-2">Sugar Content</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Per 100g:</span>{" "}
                    {formatNutritionValue(productInfo.nutrition.sugarPer100g)}
                  </p>
                  {productInfo.nutrition.sugarPerServing && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Per serving:
                      </span>{" "}
                      {formatNutritionValue(
                        productInfo.nutrition.sugarPerServing
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 border rounded-md">
                <h4 className="font-medium text-sm mb-2">Calories</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Per 100g:</span>{" "}
                    {formatNutritionValue(
                      productInfo.nutrition.caloriesPer100g,
                      "kcal"
                    )}
                  </p>
                  {productInfo.nutrition.caloriesPerServing && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Per serving:
                      </span>{" "}
                      {formatNutritionValue(
                        productInfo.nutrition.caloriesPerServing,
                        "kcal"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Nutrition Info */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {productInfo.nutrition.fatPer100g && (
                <div className="p-2 border rounded text-center">
                  <p className="font-medium">
                    {formatNutritionValue(productInfo.nutrition.fatPer100g)}
                  </p>
                  <p className="text-muted-foreground">Fat</p>
                </div>
              )}
              {productInfo.nutrition.proteinPer100g && (
                <div className="p-2 border rounded text-center">
                  <p className="font-medium">
                    {formatNutritionValue(productInfo.nutrition.proteinPer100g)}
                  </p>
                  <p className="text-muted-foreground">Protein</p>
                </div>
              )}
              {productInfo.nutrition.carbsPer100g && (
                <div className="p-2 border rounded text-center">
                  <p className="font-medium">
                    {formatNutritionValue(productInfo.nutrition.carbsPer100g)}
                  </p>
                  <p className="text-muted-foreground">Carbs</p>
                </div>
              )}
            </div>

            {/* Nutrition Grade and Processing Level */}
            <div className="flex space-x-4 text-sm">
              {productInfo.nutritionGrade && (
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">
                    Nutrition Grade:
                  </span>
                  <span
                    className={`font-bold ${getNutritionGradeColor(
                      productInfo.nutritionGrade
                    )}`}
                  >
                    {productInfo.nutritionGrade.toUpperCase()}
                  </span>
                </div>
              )}
              {productInfo.novaGroup && (
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">Processing:</span>
                  <span className="font-medium">
                    NOVA {productInfo.novaGroup}
                  </span>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {productInfo.ingredients && productInfo.ingredients.length > 0 && (
              <div className="p-3 border rounded-md">
                <h4 className="font-medium text-sm mb-2">Ingredients</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {productInfo.ingredients.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
