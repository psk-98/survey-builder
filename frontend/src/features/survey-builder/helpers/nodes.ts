import type { XYPosition } from "@xyflow/react"
import type { AddableKind, SurveyNode } from "../types"
export function createSurveyNode(
	kind: AddableKind,
	id: string,
	position: XYPosition,
): SurveyNode {
	return {
		id,
		type: kind,
		position,
		selected: true,
		data: {
			label:
				kind === "end"
					? "Thank you!"
					: kind === "text"
						? "Your message"
						: "Your question",
			content: "",
			options:
				kind === "options"
					? [
							{ id: "option_1", label: "Option 1" },
							{ id: "option_2", label: "Option 2" },
						]
					: [],
		},
	}
}
