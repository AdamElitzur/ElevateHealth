import { getDailyLogs } from "@/app/actions/daily-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Utensils, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FoodEntries() {
  const logs = await getDailyLogs();

  // Filter to only logs with product_name
  const foodLogs = logs.filter((log) => log.product_name);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Food Entries</h2>
        <Link href="/dashboard/log">
          <Button size="sm">Log Food</Button>
        </Link>
      </div>

      {foodLogs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No food entries yet. Start logging your food intake.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {foodLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{log.product_name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.date), "PPP")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {log.sugar_intake_grams !== null && (
                    <div>
                      <span className="text-muted-foreground block">Sugar</span>
                      {log.sugar_intake_grams}g
                    </div>
                  )}

                  {log.meal_category && (
                    <div>
                      <span className="text-muted-foreground block">
                        <Utensils className="inline mr-1 h-3 w-3" /> Category
                      </span>
                      {log.meal_category.charAt(0).toUpperCase() +
                        log.meal_category.slice(1)}
                    </div>
                  )}

                  {log.meal_time && (
                    <div>
                      <span className="text-muted-foreground block">
                        <Clock className="inline mr-1 h-3 w-3" /> Time
                      </span>
                      {log.meal_time}
                    </div>
                  )}

                  {log.product_barcode && (
                    <div>
                      <span className="text-muted-foreground block">
                        Barcode
                      </span>
                      {log.product_barcode}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
