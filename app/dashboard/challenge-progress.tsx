import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChallengeProgress({ progress }: { progress: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenge Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Day 1</span>
            <span>Day 14</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
