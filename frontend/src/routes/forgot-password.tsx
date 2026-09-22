import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "@/features/auth/AuthPage"
export const Route = createFileRoute("/forgot-password")({
	head: () => ({ meta: [{ title: "Reset your password — Formlane" }] }),
	component: () => <AuthPage mode="forgot" />,
})
