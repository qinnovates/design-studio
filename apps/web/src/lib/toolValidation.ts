import { z } from 'zod';

export const addComponentSchema = z.object({
  componentId: z.string().min(1),
  name: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  variant: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export const addTextSchema = z.object({
  content: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  fontSize: z.number().positive().optional(),
  fontWeight: z.number().min(100).max(900).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  width: z.number().positive().optional(),
});

export const addFrameSchema = z.object({
  name: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive(),
  height: z.number().positive(),
  fill: z.string().optional(),
});

export const modifyElementSchema = z.object({
  nodeId: z.string().min(1),
  updates: z.record(z.string(), z.unknown()),
});

export const removeElementSchema = z.object({
  nodeId: z.string().min(1),
});

export const updateTokenSchema = z.object({
  tokenName: z.string().min(1),
  value: z.string().min(1),
});

export const suggestLayoutSchema = z.object({
  suggestion: z.string().min(1),
  reason: z.string().optional(),
});

export const TOOL_SCHEMAS: Record<string, z.ZodSchema> = {
  add_component: addComponentSchema,
  add_text: addTextSchema,
  add_frame: addFrameSchema,
  modify_element: modifyElementSchema,
  remove_element: removeElementSchema,
  update_token: updateTokenSchema,
  suggest_layout: suggestLayoutSchema,
};

export function validateToolCall(toolName: string, args: unknown): { valid: boolean; data?: any; error?: string } {
  const schema = TOOL_SCHEMAS[toolName];
  if (!schema) {
    return { valid: false, error: `Unknown tool: ${toolName}` };
  }

  const result = schema.safeParse(args);
  if (!result.success) {
    return { valid: false, error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') };
  }

  return { valid: true, data: result.data };
}
