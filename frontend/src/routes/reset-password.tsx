import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "@/features/auth/AuthPage"
export const Route = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Choose a password — Formlane" }] }),
	validateSearch: (search: Record<string, unknown>) => ({
		token: typeof search.token === "string" ? search.token : "",
	}),
	component: Page,
})
function Page() {
	const { token } = Route.useSearch()
	return <AuthPage mode="reset" token={token} />
}
