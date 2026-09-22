import { queryOptions } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "./client"
import { interactionSchema, surveySchema } from "./schemas"
export const surveysQuery = () =>
	queryOptions({
		queryKey: ["surveys"],
		queryFn: ({ signal }) => api("surveys/", { signal }, z.array(surveySchema)),
		retry: false,
	})
export const surveyQuery = (id: string) =>
	queryOptions({
		queryKey: ["surveys", id],
		queryFn: ({ signal }) =>
			api(`surveys/${encodeURIComponent(id)}`, { signal }, surveySchema),
		retry: false,
	})
export const interactionsQuery = (id: string) =>
	queryOptions({
		queryKey: ["interactions", id],
		queryFn: ({ signal }) =>
			api(
				`survey-interactions/${encodeURIComponent(id)}`,
				{ signal },
				z.array(interactionSchema),
			),
		retry: false,
	})
export const interactionQuery = (surveyId: string, id: string) =>
	queryOptions({
		queryKey: ["interactions", surveyId, id],
		queryFn: ({ signal }) =>
			api(
				`survey-interactions/${encodeURIComponent(surveyId)}/${encodeURIComponent(id)}`,
				{ signal },
				interactionSchema,
			),
		retry: false,
	})
