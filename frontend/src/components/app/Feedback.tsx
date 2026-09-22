import { Button } from "@/components/ui/button"
export function ErrorState({
	error,
	retry,
}: {
	error: Error
	retry?: () => void
}) {
	return (
		<div
			role="alert"
			className="rounded-xl border border-rose-200 bg-rose-50 p-5"
		>
			<p className="text-sm text-rose-800">{error.message}</p>
			{retry && (
				<Button variant="outline" className="mt-3" onClick={retry}>
					Try again
				</Button>
			)}
		</div>
	)
}
export function LoadingState() {
	return (
		<p
			aria-live="polite"
			className="rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-500"
		>
			Loading…
		</p>
	)
}
export function StatusBadge({
	complete,
	labels = ["Needs attention", "Ready"],
}: {
	complete: boolean
	labels?: [string, string]
}) {
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${complete ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}
		>
			{labels[complete ? 1 : 0]}
		</span>
	)
}
