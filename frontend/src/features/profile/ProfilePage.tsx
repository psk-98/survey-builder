import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { AppShell } from "@/components/app/AppShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sessionKey, useSession } from "@/features/auth/session"
import { api, jsonBody } from "@/lib/api/client"
export function ProfilePage() {
	return (
		<AppShell>
			<Profile />
		</AppShell>
	)
}
function Profile() {
	const { data: user } = useSession()
	const client = useQueryClient()
	const [passwordMessage, setPasswordMessage] = useState("")
	const profile = useMutation({
		mutationFn: (value: { email: string; username: string }) =>
			api("users/", { method: "PATCH", body: jsonBody(value) }),
		onSuccess: () => client.invalidateQueries({ queryKey: sessionKey }),
	})
	const password = useMutation({
		mutationFn: (value: { password: string; new_password: string }) =>
			api("users/change_password", { method: "PUT", body: jsonBody(value) }),
	})
	function saveProfile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		profile.mutate({
			username: String(form.get("username")),
			email: String(form.get("email")),
		})
	}
	async function changePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const element = event.currentTarget,
			form = new FormData(element)
		setPasswordMessage("")
		if (form.get("new_password") !== form.get("confirm")) {
			setPasswordMessage("The new passwords do not match.")
			return
		}
		try {
			await password.mutateAsync({
				password: String(form.get("password")),
				new_password: String(form.get("new_password")),
			})
			element.reset()
			setPasswordMessage("Password updated.")
		} catch {
			/* Mutation exposes the error below. */
		}
	}
	return (
		<>
			<p className="text-xs tracking-widest text-emerald-700">YOUR ACCOUNT</p>
			<h1 className="mt-3 text-3xl font-semibold tracking-tight">
				Profile & security
			</h1>
			<p className="mt-3 text-sm text-stone-500">
				Keep your account details up to date.
			</p>
			<div className="mt-8 grid gap-6 lg:grid-cols-2">
				<form
					onSubmit={saveProfile}
					className="space-y-5 rounded-2xl border bg-white p-6"
				>
					<h2 className="text-lg font-semibold">Personal details</h2>
					<p className="text-xs text-stone-500">Account role: {user?.role}</p>
					<label htmlFor="profile-username" className="block space-y-2 text-sm">
						Username
						<Input
							key={`${user?.username}-name`}
							id="profile-username"
							name="username"
							defaultValue={user?.username}
							autoComplete="username"
							required
						/>
					</label>
					<label htmlFor="profile-email" className="block space-y-2 text-sm">
						Email
						<Input
							key={user?.email}
							id="profile-email"
							name="email"
							type="email"
							defaultValue={user?.email}
							autoComplete="email"
							required
						/>
					</label>
					{profile.error && (
						<p role="alert" className="text-sm text-rose-700">
							{profile.error.message}
						</p>
					)}
					{profile.isSuccess && (
						<p aria-live="polite" className="text-sm text-emerald-700">
							Profile updated.
						</p>
					)}
					<Button disabled={profile.isPending}>
						{profile.isPending ? "Saving…" : "Save changes"}
					</Button>
				</form>
				<form
					onSubmit={changePassword}
					className="space-y-5 rounded-2xl border bg-white p-6"
				>
					<h2 className="text-lg font-semibold">Change password</h2>
					<label htmlFor="current-password" className="block space-y-2 text-sm">
						Current password
						<Input
							id="current-password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
						/>
					</label>
					<label htmlFor="new-password" className="block space-y-2 text-sm">
						New password
						<Input
							id="new-password"
							name="new_password"
							type="password"
							autoComplete="new-password"
							minLength={8}
							required
						/>
					</label>
					<label htmlFor="confirm-password" className="block space-y-2 text-sm">
						Confirm new password
						<Input
							id="confirm-password"
							name="confirm"
							type="password"
							autoComplete="new-password"
							minLength={8}
							required
						/>
					</label>
					{password.error && (
						<p role="alert" className="text-sm text-rose-700">
							{password.error.message}
						</p>
					)}
					{passwordMessage && (
						<p aria-live="polite" className="text-sm">
							{passwordMessage}
						</p>
					)}
					<Button disabled={password.isPending}>
						{password.isPending ? "Updating…" : "Update password"}
					</Button>
				</form>
			</div>
		</>
	)
}
