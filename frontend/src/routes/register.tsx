import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "@/features/auth/AuthPage"
export const Route = createFileRoute("/register")({
	head: () => ({ meta: [{ title: "Create account — Formlane" }] }),
	component: () => <AuthPage mode="register" />,
})
