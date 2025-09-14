"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BarcodeScanner from "./barcode-scanner";

export default function DashboardScanner() {
  const router = useRouter();
  const [productBarcode, setProductBarcode] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [sugarContent, setSugarContent] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleBarcodeDetected = async (barcode: string, productInfo?: any) => {
    setProductBarcode(barcode);
    setIsScanning(false);

    if (productInfo) {
      setProductName(productInfo.name);
      // Use sugar per serving if available, otherwise use sugar per 100g
      const sugarContent =
        productInfo.nutrition.sugarPerServing ||
        (productInfo.nutrition.sugarPer100g
          ? productInfo.nutrition.sugarPer100g / 10
          : 0);
      setSugarContent(Math.round(sugarContent * 10) / 10);
    } else {
      // Fallback if no product info
      setProductName(`Product (${barcode.substring(0, 4)})`);
      setSugarContent(0);
    }
  };

  const handleLogProduct = () => {
    // Navigate to log page with product info
    if (productBarcode && productName && sugarContent !== null) {
      router.push(
        `/dashboard/log?barcode=${productBarcode}&name=${encodeURIComponent(
          productName
        )}&sugar=${sugarContent}`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Scan</CardTitle>
        <CardDescription>
          Scan a product barcode to log sugar intake
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isScanning ? (
          <div className="space-y-4">
            <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsScanning(false)}
            >
              Cancel
            </Button>
          </div>
        ) : productBarcode ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="font-medium">{productName}</p>
              <p className="text-sm text-muted-foreground">
                Barcode: {productBarcode}
              </p>
              <p className="text-sm font-medium mt-2">
                Sugar content: {sugarContent}g
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleLogProduct}>
                Log This Product
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setProductBarcode(null);
                  setProductName(null);
                  setSugarContent(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={() => setIsScanning(true)}>
            Scan Barcode
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
