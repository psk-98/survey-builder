import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { type ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api/client"
import { userSchema } from "@/lib/api/schemas"
export const sessionKey = ["session"] as const
export function useSession() {
	const [mounted, setMounted] = useState(false)
	const client = useQueryClient()
	useEffect(() => {
		setMounted(true)
		const expire = () => {
			client.setQueryData(sessionKey, null)
			client.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" })
		}
		window.addEventListener("auth-expired", expire)
		return () => window.removeEventListener("auth-expired", expire)
	}, [client])
	return useQuery({
		queryKey: sessionKey,
		queryFn: async () => {
			try {
				return await api("users/", {}, userSchema)
			} catch (error) {
				if (error instanceof ApiError && error.status === 401) return null
				throw error
			}
		},
		enabled: mounted,
		retry: false,
		staleTime: 60_000,
	})
}
export function AuthGuard({ children }: { children: ReactNode }) {
	const session = useSession()
	if (session.isPending)
		return (
			<div
				className="grid min-h-dvh place-items-center text-sm text-stone-500"
				aria-live="polite"
			>
				Checking your session…
			</div>
		)
	if (session.isError)
		return (
			<div className="mx-auto max-w-md p-10">
				<h1 className="text-xl font-semibold">Unable to load your account</h1>
				<p role="alert" className="my-4 text-sm text-rose-700">
					{session.error.message}
				</p>
				<Button onClick={() => session.refetch()}>Try again</Button>
			</div>
		)
	if (!session.data)
		return (
			<div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6">
				<p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
					Your workspace
				</p>
				<h1 className="text-3xl font-semibold tracking-tight">
					Sign in to continue
				</h1>
				<p className="text-sm leading-6 text-stone-500">
					Manage your surveys and explore every conversation in your account.
				</p>
				<Button asChild>
					<Link to="/login">Sign in</Link>
				</Button>
				<Link to="/register" className="text-center text-sm text-emerald-800">
					Create an account
				</Link>
			</div>
		)
	return children
}
