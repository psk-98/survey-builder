import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PathValidation } from "../types"

interface Props {
	validation: PathValidation
	onFocusNode: (id: string) => void
	onClose: () => void
}
export function PathChecker({ validation, onFocusNode, onClose }: Props) {
	return (
		<section
			aria-label="Path checker"
			className={cn(
				"max-h-56 shrink-0 overflow-y-auto border-b px-5 py-4",
				validation.valid
					? "border-emerald-100 bg-emerald-50"
					: "border-amber-200 bg-amber-50",
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div aria-live="polite">
					<h2 className="text-sm font-semibold">
						{validation.valid
							? "Every path reaches an End"
							: `${validation.issues.length} ${validation.issues.length === 1 ? "issue" : "issues"} to fix`}
					</h2>
					<p className="mt-1 text-xs leading-5 text-stone-600">
						{validation.valid
							? `${validation.endCount} connected End ${validation.endCount === 1 ? "block" : "blocks"}. All choices are connected and there are no loops.`
							: "Every choice needs a complete path. Unused blocks must be connected or removed."}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Close path checker"
					onClick={onClose}
				>
					<X />
				</Button>
			</div>
			{!validation.valid && (
				<ul className="mt-3 space-y-1">
					{validation.issues.map((issue, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: Diagnostics are stateless rows; duplicate messages can occur for identically named choices.
							key={`${issue.nodeId}-${index}`}
							className="text-xs leading-5 text-amber-900"
						>
							{issue.nodeId ? (
								<button
									type="button"
									className="flex items-center gap-3 py-1 text-left hover:underline"
									onClick={() => {
										if (issue.nodeId) onFocusNode(issue.nodeId)
									}}
								>
									{issue.message}
									<ArrowRight className="size-3 shrink-0" />
								</button>
							) : (
								issue.message
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
