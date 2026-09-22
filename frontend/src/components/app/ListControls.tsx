import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Option = { value: string; label: string }
export function ListControls({
	search,
	onSearch,
	status,
	onStatus,
	statuses,
	sort,
	onSort,
	sorts,
	date,
	onDate,
}: {
	search: string
	onSearch: (v: string) => void
	status: string
	onStatus: (v: string) => void
	statuses: Option[]
	sort: string
	onSort: (v: string) => void
	sorts: Option[]
	date?: string
	onDate?: (v: string) => void
}) {
	return (
		<div className="mb-5 flex flex-wrap items-center gap-3">
			<div className="relative min-w-48 flex-1">
				<Search className="absolute top-2.5 left-3 size-4 text-stone-400" />
				<Input
					className="bg-white pl-9"
					aria-label="Search"
					placeholder="Search…"
					value={search}
					onChange={(e) => onSearch(e.target.value)}
				/>
			</div>
			<select
				aria-label="Filter by status"
				className="h-9 rounded-md border bg-white px-3 text-sm"
				value={status}
				onChange={(e) => onStatus(e.target.value)}
			>
				{statuses.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{onDate && (
				<select
					aria-label="Filter by date"
					className="h-9 rounded-md border bg-white px-3 text-sm"
					value={date}
					onChange={(e) => onDate(e.target.value)}
				>
					<option value="all">All dates</option>
					<option value="1">Last 24 hours</option>
					<option value="7">Last 7 days</option>
					<option value="30">Last 30 days</option>
				</select>
			)}
			<select
				aria-label="Sort by"
				className="h-9 rounded-md border bg-white px-3 text-sm"
				value={sort}
				onChange={(e) => onSort(e.target.value)}
			>
				{sorts.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			<Button
				variant="ghost"
				onClick={() => {
					onSearch("")
					onStatus("all")
					onSort(sorts[0].value)
					onDate?.("all")
				}}
			>
				Reset
			</Button>
		</div>
	)
}
export function usePagination<T>(items: T[], filterKey: string) {
	const [page, setPage] = useState(1)
	const pages = Math.max(1, Math.ceil(items.length / 10))
	const current = Math.min(page, pages)
	// Reset to the first page when the filter combination changes.
	useEffect(() => {
		if (filterKey !== undefined) setPage(1)
	}, [filterKey])
	return {
		rows: items.slice((current - 1) * 10, current * 10),
		current,
		pages,
		setPage,
	}
}
export function Pagination({
	current,
	pages,
	total,
	onPage,
}: {
	current: number
	pages: number
	total: number
	onPage: (n: number) => void
}) {
	return (
		<div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-500">
			<span>
				{total} {total === 1 ? "result" : "results"} · Page {current} of {pages}
			</span>
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={current <= 1}
					onClick={() => onPage(current - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={current >= pages}
					onClick={() => onPage(current + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	)
}
