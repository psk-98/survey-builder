import type { SurveyOption } from "../types";
// IDs are scoped to the owning node; existing options are never renumbered.
export function nextOptionId(options: SurveyOption[]): string {
	const highest = options.reduce((max, option) => {
		const match = /^option_(\d+)$/.exec(option.id);
		return match ? Math.max(max, Number(match[1])) : max;
	}, 0);
	return `option_${highest + 1}`;
}
