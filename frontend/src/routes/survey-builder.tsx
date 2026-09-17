import { createFileRoute } from "@tanstack/react-router";
import { SurveyBuilder } from "@/features/survey-builder/SurveyBuilder";
export const Route = createFileRoute("/survey-builder")({
	head: () => ({ meta: [{ title: "Survey builder — Formlane" }] }),
	component: SurveyBuilder,
});
