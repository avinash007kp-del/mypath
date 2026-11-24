import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import Activity, { IActivityDocument } from "@/models/Activity";
import { DashboardStats, LearningActivityData, ActivityDay } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  const totalRoadmaps = await Roadmap.countDocuments();

  // Aggregate topics from roadmaps
  const topicStats = await Roadmap.aggregate([
    {
      $group: {
        _id: null,
        totalCompleted: { $sum: "$completedTopics" },
        totalTopics: { $sum: "$totalTopics" },
        inProgressTopics: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ["$completedTopics", 0] },
                  { $lt: ["$completedTopics", "$totalTopics"] },
                ],
              },
              { $subtract: ["$totalTopics", "$completedTopics"] },
              0,
            ],
          },
        },
      },
    },
  ]);

  const topicsCompleted = topicStats[0]?.totalCompleted || 0;
  // If there are roadmaps with totalTopics > completedTopics, topicsInProgress are either active remaining topics or roadmaps in progress
  const topicsInProgress = topicStats[0]?.inProgressTopics || 0;

  // Aggregate hours from Activity collection
  const activityHours = await Activity.aggregate([
    {
      $group: {
        _id: null,
        totalHours: { $sum: "$hours" },
      },
    },
  ]);

  const totalLearningHours = activityHours[0]?.totalHours
    ? Number(activityHours[0].totalHours.toFixed(1))
    : 0;

  return {
    totalRoadmaps,
    topicsCompleted,
    topicsInProgress,
    totalLearningHours,
  };
}

export async function getDashboardActivity(): Promise<LearningActivityData> {
  await connectToDatabase();

  // Get last 7 days including today
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData: ActivityDay[] = [];
  const today = new Date();

  // Create dates for last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);

    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];

    // Query MongoDB for activity on this day
    const dayActivities = await Activity.find({
      date: {
        $gte: d,
        $lt: nextD,
      },
    }).lean<IActivityDocument[]>();

    const hours = dayActivities.reduce((acc, curr) => acc + curr.hours, 0);
    const topicsCovered = dayActivities.reduce((acc, curr) => acc + (curr.topicsCovered || 0), 0);

    weeklyData.push({
      day: dayName,
      date: dateStr,
      hours: Number(hours.toFixed(1)),
      topicsCovered,
    });
  }

  const totalHours = weeklyData.reduce((acc, d) => acc + d.hours, 0);
  const activeDaysCount = weeklyData.filter((d) => d.hours > 0).length;

  return {
    weeklyData,
    totalHours: Number(totalHours.toFixed(1)),
    activeDaysCount,
    weeklyTrendPercent: activeDaysCount > 0 ? 12 : 0,
  };
}
