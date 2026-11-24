import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Roadmap from "@/models/Roadmap";
import Activity from "@/models/Activity";
import { successResponse, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const sampleRoadmaps = [
  {
    title: "Full-Stack Next.js & React Mastery",
    description:
      "Comprehensive path from modern React 18/19 fundamentals to full-stack Next.js App Router, Server Actions, TypeScript, and high-scale production deployment.",
    category: "Web Development",
    difficulty: "Intermediate",
    estimatedDuration: "12 weeks",
    icon: "⚡",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "FullStack"],
    totalTopics: 24,
    completedTopics: 18,
    progress: 75,
  },
  {
    title: "AI & Large Language Models Engineering",
    description:
      "Hands-on guide to transformers, prompt engineering, RAG pipelines, fine-tuning open source models (Llama, Mistral), and deploying agentic workflows.",
    category: "AI & Machine Learning",
    difficulty: "Advanced",
    estimatedDuration: "16 weeks",
    icon: "🧠",
    tags: ["AI", "PyTorch", "LLMs", "RAG", "LangChain"],
    totalTopics: 30,
    completedTopics: 12,
    progress: 40,
  },
  {
    title: "Computer Science & Systems Architecture",
    description:
      "Foundational computer science concepts: data structures, algorithms, operating systems, networking, distributed storage, and cache design.",
    category: "Computer Science",
    difficulty: "Intermediate",
    estimatedDuration: "10 weeks",
    icon: "💻",
    tags: ["Algorithms", "DataStructures", "Systems", "Networking"],
    totalTopics: 20,
    completedTopics: 8,
    progress: 40,
  },
  {
    title: "Data Science & Analytical Engineering",
    description:
      "Statistical modeling, Pandas, Polars, exploratory data analysis, feature engineering, and automated ML pipelines.",
    category: "Data Science",
    difficulty: "Beginner",
    estimatedDuration: "8 weeks",
    icon: "📊",
    tags: ["Python", "Pandas", "Statistics", "SQL"],
    totalTopics: 16,
    completedTopics: 4,
    progress: 25,
  },
  {
    title: "Embedded Systems & Firmware Development",
    description:
      "Modern bare-metal C/C++ and Rust for ARM Cortex-M microcontrollers, RTOS kernels, I2C/SPI protocols, and hardware debugging.",
    category: "Embedded Systems",
    difficulty: "Advanced",
    estimatedDuration: "14 weeks",
    icon: "⚙️",
    tags: ["C++", "Rust", "RTOS", "ARM", "Firmware"],
    totalTopics: 22,
    completedTopics: 5,
    progress: 23,
  },
];

export async function POST() {
  try {
    await connectToDatabase();

    // Check if roadmaps already exist
    const count = await Roadmap.countDocuments();
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already contains ${count} roadmaps. No seeding needed.`,
        seeded: false,
      });
    }

    // Insert sample roadmaps
    const createdRoadmaps = await Roadmap.insertMany(sampleRoadmaps);

    // Seed activity for the past 7 days
    await Activity.deleteMany({});
    const today = new Date();
    const activitiesToInsert = [];

    const hoursPerDay = [2.5, 3.5, 1.8, 4.0, 2.0, 3.0, 1.5]; // last 7 days
    const topicsPerDay = [2, 3, 1, 4, 1, 2, 1];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(12, 0, 0, 0);

      const dayIdx = 6 - i;
      activitiesToInsert.push({
        date: d,
        hours: hoursPerDay[dayIdx],
        topicsCovered: topicsPerDay[dayIdx],
        roadmapId: createdRoadmaps[0]._id,
        notes: "Learning session and roadmap milestone progress.",
      });
    }

    await Activity.insertMany(activitiesToInsert);

    return successResponse(
      { roadmapsCount: createdRoadmaps.length, activitiesCount: activitiesToInsert.length },
      201,
      "Sample roadmaps and activity data successfully seeded."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
