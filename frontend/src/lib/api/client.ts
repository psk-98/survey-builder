import type { z } from "zod"
export class ApiError extends Error {
	status: number
	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}
export async function api<T = unknown>(
	path: string,
	options: RequestInit = {},
	schema?: z.ZodType<T>,
): Promise<T> {
	let response: Response
	try {
		response = await fetch(`/api/backend/${path}`, {
			...options,
			credentials: "same-origin",
			headers: {
				...(options.body ? { "Content-Type": "application/json" } : {}),
				...options.headers,
			},
		})
	} catch {
		throw new ApiError(
			"Unable to reach the server. Check your connection and try again.",
			0,
		)
	}
	const data =
		response.status === 204
			? undefined
			: await response.json().catch(() => undefined)
	if (!response.ok) {
		if (response.status === 401 && typeof window !== "undefined")
			window.dispatchEvent(new Event("auth-expired"))
		throw new ApiError(
			typeof data?.detail === "string"
				? data.detail
				: "The request could not be completed. Please try again.",
			response.status,
		)
	}
	if (schema) {
		const result = schema.safeParse(data)
		if (!result.success)
			throw new ApiError(
				"The server returned an unexpected response. Please contact your administrator.",
				502,
			)
		return result.data
	}
	return data as T
}
export const jsonBody = (value: unknown) => JSON.stringify(value)
