import { Plus, Trash2, X } from "lucide-react"
import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BLOCKS } from "../constants"
import type { SurveyNode } from "../types"

interface Props {
	node: SurveyNode
	onPatch: (data: Partial<SurveyNode["data"]>) => void
	onAddOption: () => void
	onRemoveOption: (id: string) => void
	onDelete: () => void
	onClose: () => void
}
export function NodeInspector({
	node,
	onPatch,
	onAddOption,
	onRemoveOption,
	onDelete,
	onClose,
}: Props) {
	const fieldId = useId()
	return (
		<aside
			aria-label="Block settings"
			className="absolute inset-y-0 right-0 z-10 w-72 shrink-0 space-y-6 overflow-y-auto border-l border-stone-200 bg-white p-5 shadow-xl lg:static lg:shadow-none"
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-semibold tracking-widest text-stone-400">
						BLOCK SETTINGS
					</p>
					<h2 className="mt-2 text-lg font-semibold">
						{BLOCKS[node.type].label} block
					</h2>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Close settings"
					onClick={onClose}
				>
					<X />
				</Button>
			</div>
			<label
				htmlFor={`${fieldId}-title`}
				className="block space-y-2 text-xs font-medium"
			>
				Title
				<Input
					id={`${fieldId}-title`}
					value={node.data.label}
					onChange={(e) => onPatch({ label: e.target.value })}
				/>
			</label>
			<label
				htmlFor={`${fieldId}-content`}
				className="block space-y-2 text-xs font-medium"
			>
				{node.type === "options" ? "Description" : "Message"}
				<Textarea
					id={`${fieldId}-content`}
					rows={5}
					value={node.data.content}
					onChange={(e) => onPatch({ content: e.target.value })}
					placeholder="Write something…"
				/>
			</label>
			{node.type === "options" && (
				<fieldset className="space-y-3">
					<legend className="mb-2 text-xs font-medium">Choices</legend>
					{node.data.options.map((option, index) => (
						<div key={option.id} className="flex items-center gap-2">
							<span className="text-[10px] text-stone-400">{index + 1}</span>
							<Input
								aria-label={`Choice ${index + 1}`}
								value={option.label}
								onChange={(e) =>
									onPatch({
										options: node.data.options.map((item) =>
											item.id === option.id
												? { ...item, label: e.target.value }
												: item,
										),
									})
								}
							/>
							<Button
								variant="ghost"
								size="icon-xs"
								disabled={node.data.options.length <= 1}
								aria-label={`Remove choice ${index + 1}`}
								onClick={() => onRemoveOption(option.id)}
							>
								<X />
							</Button>
						</div>
					))}
					<Button variant="outline" className="w-full" onClick={onAddOption}>
						<Plus />
						Add choice
					</Button>
				</fieldset>
			)}
			<div className="text-[10px] text-stone-400">
				Block ID<code className="mt-1 block break-all">{node.id}</code>
			</div>
			{node.type !== "start" && (
				<Button
					variant="outline"
					className="w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
					onClick={onDelete}
				>
					<Trash2 />
					Delete block
				</Button>
			)}
		</aside>
	)
}
