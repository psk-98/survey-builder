import type { Interaction, Survey } from "../../lib/api/schemas"
import { checkPaths } from "../survey-builder/helpers/graph.ts"
export function surveyReady(survey: Survey) {
	return checkPaths(
		survey.survey_definition.nodes,
		survey.survey_definition.edges,
	).valid
}
export function filterSurveys(
	items: Survey[],
	search: string,
	status: string,
	sort: string,
) {
	const term = search.trim().toLowerCase()
	return items
		.filter(
			(s) =>
				`${s.name} ${s.survey_definition.name} ${s.id}`
					.toLowerCase()
					.includes(term) &&
				(status === "all" || surveyReady(s) === (status === "ready")),
		)
		.sort(
			(a, b) =>
				(sort === "title"
					? a.survey_definition.name.localeCompare(b.survey_definition.name)
					: sort === "id-asc"
						? a.id - b.id
						: b.id - a.id) || a.id - b.id,
		)
}
export function answerLabel(answer: Interaction["answers"][number]["answer"]) {
	return typeof answer === "string" ? answer : answer.label
}
export function filterInteractions(
	items: Interaction[],
	search: string,
	status: string,
	sort: string,
	date: string,
	now = Date.now(),
) {
	const term = search.trim().toLowerCase()
	const days = Number(date)
	const cutoff = days > 0 ? now - days * 86400000 : -Infinity
	return items
		.filter(
			(i) =>
				`${i.id} ${i.current_step} ${i.answers.map((a) => `${a.question} ${answerLabel(a.answer)}`).join(" ")}`
					.toLowerCase()
					.includes(term) &&
				(status === "all" || i.completed === (status === "completed")) &&
				(cutoff === -Infinity || Date.parse(i.created_at) >= cutoff),
		)
		.sort(
			(a, b) =>
				(sort === "oldest"
					? Date.parse(a.created_at) - Date.parse(b.created_at)
					: sort === "answers"
						? b.answers.length - a.answers.length
						: Date.parse(b.created_at) - Date.parse(a.created_at)) ||
				a.id.localeCompare(b.id),
		)
}
export function formatDate(value: string) {
	const date = new Date(value)
	return Number.isNaN(date.getTime())
		? "Unknown date"
		: date.toLocaleString(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
			})
}
