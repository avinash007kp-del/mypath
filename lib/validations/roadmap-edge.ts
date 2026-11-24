import { z } from "zod";
import { roadmapNodeSchema } from "./roadmap-node";

export const roadmapEdgeSchema = z
  .object({
    sourceNodeId: z.string().min(1, "Source node ID is required."),
    targetNodeId: z.string().min(1, "Target node ID is required."),
    label: z.string().max(50).optional(),
    type: z.string().default("smoothstep"),
    animated: z.boolean().default(false),
  })
  .refine((data) => data.sourceNodeId !== data.targetNodeId, {
    message: "A node cannot connect to itself.",
    path: ["targetNodeId"],
  });

export const updateRoadmapEdgeSchema = z.object({
  label: z.string().max(50).optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
});

export const roadmapViewportSchema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  zoom: z.coerce.number().min(0.05).max(5),
});

export const roadmapGraphBatchSchema = z.object({
  nodes: z.array(
    roadmapNodeSchema.extend({
      _id: z.string().optional(),
    })
  ),
  edges: z.array(
    z.object({
      _id: z.string().optional(),
      sourceNodeId: z.string().min(1),
      targetNodeId: z.string().min(1),
      label: z.string().max(50).optional(),
      type: z.string().default("smoothstep"),
      animated: z.boolean().default(false),
    })
  ),
  viewport: roadmapViewportSchema.optional(),
});

export type RoadmapEdgeInput = z.infer<typeof roadmapEdgeSchema>;
export type RoadmapViewportInput = z.infer<typeof roadmapViewportSchema>;
export type RoadmapGraphBatchInput = z.infer<typeof roadmapGraphBatchSchema>;
