import { getProfile } from "@/app/actions/onboarding";
import { getDailyLogs } from "@/app/actions/daily-log";
import { format, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// Import local components
// Import local components
import ChallengeProgress from "./challenge-progress";
import SugarIntakeChart from "./sugar-intake-chart";
// Simple placeholder components to prevent errors
const MoodEnergyCorrelation = () => (
  <div className="p-4 border rounded-lg">
    <h3 className="font-medium mb-2">Mood & Energy</h3>
    <p className="text-sm text-muted-foreground">Mood and energy correlation chart will be displayed here.</p>
  </div>
);

interface WeightTrackerProps {
  logs: any[];
  initialWeight?: number;
  goalWeight?: number;
}

const WeightTracker = ({ logs, initialWeight, goalWeight }: WeightTrackerProps) => (
  <div className="p-4 border rounded-lg">
    <h3 className="font-medium mb-2">Weight Tracker</h3>
    {initialWeight && (
      <p className="text-sm">
        Starting weight: {initialWeight}kg
        {goalWeight ? ` | Goal: ${goalWeight}kg` : ''}
      </p>
    )}
    <p className="text-sm text-muted-foreground mt-2">
      {logs.length > 0 
        ? `Latest weight: ${logs[0].weight_kg || 'N/A'}kg`
        : 'No weight entries yet.'}
    </p>
  </div>
);
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { profile, error } = await getProfile();

  // Handle errors or redirect to onboarding if no profile exists
  if (error || !profile) {
    console.error('Error fetching profile:', error);
    redirect("/onboarding");
  }

  // Get daily logs for the user
  const dailyLogs = await getDailyLogs();

  // Calculate days into challenge (default to today if no start date)
  const startDate = profile.challenge_start_date 
    ? new Date(profile.challenge_start_date) 
    : new Date();
  const today = new Date();
  
  // Calculate progress
  const totalDays = 14; // 2-week challenge
  const daysCompleted = Math.min(differenceInDays(today, startDate), totalDays);
  const progressPercentage = Math.round((daysCompleted / totalDays) * 100);
  
  // Calculate end date (14 days from start)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + totalDays);

  // Calculate stats
  const totalSugarIntake = dailyLogs.reduce(
    (total, log) => total + (log.sugar_intake_grams || 0),
    0
  );
  const averageSugarIntake =
    dailyLogs.length > 0 ? totalSugarIntake / dailyLogs.length : 0;

  // Get latest log metrics
  const latestLog = dailyLogs[0]; // Logs are ordered by date desc

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress in the 2-week no sugar challenge
        </p>
      </div>

      {/* Challenge Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Challenge Progress</CardTitle>
          <CardDescription>
            Day {daysCompleted} of 14 in your no sugar challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Started: {format(startDate, "PPP")}
              </span>
              <span>
                Ends: {format(endDate, "PPP")}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{daysCompleted} days complete</span>
              <span>{totalDays - daysCompleted} days remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Sugar Intake</CardDescription>
            <CardTitle className="text-3xl">
              {averageSugarIntake.toFixed(1)}g
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weight Change</CardDescription>
            <CardTitle className="text-3xl">
              {latestLog && profile.initial_weight_kg
                ? (latestLog.weight_kg! - profile.initial_weight_kg).toFixed(1)
                : "0"}
              kg
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Mood Rating</CardDescription>
            <CardTitle className="text-3xl">
              {latestLog?.mood_rating || "-"}/10
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Energy Level</CardDescription>
            <CardTitle className="text-3xl">
              {latestLog?.energy_rating || "-"}/10
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts - placeholders for now */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sugar Intake Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <SugarIntakeChart logs={dailyLogs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightTracker
              logs={dailyLogs}
              initialWeight={profile.initial_weight_kg}
              goalWeight={profile.goal_weight_kg}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood & Energy Correlation</CardTitle>
          <CardDescription>
            See how your mood and energy levels are affected by sugar intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MoodEnergyCorrelation />
        </CardContent>
      </Card>
    </div>
  );
}
