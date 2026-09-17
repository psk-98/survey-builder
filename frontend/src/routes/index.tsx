import { createFileRoute } from "@tanstack/react-router";
import SurveyBuilder from "../components/survey/SurveyBuilder";
export const Route = createFileRoute("/")({ component: SurveyBuilder });
