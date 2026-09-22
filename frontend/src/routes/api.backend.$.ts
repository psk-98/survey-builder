import { createFileRoute } from "@tanstack/react-router"
import type {} from "@tanstack/react-start"
import { proxy } from "@/lib/api/proxy.server"
export const Route = createFileRoute("/api/backend/$")({
	server: {
		handlers: {
			GET: ({ request }) => proxy(request),
			POST: ({ request }) => proxy(request),
			PATCH: ({ request }) => proxy(request),
			PUT: ({ request }) => proxy(request),
			DELETE: ({ request }) => proxy(request),
		},
	},
})
