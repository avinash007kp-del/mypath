import { connectToDatabase } from "@/lib/mongodb";
import AIConversation from "@/models/AIConversation";
import AIMessage from "@/models/AIMessage";
import { AIChatInput } from "@/lib/validations/ai";
import { IAIMessage, IAIConversation } from "@/types/ai";
import { getLLMProvider } from "./providers/openai";
import { getUserLearningContext, formatContextForPrompt } from "./context-builder";

export async function sendChatMessageService(
  input: AIChatInput,
  userId?: string
): Promise<{
  conversation: IAIConversation;
  userMessage: IAIMessage;
  assistantMessage: IAIMessage;
  isFallback: boolean;
}> {
  await connectToDatabase();
  const provider = getLLMProvider();

  let conversationDoc = input.conversationId
    ? await AIConversation.findById(input.conversationId)
    : null;

  if (!conversationDoc) {
    // Generate clean short title from first message
    const cleanTitle =
      input.message.length > 40 ? input.message.substring(0, 37) + "..." : input.message;

    conversationDoc = await AIConversation.create({
      title: cleanTitle,
      userId,
      mode: input.mode || "general",
      contextRoadmapId: input.contextRoadmapId,
      contextNodeId: input.contextNodeId,
      messageCount: 0,
    });
  }

  const conversationId = conversationDoc._id.toString();

  // Save user message
  const userMsgDoc = await AIMessage.create({
    conversationId,
    role: "user",
    content: input.message,
    metadata: {
      actionType: input.mode,
    },
  });

  // Fetch recent conversation history (up to last 10 messages)
  const historyDocs = await AIMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();

  // Build context
  const userContext = await getUserLearningContext(input.contextRoadmapId);
  const contextString = formatContextForPrompt(userContext);

  const systemPrompt = `You are MyPath AI, an expert software architect, engineering mentor, and personalized learning guide.
You help developers master their learning roadmaps, understand complex architectural concepts, overcome debugging blocks, and build production-grade projects.

Current Mode: ${input.mode.toUpperCase()}
${contextString}

Guidelines:
- Provide clear, structured, well-formatted answers with markdown headings, bullet points, and code snippets where appropriate.
- Give concrete, actionable advice rather than vague platitudes.
- Reference the user's active roadmaps and completed topics when giving recommendations.
- Keep tone professional, encouraging, and focused on technical excellence.`;

  // Format prompt including conversation history
  let conversationPrompt = "";
  for (const msg of historyDocs as any[]) {
    if (msg.role === "user") {
      conversationPrompt += `User: ${msg.content}\n\n`;
    } else if (msg.role === "assistant") {
      conversationPrompt += `Assistant: ${msg.content}\n\n`;
    }
  }

  // Generate response
  const response = await provider.generateText(conversationPrompt, {
    systemPrompt,
    temperature: 0.7,
  });

  // Save assistant message
  const assistantMsgDoc = await AIMessage.create({
    conversationId,
    role: "assistant",
    content: response.content,
    metadata: {
      model: response.model,
      tokensUsed: response.totalTokens,
      actionType: input.mode,
    },
  });

  // Update conversation doc
  conversationDoc.messageCount += 2;
  conversationDoc.lastMessageAt = new Date();
  if (conversationDoc.title === "New Chat" && input.message) {
    conversationDoc.title =
      input.message.length > 40 ? input.message.substring(0, 37) + "..." : input.message;
  }
  await conversationDoc.save();

  return {
    conversation: {
      _id: conversationDoc._id.toString(),
      title: conversationDoc.title,
      userId: conversationDoc.userId,
      mode: conversationDoc.mode,
      contextRoadmapId: conversationDoc.contextRoadmapId,
      contextNodeId: conversationDoc.contextNodeId,
      messageCount: conversationDoc.messageCount,
      lastMessageAt: conversationDoc.lastMessageAt?.toISOString(),
      createdAt: conversationDoc.createdAt.toISOString(),
      updatedAt: conversationDoc.updatedAt.toISOString(),
    },
    userMessage: {
      _id: userMsgDoc._id.toString(),
      conversationId,
      role: "user",
      content: userMsgDoc.content,
      createdAt: userMsgDoc.createdAt.toISOString(),
    },
    assistantMessage: {
      _id: assistantMsgDoc._id.toString(),
      conversationId,
      role: "assistant",
      content: assistantMsgDoc.content,
      metadata: assistantMsgDoc.metadata,
      createdAt: assistantMsgDoc.createdAt.toISOString(),
    },
    isFallback: response.isFallback,
  };
}

export async function getConversationWithMessages(conversationId: string) {
  await connectToDatabase();

  const conversation = await AIConversation.findById(conversationId).lean();
  if (!conversation) {
    return null;
  }

  const messages = await AIMessage.find({ conversationId }).sort({ createdAt: 1 }).lean();

  return {
    conversation: {
      ...(conversation as any),
      _id: (conversation as any)._id.toString(),
    },
    messages: (messages as any[]).map((m) => ({
      ...m,
      _id: m._id.toString(),
    })),
  };
}

export async function listConversations(limit: number = 20) {
  await connectToDatabase();

  const conversations = await AIConversation.find().sort({ updatedAt: -1 }).limit(limit).lean();

  return (conversations as any[]).map((c) => ({
    ...c,
    _id: c._id.toString(),
  }));
}

export async function deleteConversation(conversationId: string) {
  await connectToDatabase();

  await Promise.all([
    AIConversation.findByIdAndDelete(conversationId),
    AIMessage.deleteMany({ conversationId }),
  ]);

  return { success: true };
}
