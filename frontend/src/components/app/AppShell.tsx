import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { ClipboardList, LogOut, UserRound } from "lucide-react"
import { type ReactNode, useState } from "react"
import { Brand } from "@/components/layout/Brand"
import { Button } from "@/components/ui/button"
import { AuthGuard, useSession } from "@/features/auth/session"
import { api, jsonBody } from "@/lib/api/client"
export function AppShell({ children }: { children: ReactNode }) {
	return (
		<AuthGuard>
			<Workspace>{children}</Workspace>
		</AuthGuard>
	)
}
function Workspace({ children }: { children: ReactNode }) {
	const session = useSession()
	const client = useQueryClient()
	const navigate = useNavigate()
	const [error, setError] = useState("")
	const [busy, setBusy] = useState(false)
	async function logout() {
		setBusy(true)
		try {
			await api("logout", { method: "POST", body: jsonBody({}) })
			client.clear()
			await navigate({ to: "/login" })
		} catch (e) {
			setError((e as Error).message)
		} finally {
			setBusy(false)
		}
	}
	return (
		<div className="min-h-dvh bg-stone-50">
			<header className="border-b border-stone-200 bg-white">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-5">
					<Brand />
					<nav className="flex gap-2 sm:ml-8">
						<Link
							to="/surveys"
							className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500"
							activeProps={{ className: "bg-emerald-50 text-emerald-900" }}
						>
							<ClipboardList size={16} />
							Surveys
						</Link>
						<Link
							to="/profile"
							className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500"
							activeProps={{ className: "bg-emerald-50 text-emerald-900" }}
						>
							<UserRound size={16} />
							Profile
						</Link>
					</nav>
					<span className="ml-auto hidden text-xs text-stone-500 md:block">
						{session.data?.username}
					</span>
					<Button variant="ghost" size="sm" disabled={busy} onClick={logout}>
						<LogOut />
						{busy ? "Signing out…" : "Sign out"}
					</Button>
				</div>
			</header>
			{error && (
				<p
					role="alert"
					className="mx-auto max-w-7xl px-6 py-3 text-sm text-rose-700"
				>
					{error}
				</p>
			)}
			<main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</main>
		</div>
	)
}
