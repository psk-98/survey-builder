import {
	CircleStop,
	ListChecks,
	type LucideIcon,
	Play,
	TextCursorInput,
} from "lucide-react"
import type { SurveyNodeType } from "./types"
export const BLOCKS: Record<
	SurveyNodeType,
	{ label: string; description: string; icon: LucideIcon; color: string }
> = {
	start: {
		label: "Start",
		description: "The beginning of your survey",
		icon: Play,
		color: "bg-emerald-50 text-emerald-700",
	},
	text: {
		label: "Text",
		description: "Share a message or instructions",
		icon: TextCursorInput,
		color: "bg-blue-50 text-blue-700",
	},
	options: {
		label: "Options",
		description: "Ask a question with choices",
		icon: ListChecks,
		color: "bg-amber-50 text-amber-700",
	},
	end: {
		label: "End",
		description: "Wrap up with a final message",
		icon: CircleStop,
		color: "bg-rose-50 text-rose-700",
	},
}
export const BLOCK_KINDS: SurveyNodeType[] = ["start", "text", "options", "end"]
