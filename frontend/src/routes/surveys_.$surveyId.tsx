import { createFileRoute } from "@tanstack/react-router"
import { SurveyDetailPage } from "@/features/surveys/SurveyDetailPage"
export const Route = createFileRoute("/surveys_/$surveyId")({
	head: () => ({ meta: [{ title: "Survey details — Formlane" }] }),
	component: Page,
})
function Page() {
	const { surveyId } = Route.useParams()
	return <SurveyDetailPage surveyId={surveyId} />
}
