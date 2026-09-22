import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Download, Pencil } from "lucide-react"
import { AppShell } from "@/components/app/AppShell"
import {
	ErrorState,
	LoadingState,
	StatusBadge,
} from "@/components/app/Feedback"
import { Button } from "@/components/ui/button"
import { InteractionList } from "@/features/interactions/InteractionList"
import { downloadJson } from "@/features/survey-builder/helpers/download"
import { surveyQuery } from "@/lib/api/queries"
import { surveyReady } from "./list-utils"
export function SurveyDetailPage({ surveyId }: { surveyId: string }) {
	return (
		<AppShell>
			<Detail surveyId={surveyId} />
		</AppShell>
	)
}
function Detail({ surveyId }: { surveyId: string }) {
	const query = useQuery(surveyQuery(surveyId))
	if (query.isPending) return <LoadingState />
	if (query.error)
		return <ErrorState error={query.error} retry={() => query.refetch()} />
	const survey = query.data
	return (
		<>
			<Link
				to="/surveys"
				className="mb-6 inline-flex items-center gap-2 text-xs text-stone-500"
			>
				<ArrowLeft size={14} />
				All surveys
			</Link>
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div>
					<p className="text-xs tracking-widest text-emerald-700">
						SURVEY #{survey.id}
					</p>
					<h1 className="mt-3 break-words text-3xl font-semibold tracking-tight">
						{survey.survey_definition.name || survey.name}
					</h1>
					<div className="mt-4 flex items-center gap-4">
						<StatusBadge
							complete={surveyReady(survey)}
							labels={["Needs attention", "Paths complete"]}
						/>
						<span className="text-xs text-stone-500">
							{survey.survey_definition.nodes.length} blocks ·{" "}
							{survey.survey_definition.edges.length} connections
						</span>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() =>
							downloadJson(JSON.stringify(survey.survey_definition, null, 2))
						}
					>
						<Download />
						Export
					</Button>
					<Button asChild>
						<Link to="/survey-builder" search={{ surveyId }}>
							<Pencil />
							Edit survey
						</Link>
					</Button>
				</div>
			</div>
			<details className="mt-8 rounded-xl border bg-white p-5">
				<summary className="cursor-pointer text-sm font-medium">
					View survey definition
				</summary>
				<pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-emerald-950 p-5 text-xs leading-6 text-emerald-100">
					{JSON.stringify(survey.survey_definition, null, 2)}
				</pre>
			</details>
			<InteractionList surveyId={surveyId} />
		</>
	)
}
