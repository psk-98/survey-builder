import {
	Handle,
	type NodeProps,
	Position,
	useUpdateNodeInternals,
} from "@xyflow/react"
import { memo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { BLOCKS } from "../constants"
import type { SurveyNode } from "../types"

const handleClass = "!size-2.5 !border-2 !border-emerald-600 !bg-white"
export const SurveyBlock = memo(function SurveyBlock({
	id,
	type,
	data,
	selected,
}: NodeProps<SurveyNode>) {
	const block = BLOCKS[type]
	const Icon = block.icon
	const updateNodeInternals = useUpdateNodeInternals()
	// biome-ignore lint/correctness/useExhaustiveDependencies: Option changes move or add handles; React Flow must remeasure them.
	useEffect(() => {
		updateNodeInternals(id)
	}, [id, data.options, updateNodeInternals])
	return (
		<article
			className={cn(
				"w-64 rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow",
				selected && "border-emerald-600 ring-4 ring-emerald-100",
			)}
		>
			{type !== "start" && (
				<Handle
					className={handleClass}
					type="target"
					position={Position.Left}
				/>
			)}
			<div className="flex items-center gap-2 px-4 pt-4 text-xs font-medium text-stone-600">
				<span
					className={cn(
						"flex size-7 items-center justify-center rounded-lg",
						block.color,
					)}
				>
					<Icon size={15} />
				</span>
				{block.label}
			</div>
			<h3 className="mt-3 break-words px-4 text-sm font-semibold text-stone-900">
				{data.label || "Untitled block"}
			</h3>
			<p className="mt-2 mb-4 whitespace-pre-wrap break-words px-4 text-xs leading-relaxed text-stone-500">
				{data.content || "Add your text…"}
			</p>
			{type === "options" && (
				<div className="mb-4 space-y-2 px-4">
					{data.options.map((option, index) => (
						<div
							key={option.id}
							className="relative flex items-center gap-2 rounded-md border border-stone-200 p-2 text-xs text-stone-600"
						>
							<span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
								{index + 1}
							</span>
							<span className="min-w-0 break-words">
								{option.label || "Untitled option"}
							</span>
							<Handle
								className={cn(handleClass, "!-right-[22px]")}
								type="source"
								id={option.id}
								position={Position.Right}
							/>
						</div>
					))}
				</div>
			)}
			{type !== "options" && type !== "end" && (
				<Handle
					className={handleClass}
					type="source"
					id="next"
					position={Position.Right}
				/>
			)}
			<div className="border-t border-stone-100 px-4 py-2.5 text-[9px] font-medium tracking-widest text-stone-400">
				{type === "start"
					? "ENTRY POINT"
					: type === "end"
						? "SURVEY COMPLETE"
						: type === "options"
							? `${data.options.length} CHOICES`
							: "MESSAGE"}
			</div>
		</article>
	)
})
