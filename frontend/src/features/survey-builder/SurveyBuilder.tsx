import { ReactFlowProvider } from "@xyflow/react"
import { Check, GitBranch, ListChecks, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BlockLibrary } from "./components/BlockLibrary"
import { BuilderHeader } from "./components/BuilderHeader"
import { JsonDialog } from "./components/JsonDialog"
import { NodeInspector } from "./components/NodeInspector"
import { PathChecker } from "./components/PathChecker"
import { SurveyCanvas } from "./components/SurveyCanvas"
import { downloadJson } from "./helpers/download"
import { useSurveyEditor } from "./hooks/useSurveyEditor"
import "@xyflow/react/dist/style.css"
function Editor() {
	const editor = useSurveyEditor()
	const [showCheck, setShowCheck] = useState(false)
	const [showJson, setShowJson] = useState(false)
	const [notice, setNotice] = useState(false)
	function download() {
		downloadJson(editor.json)
		setNotice(true)
	}
	return (
		<div className="flex h-dvh min-h-[580px] flex-col text-sm">
			<BuilderHeader
				title={editor.title}
				onTitleChange={editor.setTitle}
				issueCount={editor.validation.issues.length}
				checking={showCheck}
				onCheck={() => setShowCheck((v) => !v)}
				onJson={() => setShowJson(true)}
				onExport={download}
			/>
			<div className="flex h-11 shrink-0 items-center gap-6 border-b border-stone-200 bg-white px-5 text-xs">
				<span className="flex h-full items-center gap-2 border-b-2 border-emerald-800 font-medium text-emerald-900">
					<GitBranch size={14} />
					Survey builder
				</span>
				<span className="hidden text-stone-400 md:inline">
					Make every question a conversation.
				</span>
				<span className="ml-auto text-[10px] text-stone-400">
					Changes are in this session
				</span>
			</div>
			{showCheck && (
				<PathChecker
					validation={editor.validation}
					onFocusNode={editor.focusNode}
					onClose={() => setShowCheck(false)}
				/>
			)}
			<main className="relative flex min-h-0 flex-1">
				<BlockLibrary onAdd={editor.add} />
				<SurveyCanvas
					nodes={editor.nodes}
					edges={editor.edges}
					canvasRef={editor.canvasRef}
					onNodesChange={editor.onNodesChange}
					onEdgesChange={editor.onEdgesChange}
					connect={editor.connect}
					setSelectedId={editor.setSelectedId}
				/>
				{editor.selected && (
					<NodeInspector
						node={editor.selected}
						onPatch={editor.patch}
						onAddOption={editor.addOption}
						onRemoveOption={editor.removeOption}
						onDelete={editor.removeSelected}
						onClose={() => editor.setSelectedId(null)}
					/>
				)}
			</main>
			<footer className="flex h-9 shrink-0 items-center justify-between border-t border-stone-200 bg-white px-5 text-[10px] text-stone-500">
				<span>
					{editor.nodes.length} blocks{" "}
					<span className="mx-2 text-stone-300">/</span>
					{editor.edges.length} connections
				</span>
				<button
					type="button"
					className="flex items-center gap-2 text-emerald-800"
					onClick={() => setShowCheck(true)}
				>
					{editor.validation.valid
						? "All paths complete"
						: `${editor.validation.issues.length} path issues`}
					<ListChecks size={13} />
				</button>
			</footer>
			{notice && (
				<div
					aria-live="polite"
					className="fixed bottom-14 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-emerald-950 px-4 py-3 text-xs text-white shadow-lg"
				>
					<Check size={16} />
					Survey JSON exported
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Dismiss notification"
						onClick={() => setNotice(false)}
					>
						<X />
					</Button>
				</div>
			)}
			<JsonDialog
				open={showJson}
				onOpenChange={setShowJson}
				json={editor.json}
				validation={editor.validation}
				onExport={download}
			/>
		</div>
	)
}
export function SurveyBuilder() {
	return (
		<ReactFlowProvider>
			<Editor />
		</ReactFlowProvider>
	)
}
