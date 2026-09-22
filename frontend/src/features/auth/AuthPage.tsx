import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { type FormEvent, useState } from "react"
import { Brand } from "@/components/layout/Brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api, jsonBody } from "@/lib/api/client"
import { userSchema } from "@/lib/api/schemas"
import { sessionKey } from "./session"

type Mode = "login" | "register" | "forgot" | "reset"
const copy: Record<Mode, [string, string]> = {
	login: ["Welcome back.", "Sign in to your survey workspace."],
	register: [
		"Start a conversation.",
		"Create an account to save surveys and explore responses.",
	],
	forgot: ["Forgot your password?", "We’ll send you instructions to reset it."],
	reset: ["Choose a new password.", "Use the reset token from your email."],
}
export function AuthPage({ mode, token = "" }: { mode: Mode; token?: string }) {
	const [busy, setBusy] = useState(false),
		[error, setError] = useState(""),
		[message, setMessage] = useState("")
	const client = useQueryClient()
	const navigate = useNavigate()
	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const value = (key: string) => String(form.get(key) ?? "")
		setBusy(true)
		setError("")
		setMessage("")
		try {
			if (mode === "register") {
				await api("auth/register", {
					method: "POST",
					body: jsonBody({
						email: value("email"),
						username: value("username"),
						password: value("password"),
						is_active: true,
						role: "user",
					}),
				})
			}
			if (mode === "login" || mode === "register") {
				await api("auth/login/access_token", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						username: value("username"),
						password: value("password"),
						grant_type: "password",
					}).toString(),
				})
				client.clear()
				const user = await api("users/", {}, userSchema)
				client.setQueryData(sessionKey, user)
				await navigate({ to: "/surveys" })
			} else if (mode === "forgot") {
				await api("auth/forgot-password", {
					method: "POST",
					body: jsonBody({ email: value("email") }),
				})
				setMessage(
					"If an account exists for this email, reset instructions have been sent.",
				)
			} else {
				if (value("password") !== value("confirm"))
					throw new Error("The passwords do not match.")
				await api("auth/reset-password", {
					method: "POST",
					body: jsonBody({
						token: value("token"),
						password: value("password"),
					}),
				})
				setMessage("Your password has been reset. You can now sign in.")
			}
		} catch (e) {
			setError((e as Error).message)
		} finally {
			setBusy(false)
		}
	}
	return (
		<div className="min-h-dvh bg-stone-50">
			<header className="mx-auto max-w-7xl px-6 py-7">
				<Brand />
			</header>
			<main className="mx-auto max-w-md px-6 py-12">
				<p className="text-[10px] font-semibold tracking-[.2em] text-emerald-700">
					YOUR FORMLANE WORKSPACE
				</p>
				<h1 className="mt-4 text-4xl font-semibold tracking-tight text-emerald-950">
					{copy[mode][0]}
				</h1>
				<p className="mt-4 text-sm leading-6 text-stone-500">{copy[mode][1]}</p>
				<form
					onSubmit={submit}
					className="mt-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-6"
				>
					{(mode === "register" || mode === "forgot") && (
						<label htmlFor="email" className="block space-y-2 text-sm">
							Email
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
							/>
						</label>
					)}
					{(mode === "login" || mode === "register") && (
						<label htmlFor="username" className="block space-y-2 text-sm">
							{mode === "login" ? "Username or email" : "Username"}
							<Input
								id="username"
								name="username"
								autoComplete="username"
								required
							/>
						</label>
					)}
					{mode === "reset" && (
						<label htmlFor="token" className="block space-y-2 text-sm">
							Reset token
							<Input
								id="token"
								name="token"
								defaultValue={token}
								autoComplete="off"
								required
							/>
						</label>
					)}
					{mode !== "forgot" && (
						<label htmlFor="password" className="block space-y-2 text-sm">
							Password
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete={
									mode === "login" ? "current-password" : "new-password"
								}
								minLength={mode === "login" ? undefined : 8}
								required
							/>
						</label>
					)}
					{mode === "reset" && (
						<label htmlFor="confirm" className="block space-y-2 text-sm">
							Confirm password
							<Input
								id="confirm"
								name="confirm"
								type="password"
								autoComplete="new-password"
								required
							/>
						</label>
					)}
					{error && (
						<p role="alert" className="text-sm text-rose-700">
							{error}
						</p>
					)}
					{message && (
						<p
							aria-live="polite"
							className="text-sm leading-6 text-emerald-700"
						>
							{message}
						</p>
					)}
					<Button className="w-full" disabled={busy}>
						{busy
							? "Please wait…"
							: mode === "login"
								? "Sign in"
								: mode === "register"
									? "Create account"
									: mode === "forgot"
										? "Send reset instructions"
										: "Reset password"}
					</Button>
					{mode === "login" && (
						<Link
							to="/forgot-password"
							className="block text-center text-xs text-emerald-800"
						>
							Forgot password?
						</Link>
					)}
				</form>
				<p className="mt-6 text-center text-sm text-stone-500">
					{mode === "login" ? (
						<Link to="/register" className="text-emerald-800">
							New here? Create an account
						</Link>
					) : (
						<Link to="/login" className="text-emerald-800">
							Back to sign in
						</Link>
					)}
				</p>
			</main>
		</div>
	)
}
