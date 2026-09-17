import { createFileRoute } from "@tanstack/react-router"
import { HomePage } from "@/features/home/HomePage"
export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "Formlane — Better surveys, one conversation at a time" },
			{
				name: "description",
				content:
					"Build branching surveys visually with Formlane. Connect questions, check every path, and export structured JSON.",
			},
		],
	}),
	component: HomePage,
})
