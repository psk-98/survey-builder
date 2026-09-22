import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server"

const COOKIE = "formlane_session"
const paths: [RegExp, string[]][] = [
	[/^auth\/login\/access_token$/, ["POST"]],
	[/^auth\/(register|forgot-password|reset-password)$/, ["POST"]],
	[/^users\/$/, ["GET", "PATCH"]],
	[/^users\/change_password$/, ["PUT"]],
	[/^surveys\/$/, ["GET", "POST"]],
	[/^surveys\/[a-zA-Z0-9_-]+$/, ["GET", "PUT", "DELETE"]],
	[/^survey-interactions\/[a-zA-Z0-9_-]+$/, ["GET"]],
	[/^survey-interactions\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/, ["GET"]],
]
const reply = (data: unknown, status = 200) =>
	Response.json(data, { status, headers: { "Cache-Control": "no-store" } })
export async function proxy(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const path = url.pathname.slice("/api/backend/".length)
	if (
		!["GET", "HEAD"].includes(request.method) &&
		request.headers.get("origin") !== url.origin
	)
		return reply(
			{ detail: "This request must come from the application." },
			403,
		)
	if (path === "logout" && request.method === "POST") {
		deleteCookie(COOKIE, { path: "/" })
		return reply({ success: true })
	}
	if (
		!paths.some(
			([pattern, methods]) =>
				pattern.test(path) && methods.includes(request.method),
		)
	)
		return reply({ detail: "Endpoint not available." }, 404)
	const publicPath = path.startsWith("auth/")
	const token = getCookie(COOKIE)
	if (!publicPath && !token)
		return reply({ detail: "Please sign in to continue." }, 401)
	const headers = new Headers({ Accept: "application/json" })
	if (!publicPath && token) headers.set("Authorization", `Bearer ${token}`)
	let body: string | undefined
	if (!["GET", "HEAD"].includes(request.method)) {
		if (Number(request.headers.get("content-length") ?? 0) > 2_000_000)
			return reply({ detail: "Request is too large." }, 413)
		body = await request.text()
		if (body.length > 2_000_000)
			return reply({ detail: "Request is too large." }, 413)
		headers.set(
			"Content-Type",
			request.headers.get("content-type") ?? "application/json",
		)
	}
	try {
		const origin = (process.env.BACKEND_URL ?? "http://127.0.0.1:8001").replace(
			/\/$/,
			"",
		)
		const upstream = await fetch(`${origin}/api/v1/${path}${url.search}`, {
			method: request.method,
			headers,
			body,
			signal: AbortSignal.timeout(15000),
			redirect: "error",
		})
		if (upstream.status === 401 && !publicPath)
			deleteCookie(COOKIE, { path: "/" })
		if (upstream.status === 204)
			return new Response(null, {
				status: 204,
				headers: { "Cache-Control": "no-store" },
			})
		const data = await upstream.json().catch(() => null)
		if (!upstream.ok) {
			const detail =
				typeof data?.detail === "string"
					? data.detail
					: Array.isArray(data?.detail)
						? data.detail
								.map((item: { msg?: string }) => item.msg ?? "Invalid field")
								.join(". ")
						: "The backend could not complete this request."
			return reply({ detail }, upstream.status)
		}
		if (path === "auth/login/access_token") {
			if (
				typeof data?.access_token !== "string" ||
				/[\r\n]/.test(data.access_token)
			)
				return reply({ detail: "Invalid login response." }, 502)
			setCookie(COOKIE, data.access_token, {
				httpOnly: true,
				sameSite: "lax",
				secure:
					url.protocol === "https:" || process.env.COOKIE_SECURE === "true",
				path: "/",
			})
			return reply({ authenticated: true })
		}
		return reply(data, upstream.status)
	} catch {
		return reply(
			{
				detail: "The survey service is unavailable. Please try again shortly.",
			},
			502,
		)
	}
}
