import type { Edge } from "@xyflow/react"
import type { SurveyNode } from "./types"
export const initialNodes: SurveyNode[] = [
	{
		id: "start",
		type: "start",
		position: { x: 60, y: 180 },
		deletable: false,
		data: {
			label: "Welcome",
			content: "A little feedback goes a long way.",
			options: [],
		},
	},
	{
		id: "intro",
		type: "text",
		position: { x: 390, y: 180 },
		data: {
			label: "Before we begin",
			content:
				"We’d love to hear about your experience. This survey takes about 2 minutes.",
			options: [],
		},
	},
	{
		id: "question",
		type: "options",
		position: { x: 730, y: 140 },
		data: {
			label: "How was your experience?",
			content: "Choose the option that fits best.",
			options: [
				{ id: "option_1", label: "It was great" },
				{ id: "option_2", label: "It was okay" },
				{ id: "option_3", label: "Could be better" },
			],
		},
	},
	{
		id: "end",
		type: "end",
		position: { x: 1090, y: 180 },
		data: {
			label: "Thank you!",
			content: "Your feedback helps us make things better.",
			options: [],
		},
	},
]
export const initialEdges: Edge[] = [
	{ id: "start-intro", source: "start", target: "intro", sourceHandle: "next" },
	{
		id: "intro-question",
		source: "intro",
		target: "question",
		sourceHandle: "next",
	},
	...["option_1", "option_2", "option_3"].map((id) => ({
		id: `question-${id}`,
		source: "question",
		target: "end",
		sourceHandle: id,
	})),
]
