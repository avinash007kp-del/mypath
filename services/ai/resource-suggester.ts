import { AIResourceItem, ResourceSuggestionResponse } from "@/types/ai";
import { SuggestResourcesInput } from "@/lib/validations/ai";
import { getLLMProvider } from "./providers/openai";

// Curated verified domains and trusted sources
const TRUSTED_DOMAINS = [
  "developer.mozilla.org",
  "react.dev",
  "nextjs.org",
  "typescriptlang.org",
  "docs.python.org",
  "nodejs.org",
  "mongodb.com",
  "postgresql.org",
  "kubernetes.io",
  "docker.com",
  "pytorch.org",
  "freecodecamp.org",
  "roadmap.sh",
  "github.com",
  "web.dev",
];

export async function suggestResourcesService(
  input: SuggestResourcesInput
): Promise<ResourceSuggestionResponse> {
  const provider = getLLMProvider();
  const encodedQuery = encodeURIComponent(input.topicTitle);

  const prompt = `Provide the top 4 to 6 authoritative, high-quality learning resources for the topic: "${input.topicTitle}".
Difficulty: ${input.difficulty}
Category: ${input.category || "Software Engineering"}

CRITICAL RULES FOR URL ACCURACY:
1. ONLY provide real, working URLs. Do NOT hallucinate non-existent specific paths or URLs.
2. If citing official documentation, use verified root documentation URLs (e.g., https://developer.mozilla.org, https://react.dev, https://nextjs.org/docs, https://typescriptlang.org/docs).
3. If citing tutorials or guides, cite well-known established platforms (e.g., freeCodeCamp, MDN, official guides).
4. If a specific deep link cannot be verified with 100% certainty, provide a search query URL on a trusted domain like https://developer.mozilla.org/en-US/search?q=${encodedQuery} or https://github.com/topics/${encodedQuery.toLowerCase()}.
5. Include author/platform, estimated study duration, whether it is free (true/false), and difficulty rating.`;

  const schemaInstruction = `Schema definition:
{
  "summary": string,
  "resources": [
    {
      "title": string,
      "url": string,
      "domain": string,
      "type": "Official Doc" | "Course" | "Interactive Tutorial" | "Video" | "Article" | "Book" | "Cheatsheet" | "Project Repo",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedDuration": string,
      "description": string,
      "free": boolean,
      "authorOrPlatform": string,
      "isVerified": boolean
    }
  ]
}`;

  const fallback = (): { summary: string; resources: AIResourceItem[] } => {
    const topic = input.topicTitle;
    const lowerTopic = topic.toLowerCase();

    const curated: AIResourceItem[] = [];

    // Official Docs
    if (lowerTopic.includes("react")) {
      curated.push({
        title: "React Official Documentation & Interactive Guides",
        url: "https://react.dev/learn",
        domain: "react.dev",
        type: "Official Doc",
        difficulty: "Intermediate",
        estimatedDuration: "10 hours",
        description:
          "The authoritative, interactive guide covering modern React components, hooks, and best practices.",
        free: true,
        authorOrPlatform: "React Core Team",
        isVerified: true,
      });
    } else if (lowerTopic.includes("next")) {
      curated.push({
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs/app",
        domain: "nextjs.org",
        type: "Official Doc",
        difficulty: "Intermediate",
        estimatedDuration: "8 hours",
        description:
          "Comprehensive official documentation for Next.js App Router, Server Components, and Server Actions.",
        free: true,
        authorOrPlatform: "Vercel",
        isVerified: true,
      });
    } else if (lowerTopic.includes("typescript")) {
      curated.push({
        title: "TypeScript Official Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        domain: "typescriptlang.org",
        type: "Official Doc",
        difficulty: "Intermediate",
        estimatedDuration: "6 hours",
        description:
          "Complete handbook explaining static types, generics, conditional types, and compiler flags.",
        free: true,
        authorOrPlatform: "Microsoft",
        isVerified: true,
      });
    } else if (
      lowerTopic.includes("python") ||
      lowerTopic.includes("machine learning") ||
      lowerTopic.includes("ai")
    ) {
      curated.push({
        title: "PyTorch Deep Learning Tutorials",
        url: "https://pytorch.org/tutorials/",
        domain: "pytorch.org",
        type: "Official Doc",
        difficulty: "Intermediate",
        estimatedDuration: "12 hours",
        description:
          "Official tutorials covering PyTorch tensors, autograd, neural networks, and model training.",
        free: true,
        authorOrPlatform: "PyTorch Team",
        isVerified: true,
      });
    } else {
      curated.push({
        title: `MDN Web Docs: ${topic}`,
        url: `https://developer.mozilla.org/en-US/search?q=${encodedQuery}`,
        domain: "developer.mozilla.org",
        type: "Official Doc",
        difficulty: input.difficulty,
        estimatedDuration: "4 hours",
        description: `Authoritative web standards and API documentation for ${topic}.`,
        free: true,
        authorOrPlatform: "Mozilla Developer Network",
        isVerified: true,
      });
    }

    // Community / Interactive
    curated.push({
      title: `freeCodeCamp: ${topic} Comprehensive Guide`,
      url: `https://www.freecodecamp.org/news/search/?query=${encodedQuery}`,
      domain: "freecodecamp.org",
      type: "Course",
      difficulty: "Beginner",
      estimatedDuration: "6 hours",
      description: `In-depth technical tutorials, coding exercises, and conceptual walkthroughs for ${topic}.`,
      free: true,
      authorOrPlatform: "freeCodeCamp",
      isVerified: true,
    });

    // Roadmap.sh community guide
    curated.push({
      title: `roadmap.sh Developer Guides: ${topic}`,
      url: "https://roadmap.sh/guides",
      domain: "roadmap.sh",
      type: "Interactive Tutorial",
      difficulty: "Intermediate",
      estimatedDuration: "3 hours",
      description: `Visual roadmaps, architectural breakdowns, and best practice checklists for software engineers.`,
      free: true,
      authorOrPlatform: "roadmap.sh",
      isVerified: true,
    });

    // Open-source project repositories
    curated.push({
      title: `GitHub Curated Repositories & Real-World Projects: ${topic}`,
      url: `https://github.com/topics/${encodedQuery.toLowerCase()}`,
      domain: "github.com",
      type: "Project Repo",
      difficulty: "Advanced",
      estimatedDuration: "8 hours",
      description: `Browse top-starred production repositories, reference architectures, and open-source implementations.`,
      free: true,
      authorOrPlatform: "GitHub Open Source",
      isVerified: true,
    });

    return {
      summary: `Discovered 4 authoritative, verified resources for "${topic}". All links point to trusted developer platforms with zero fabricated domains.`,
      resources: curated,
    };
  };

  const response = await provider.generateJSON<{ summary: string; resources: AIResourceItem[] }>(
    prompt,
    schemaInstruction,
    fallback
  );

  // Validate URLs and domains
  const cleanedResources: AIResourceItem[] = (response.data.resources || []).map((res) => {
    let domain = res.domain;
    try {
      if (res.url) {
        domain = new URL(res.url).hostname;
      }
    } catch {
      domain = res.domain || "developer.mozilla.org";
    }

    const isTrusted = TRUSTED_DOMAINS.some((td) => domain.includes(td));

    return {
      title: res.title || input.topicTitle,
      url: res.url || `https://developer.mozilla.org/en-US/search?q=${encodedQuery}`,
      domain: domain.replace("www.", ""),
      type: res.type || "Article",
      difficulty: res.difficulty || input.difficulty,
      estimatedDuration: res.estimatedDuration || "3 hours",
      description: res.description || `Learning resource covering ${input.topicTitle}.`,
      free: res.free ?? true,
      authorOrPlatform: res.authorOrPlatform || domain,
      isVerified: isTrusted,
    };
  });

  return {
    topicTitle: input.topicTitle,
    category: input.category,
    summary: response.data.summary || `Verified resources for ${input.topicTitle}`,
    resources: cleanedResources,
  };
}
