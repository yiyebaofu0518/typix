import z from "zod/v4";

export const TypixGenerateRequestSchema = z.object({
	providerId: z.string(),
	modelId: z.string(),
	n: z.number().int().min(1).default(1).optional(),
	images: z.array(z.string()).optional(), // Optional images for image generation
	prompt: z.string(),
});

export type TypixGenerateRequest = z.infer<typeof TypixGenerateRequestSchema>;

export type TypixChatApiResponse = {
	images: string[]; // Array of generated image base64 strings
};
