import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useBlocker, useNavigate } from "@tanstack/react-router"
import { ReactFlowProvider } from "@xyflow/react"
import { Check, GitBranch, ListChecks, X } from "lucide-react"
import { AlertDialog } from "radix-ui"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { api, jsonBody } from "@/lib/api/client"
import { definitionSchema } from "@/lib/api/schemas"
import { BlockLibrary } from "./components/BlockLibrary"
import { BuilderHeader } from "./components/BuilderHeader"
import { JsonDialog } from "./components/JsonDialog"
import { NodeInspector } from "./components/NodeInspector"
import { PathChecker } from "./components/PathChecker"
import { SurveyCanvas } from "./components/SurveyCanvas"
import { downloadJson } from "./helpers/download"
import { useSurveyEditor } from "./hooks/useSurveyEditor"
import type { SurveyDocument } from "./types"
import "@xyflow/react/dist/style.css"
interface BuilderProps {
	initial?: SurveyDocument
	surveyId?: string
}
function Editor({ initial, surveyId }: BuilderProps) {
	const editor = useSurveyEditor(initial)
	const navigate = useNavigate()
	const client = useQueryClient()
	const [savedJson, setSavedJson] = useState(surveyId ? editor.json : "")
	const checkpoint = useRef(editor.json)
	const blocker = useBlocker({
		shouldBlockFn: () => editor.json !== checkpoint.current,
		enableBeforeUnload: editor.json !== checkpoint.current,
		withResolver: true,
	})
	const save = useMutation({
		mutationFn: async (snapshot: string) => {
			const definition = definitionSchema.parse(JSON.parse(snapshot))
			if (!definition.title.trim())
				throw new Error("Give your survey a title before saving.")
			return api(
				surveyId ? `surveys/${encodeURIComponent(surveyId)}` : "surveys/",
				{
					method: surveyId ? "PUT" : "POST",
					body: jsonBody({ survey_definition: definition }),
				},
			)
		},
		onSuccess: async (_, snapshot) => {
			checkpoint.current = snapshot
			setSavedJson(snapshot)
			await client.invalidateQueries({ queryKey: ["surveys"] })
			if (!surveyId) await navigate({ to: "/surveys" })
		},
	})
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
				onSave={() => save.mutate(editor.json)}
				saving={save.isPending}
				saved={editor.json === savedJson}
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
					{editor.json === savedJson
						? "Changes saved"
						: "Save to keep your changes"}
				</span>
			</div>
			{save.error && (
				<p
					role="alert"
					className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700"
				>
					{save.error.message}
				</p>
			)}
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
			<AlertDialog.Root
				open={blocker.status === "blocked"}
				onOpenChange={(open) => {
					if (!open) blocker.reset?.()
				}}
			>
				<AlertDialog.Portal>
					<AlertDialog.Overlay className="fixed inset-0 z-40 bg-stone-950/40" />
					<AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6">
						<AlertDialog.Title className="text-xl font-semibold">
							Leave unsaved changes?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-3 text-sm leading-6 text-stone-500">
							Save your survey before leaving to keep your latest changes.
						</AlertDialog.Description>
						<div className="mt-6 flex justify-end gap-3">
							<Button variant="outline" onClick={() => blocker.reset?.()}>
								Keep editing
							</Button>
							<Button variant="destructive" onClick={() => blocker.proceed?.()}>
								Leave without saving
							</Button>
						</div>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
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
export function SurveyBuilder(props: BuilderProps) {
	return (
		<ReactFlowProvider>
			<Editor {...props} />
		</ReactFlowProvider>
	)
}
