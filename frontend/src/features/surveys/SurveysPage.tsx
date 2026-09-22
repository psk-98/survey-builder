import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react"
import { AlertDialog } from "radix-ui"
import { useState } from "react"
import { AppShell } from "@/components/app/AppShell"
import {
	ErrorState,
	LoadingState,
	StatusBadge,
} from "@/components/app/Feedback"
import {
	ListControls,
	Pagination,
	usePagination,
} from "@/components/app/ListControls"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/client"
import { surveysQuery } from "@/lib/api/queries"
import type { Survey } from "@/lib/api/schemas"
import { filterSurveys, surveyReady } from "./list-utils"
export function SurveysPage() {
	return (
		<AppShell>
			<SurveyList />
		</AppShell>
	)
}
function SurveyList() {
	const query = useQuery(surveysQuery()),
		client = useQueryClient()
	const [search, setSearch] = useState(""),
		[status, setStatus] = useState("all"),
		[sort, setSort] = useState("id-desc")
	const [deleting, setDeleting] = useState<Survey | null>(null)
	const deletion = useMutation({
		mutationFn: (id: number) => api(`surveys/${id}`, { method: "DELETE" }),
		onSuccess: async () => {
			setDeleting(null)
			await client.invalidateQueries({ queryKey: ["surveys"] })
			client.removeQueries({ queryKey: ["interactions"] })
		},
	})
	const filtered = filterSurveys(query.data ?? [], search, status, sort)
	const pagination = usePagination(filtered, `${search}|${status}|${sort}`)
	return (
		<>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs tracking-widest text-emerald-700">
						YOUR WORKSPACE
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-tight">
						Surveys
					</h1>
					<p className="mt-3 text-sm text-stone-500">
						Build a journey. Listen to every response.
					</p>
				</div>
				<Button asChild>
					<Link to="/survey-builder" search={{ surveyId: undefined }}>
						<Plus />
						New survey
					</Link>
				</Button>
			</div>
			<ListControls
				search={search}
				onSearch={setSearch}
				status={status}
				onStatus={setStatus}
				statuses={[
					{ value: "all", label: "All surveys" },
					{ value: "ready", label: "Paths complete" },
					{ value: "incomplete", label: "Needs attention" },
				]}
				sort={sort}
				onSort={setSort}
				sorts={[
					{ value: "id-desc", label: "ID: highest first" },
					{ value: "id-asc", label: "ID: lowest first" },
					{ value: "title", label: "Title: A–Z" },
				]}
			/>
			{query.isPending ? (
				<LoadingState />
			) : query.error ? (
				<ErrorState error={query.error} retry={() => query.refetch()} />
			) : (
				<>
					<div className="overflow-x-auto rounded-xl border bg-white">
						<table className="w-full text-left text-sm">
							<thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
								<tr>
									<th className="px-5 py-4">Survey</th>
									<th className="px-5 py-4">Flow</th>
									<th className="px-5 py-4">Blocks</th>
									<th className="px-5 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{pagination.rows.map((survey) => (
									<tr key={survey.id} className="border-t hover:bg-stone-50/60">
										<td className="px-5 py-5">
											<Link
												to="/surveys/$surveyId"
												params={{ surveyId: String(survey.id) }}
												className="font-semibold text-emerald-950 hover:underline"
											>
												{survey.survey_definition.name ||
													survey.name ||
													"Untitled survey"}
											</Link>
											<p className="mt-1 text-xs text-stone-400">
												Survey #{survey.id}
											</p>
										</td>
										<td className="px-5 py-5">
											<StatusBadge
												complete={surveyReady(survey)}
												labels={["Needs attention", "Paths complete"]}
											/>
										</td>
										<td className="px-5 py-5 text-stone-500">
											{survey.survey_definition.nodes.length}
										</td>
										<td className="px-5 py-5">
											<div className="flex justify-end gap-2">
												<Button variant="ghost" size="icon-sm" asChild>
													<Link
														aria-label={`Edit ${survey.survey_definition.name}`}
														to="/survey-builder"
														search={{ surveyId: String(survey.id) }}
													>
														<Pencil />
													</Link>
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label={`Delete ${survey.survey_definition.name}`}
													onClick={() => {
														deletion.reset()
														setDeleting(survey)
													}}
												>
													<Trash2 />
												</Button>
												<Button variant="outline" size="sm" asChild>
													<Link
														to="/surveys/$surveyId"
														params={{ surveyId: String(survey.id) }}
													>
														View
														<ArrowRight />
													</Link>
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{filtered.length === 0 && (
							<div className="p-12 text-center">
								<h2 className="font-semibold">
									{query.data?.length
										? "No matching surveys"
										: "Your first conversation starts here"}
								</h2>
								<p className="mt-2 text-sm text-stone-500">
									{query.data?.length
										? "Try a different search or filter."
										: "Create a survey and save it from the builder."}
								</p>
							</div>
						)}
					</div>
					<Pagination
						current={pagination.current}
						pages={pagination.pages}
						total={filtered.length}
						onPage={pagination.setPage}
					/>
				</>
			)}
			<AlertDialog.Root
				open={!!deleting}
				onOpenChange={(open) => {
					if (!open && !deletion.isPending) setDeleting(null)
				}}
			>
				<AlertDialog.Portal>
					<AlertDialog.Overlay className="fixed inset-0 z-40 bg-stone-950/40" />
					<AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
						<AlertDialog.Title className="text-xl font-semibold">
							Delete this survey?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-3 text-sm leading-6 text-stone-500">
							“{deleting?.survey_definition.name}” will be deleted. This cannot
							be undone.
						</AlertDialog.Description>
						{deletion.error && (
							<p role="alert" className="mt-3 text-sm text-rose-700">
								{deletion.error.message}
							</p>
						)}
						<div className="mt-6 flex justify-end gap-3">
							<AlertDialog.Cancel asChild>
								<Button variant="outline" disabled={deletion.isPending}>
									Cancel
								</Button>
							</AlertDialog.Cancel>
							<Button
								variant="destructive"
								disabled={deletion.isPending}
								onClick={() => {
									if (deleting) deletion.mutate(deleting.id)
								}}
							>
								{deletion.isPending ? "Deleting…" : "Delete survey"}
							</Button>
						</div>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</>
	)
}
