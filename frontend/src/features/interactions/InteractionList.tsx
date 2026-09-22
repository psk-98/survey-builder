import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
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
import { filterInteractions, formatDate } from "@/features/surveys/list-utils"
import { interactionsQuery } from "@/lib/api/queries"
export function InteractionList({ surveyId }: { surveyId: string }) {
	const query = useQuery(interactionsQuery(surveyId))
	const [search, setSearch] = useState(""),
		[status, setStatus] = useState("all"),
		[sort, setSort] = useState("newest"),
		[date, setDate] = useState("all")
	const filtered = filterInteractions(
		query.data ?? [],
		search,
		status,
		sort,
		date,
	)
	const pagination = usePagination(
		filtered,
		`${search}|${status}|${sort}|${date}`,
	)
	return (
		<section className="mt-10">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold tracking-tight">Interactions</h2>
					<p className="mt-2 text-sm text-stone-500">
						Explore the paths people took and the answers they shared.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => query.refetch()}
					disabled={query.isFetching}
				>
					Refresh
				</Button>
			</div>
			<ListControls
				search={search}
				onSearch={setSearch}
				status={status}
				onStatus={setStatus}
				statuses={[
					{ value: "all", label: "All interactions" },
					{ value: "completed", label: "Completed" },
					{ value: "in-progress", label: "In progress" },
				]}
				sort={sort}
				onSort={setSort}
				sorts={[
					{ value: "newest", label: "Newest first" },
					{ value: "oldest", label: "Oldest first" },
					{ value: "answers", label: "Most answers" },
				]}
				date={date}
				onDate={setDate}
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
									<th className="px-5 py-4">Interaction</th>
									<th className="px-5 py-4">Status</th>
									<th className="px-5 py-4">Answers</th>
									<th className="px-5 py-4">Started</th>
									<th className="px-5 py-4">
										<span className="sr-only">View</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{pagination.rows.map((item) => (
									<tr key={item.id} className="border-t">
										<td className="max-w-52 break-all px-5 py-4 font-mono text-xs">
											{item.id}
										</td>
										<td className="px-5 py-4">
											<StatusBadge
												complete={item.completed}
												labels={["In progress", "Completed"]}
											/>
										</td>
										<td className="px-5 py-4">{item.answers.length}</td>
										<td className="whitespace-nowrap px-5 py-4 text-xs text-stone-500">
											{formatDate(item.created_at)}
										</td>
										<td className="px-5 py-4">
											<Button variant="ghost" size="sm" asChild>
												<Link
													to="/surveys/$surveyId/interactions/$interactionId"
													params={{ surveyId, interactionId: item.id }}
												>
													Details
													<ArrowRight />
												</Link>
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{filtered.length === 0 && (
							<div className="p-10 text-center text-sm text-stone-500">
								{query.data?.length
									? "No interactions match your search and filters."
									: "No interactions yet. Responses will appear here when someone takes this survey."}
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
		</section>
	)
}
