import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ErrorState, LoadingState } from "@/components/app/Feedback"
import { AuthGuard } from "@/features/auth/session"
import { SurveyBuilder } from "@/features/survey-builder/SurveyBuilder"
import { surveyQuery } from "@/lib/api/queries"
export const Route = createFileRoute("/survey-builder")({
	validateSearch: (search: Record<string, unknown>) => ({
		surveyId:
			typeof search.surveyId === "string" && search.surveyId
				? search.surveyId
				: undefined,
	}),
	head: () => ({ meta: [{ title: "Survey builder — Formlane" }] }),
	component: Page,
})
function Page() {
	const { surveyId } = Route.useSearch()
	return (
		<AuthGuard>
			{surveyId ? <Existing surveyId={surveyId} /> : <SurveyBuilder />}
		</AuthGuard>
	)
}
function Existing({ surveyId }: { surveyId: string }) {
	const query = useQuery(surveyQuery(surveyId))
	if (query.isPending) return <LoadingState />
	if (query.error)
		return <ErrorState error={query.error} retry={() => query.refetch()} />
	return (
		<SurveyBuilder
			key={surveyId}
			surveyId={surveyId}
			initial={query.data.survey_definition}
		/>
	)
}
