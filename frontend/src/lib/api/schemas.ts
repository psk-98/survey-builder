import { z } from "zod"
export const userSchema = z.object({
	email: z.string(),
	username: z.string(),
	role: z.enum(["user", "admin"]),
})
export const definitionSchema = z.object({
	schemaVersion: z.literal(1).default(1),
	title: z.string(),
	startNodeId: z.string(),
	nodes: z.array(
		z.object({
			id: z.string(),
			type: z.enum(["start", "text", "options", "end"]),
			position: z.object({ x: z.number(), y: z.number() }),
			data: z.object({
				label: z.string(),
				content: z
					.string()
					.nullish()
					.transform((v) => v ?? ""),
				options: z
					.array(z.object({ id: z.string(), label: z.string() }))
					.default([]),
			}),
		}),
	),
	edges: z.array(
		z.object({
			id: z.string(),
			source: z.string(),
			target: z.string(),
			sourceHandle: z
				.string()
				.nullish()
				.transform((v) => v ?? null),
		}),
	),
})
export const surveySchema = z.object({
	id: z.number().int(),
	name: z.string(),
	survey_definition: definitionSchema,
})
export const interactionSchema = z.object({
	id: z.string(),
	survey_id: z.string(),
	answers: z.array(
		z.object({
			node_id: z.string(),
			question: z.string(),
			type: z.string(),
			answer: z.union([
				z.string(),
				z.object({ id: z.string(), label: z.string() }),
			]),
		}),
	),
	current_step: z.string(),
	completed: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
})
export type User = z.infer<typeof userSchema>
export type Survey = z.infer<typeof surveySchema>
export type Interaction = z.infer<typeof interactionSchema>
