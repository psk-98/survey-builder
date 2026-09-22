import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Check } from "lucide-react"
import { AppShell } from "@/components/app/AppShell"
import {
	ErrorState,
	LoadingState,
	StatusBadge,
} from "@/components/app/Feedback"
import { answerLabel, formatDate } from "@/features/surveys/list-utils"
import { interactionQuery } from "@/lib/api/queries"
export function InteractionDetailPage(props: {
	surveyId: string
	interactionId: string
}) {
	return (
		<AppShell>
			<Detail {...props} />
		</AppShell>
	)
}
function Detail({
	surveyId,
	interactionId,
}: {
	surveyId: string
	interactionId: string
}) {
	const query = useQuery(interactionQuery(surveyId, interactionId))
	if (query.isPending) return <LoadingState />
	if (query.error)
		return <ErrorState error={query.error} retry={() => query.refetch()} />
	const item = query.data
	if (item.survey_id !== surveyId)
		return (
			<ErrorState
				error={
					new Error("This interaction does not belong to the selected survey.")
				}
			/>
		)
	return (
		<>
			<Link
				to="/surveys/$surveyId"
				params={{ surveyId }}
				className="mb-6 inline-flex items-center gap-2 text-xs text-stone-500"
			>
				<ArrowLeft size={14} />
				Back to survey
			</Link>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs tracking-widest text-emerald-700">
						ONE CONVERSATION, IN DETAIL
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-tight">
						Interaction details
					</h1>
					<p className="mt-3 break-all font-mono text-xs text-stone-500">
						{item.id}
					</p>
				</div>
				<StatusBadge
					complete={item.completed}
					labels={["In progress", "Completed"]}
				/>
			</div>
			<dl className="my-8 grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
				{[
					["Started", formatDate(item.created_at)],
					["Last updated", formatDate(item.updated_at)],
					["Answers", String(item.answers.length)],
					["Current step", item.current_step],
				].map(([label, value]) => (
					<div key={label}>
						<dt className="text-xs text-stone-500">{label}</dt>
						<dd className="mt-2 break-words text-sm font-medium">{value}</dd>
					</div>
				))}
			</dl>
			<h2 className="mb-5 text-xl font-semibold">Answer history</h2>
			<p className="mb-5 text-sm text-stone-500">
				Answers are shown in the order returned by the survey service.
			</p>
			{item.answers.length === 0 ? (
				<p className="rounded-xl border bg-white p-8 text-sm text-stone-500">
					No answers have been recorded yet.
				</p>
			) : (
				<ol className="space-y-4">
					{item.answers.map((answer, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: The API supplies no answer ID and a step can occur more than once in immutable history.
							key={`${answer.node_id}-${index}`}
							className="flex gap-4 rounded-xl border bg-white p-6"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800">
								{index + 1}
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-[10px] uppercase tracking-wider text-stone-400">
									{answer.type} · {answer.node_id}
								</p>
								<h3 className="mt-2 break-words font-semibold">
									{answer.question}
								</h3>
								<p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-stone-50 p-4 text-sm leading-6">
									{answerLabel(answer.answer) || "Empty answer"}
								</p>
								{typeof answer.answer !== "string" && (
									<p className="mt-2 font-mono text-[10px] text-stone-400">
										Choice: {answer.answer.id}
									</p>
								)}
							</div>
						</li>
					))}
				</ol>
			)}
			{item.completed && (
				<p className="mt-6 flex items-center gap-2 text-sm text-emerald-800">
					<Check size={16} />
					This interaction is complete.
				</p>
			)}
		</>
	)
}
