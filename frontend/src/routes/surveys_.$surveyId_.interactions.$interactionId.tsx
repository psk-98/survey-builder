import { createFileRoute } from "@tanstack/react-router"
import { InteractionDetailPage } from "@/features/interactions/InteractionDetailPage"
export const Route = createFileRoute(
	"/surveys_/$surveyId_/interactions/$interactionId",
)({ component: Page })
function Page() {
	return <InteractionDetailPage {...Route.useParams()} />
}
