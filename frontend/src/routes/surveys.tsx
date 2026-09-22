import { createFileRoute } from "@tanstack/react-router"
import { SurveysPage } from "@/features/surveys/SurveysPage"
export const Route = createFileRoute("/surveys")({
	head: () => ({ meta: [{ title: "Surveys — Formlane" }] }),
	component: () => <SurveysPage />,
})
