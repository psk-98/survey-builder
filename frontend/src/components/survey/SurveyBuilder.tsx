import { useEffect, useRef, useState } from "react"
import {
	ReactFlow,
	ReactFlowProvider,
	Background,
	Controls,
	MiniMap,
	Handle,
	Position,
	addEdge,
	useNodesState,
	useEdgesState,
	useReactFlow,
	useNodesInitialized,
	useUpdateNodeInternals,
	type NodeProps,
	type Connection,
} from "@xyflow/react"
import {
	ArrowRight,
	Braces,
	Check,
	CircleStop,
	Download,
	GitBranch,
	ListChecks,
	Plus,
	Play,
	TextCursorInput,
	Trash2,
	X,
} from "lucide-react"
import {
	initialNodes,
	initialEdges,
	serializeSurvey,
	canConnect,
	checkPaths,
	nextOptionId,
	type Kind,
	type SurveyNode,
} from "./model"
import "@xyflow/react/dist/style.css"
import "./survey.css"
const info = {
	start: {
		label: "Start",
		icon: Play,
		description: "The beginning of your survey",
	},
	text: {
		label: "Text",
		icon: TextCursorInput,
		description: "Share a message or instructions",
	},
	options: {
		label: "Options",
		icon: ListChecks,
		description: "Ask a question with choices",
	},
	end: {
		label: "End",
		icon: CircleStop,
		description: "Wrap up with a final message",
	},
}
function SurveyBlock({ id, type, data, selected }: NodeProps<SurveyNode>) {
	const kind = type ?? "text"
	const Icon = info[kind].icon
	const update = useUpdateNodeInternals()
	useEffect(() => {
		update(id)
	}, [id, data.options, update])
	return (
		<div className={`survey-node ${kind} ${selected ? "active" : ""}`}>
			{kind !== "start" && <Handle type="target" position={Position.Left} />}
			<div className="node-kicker">
				<span className={`block-icon ${kind}`}>
					<Icon size={15} />
				</span>
				{info[kind].label}
				<span className="node-dots">•••</span>
			</div>
			<h3>{data.label || "Untitled block"}</h3>
			<p>{data.content || "Add your text…"}</p>
			{kind === "options" && (
				<div className="node-options">
					{data.options.map((option, index) => (
						<div className="node-option" key={option.id}>
							<span>{String.fromCharCode(65 + index)}</span>
							{option.label || "Untitled option"}
							<Handle type="source" id={option.id} position={Position.Right} />
						</div>
					))}
				</div>
			)}
			{kind !== "end" && kind !== "options" && (
				<Handle type="source" id="next" position={Position.Right} />
			)}
			<div className="node-footer">
				{kind === "start"
					? "ENTRY POINT"
					: kind === "end"
						? "SURVEY COMPLETE"
						: kind === "options"
							? `${data.options.length} CHOICES`
							: "MESSAGE"}
			</div>
		</div>
	)
}
const nodeTypes = {
	start: SurveyBlock,
	text: SurveyBlock,
	options: SurveyBlock,
	end: SurveyBlock,
}
function Editor() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<SurveyNode>(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const [title, setTitle] = useState("Customer experience")
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [showJson, setShowJson] = useState(false)
	const [showCheck, setShowCheck] = useState(false)
	const validation = checkPaths(nodes, edges)
	const [notice, setNotice] = useState("")
	const { screenToFlowPosition, fitView } = useReactFlow()
	const initialized = useNodesInitialized()
	const fitted = useRef(false)
	useEffect(() => {
		if (initialized && !fitted.current) {
			fitted.current = true
			requestAnimationFrame(() => {
				void fitView({ padding: 0.18 })
			})
		}
	}, [initialized, fitView])
	useEffect(() => {
		if (!showJson) return
		const previous = document.activeElement as HTMLElement | null
		const dialog = document.querySelector<HTMLElement>(".json-modal")!
		const controls = () =>
			Array.from(dialog.querySelectorAll<HTMLElement>('button, [tabindex="0"]'))
		controls()[0]?.focus()
		function keydown(event: KeyboardEvent) {
			if (event.key === "Escape") setShowJson(false)
			if (event.key === "Tab") {
				const items = controls()
				const first = items[0],
					last = items[items.length - 1]
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault()
					last?.focus()
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault()
					first?.focus()
				}
			}
		}
		document.addEventListener("keydown", keydown)
		return () => {
			document.removeEventListener("keydown", keydown)
			previous?.focus()
		}
	}, [showJson])
	const selected = nodes.find((n) => n.id === selectedId)
	const json = JSON.stringify(serializeSurvey(title, nodes, edges), null, 2)
	function patch(data: Partial<SurveyNode["data"]>) {
		setNodes((ns) =>
			ns.map((n) =>
				n.id === selectedId ? { ...n, data: { ...n.data, ...data } } : n,
			),
		)
	}
	function add(kind: Kind) {
		const id = crypto.randomUUID()
		const canvas = document
			.querySelector(".flow-canvas")!
			.getBoundingClientRect()
		setNodes((ns) => [
			...ns.map((n) => ({ ...n, selected: false })),
			{
				id,
				type: kind,
				selected: true,
				position: screenToFlowPosition({
					x: canvas.x + canvas.width / 2 - 100,
					y: canvas.y + canvas.height / 2 - 80,
				}),
				data: {
					label:
						kind === "end"
							? "Thank you!"
							: kind === "text"
								? "Your message"
								: "Your question",
					content: "",
					options:
						kind === "options"
							? [
									{ id: "option_1", label: "Option 1" },
									{ id: "option_2", label: "Option 2" },
								]
							: [],
				},
			},
		])
		setSelectedId(id)
	}
	function connect(connection: Connection) {
		if (
			!canConnect(
				connection.source,
				connection.target,
				connection.sourceHandle,
				nodes,
				edges,
			)
		)
			return
		setEdges((es) =>
			addEdge(
				connection,
				es.filter(
					(e) =>
						!(
							e.source === connection.source &&
							e.sourceHandle === connection.sourceHandle
						),
				),
			),
		)
	}
	function removeOption(id: string) {
		patch({ options: selected!.data.options.filter((o) => o.id !== id) })
		setEdges((es) =>
			es.filter((e) => !(e.source === selectedId && e.sourceHandle === id)),
		)
	}
	function download() {
		const url = URL.createObjectURL(
			new Blob([json], { type: "application/json" }),
		)
		const anchor = document.createElement("a")
		anchor.href = url
		anchor.download = "survey.json"
		anchor.click()
		URL.revokeObjectURL(url)
		setNotice("Survey JSON exported")
	}
	return (
		<div className="builder">
			<header className="topbar">
				<div className="brand">
					<span className="brand-mark">
						<GitBranch size={22} />
					</span>
					formlane
					<span className="brand-divider" />
				</div>
				<div className="survey-title">
					<input
						aria-label="Survey name"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<span className="draft">Draft</span>
				</div>
				<div className="header-actions">
					<button
						className="button"
						aria-expanded={showCheck}
						onClick={() => setShowCheck((v) => !v)}
					>
						<ListChecks size={16} />
						Check paths
						{!validation.valid && (
							<span className="issue-count">{validation.issues.length}</span>
						)}
					</button>
					<button className="button" onClick={() => setShowJson(true)}>
						<Braces size={16} />
						View JSON
					</button>
					<button className="button primary" onClick={download}>
						<Download size={16} />
						Export JSON
					</button>
				</div>
			</header>
			<div className="workspace-bar">
				<span>
					<GitBranch size={15} /> Survey builder
				</span>
				<p>Make every question a conversation.</p>
				<span className="local-note">Changes are in this session</span>
			</div>
			{showCheck && (
				<section
					className={`path-check ${validation.valid ? "valid" : "invalid"}`}
					aria-label="Path checker"
				>
					<div className="check-heading">
						<div role="status">
							<strong>
								{validation.valid
									? "Every path reaches an End"
									: `${validation.issues.length} ${validation.issues.length === 1 ? "issue" : "issues"} to fix`}
							</strong>
							<p>
								{validation.valid
									? `${validation.endCount} connected End ${validation.endCount === 1 ? "block" : "blocks"}. All choices are connected and there are no loops.`
									: "Every choice needs a complete path. Unused blocks must be connected or removed."}
							</p>
						</div>
						<button
							className="icon-button"
							aria-label="Close path checker"
							onClick={() => setShowCheck(false)}
						>
							<X size={17} />
						</button>
					</div>
					{!validation.valid && (
						<ul>
							{validation.issues.map((issue, index) => (
								<li key={`${issue.nodeId}-${index}`}>
									{issue.nodeId ? (
										<button
											onClick={() => {
												setSelectedId(issue.nodeId!)
												setNodes((ns) =>
													ns.map((n) => ({
														...n,
														selected: n.id === issue.nodeId,
													})),
												)
												void fitView({
													nodes: [{ id: issue.nodeId! }],
													padding: 0.5,
													maxZoom: 1,
													duration: 300,
												})
											}}
										>
											{issue.message}
											<ArrowRight size={14} />
										</button>
									) : (
										issue.message
									)}
								</li>
							))}
						</ul>
					)}
				</section>
			)}
			<main className="workspace">
				<aside className="library">
					<div className="section-eyebrow">YOUR TOOLKIT</div>
					<h2>Build your survey</h2>
					<p className="muted">
						A few simple blocks.
						<br />
						Endless ways to connect.
					</p>
					<div className="library-label">
						BLOCKS <span>4</span>
					</div>
					{(Object.keys(info) as Kind[]).map((kind) => {
						const Icon = info[kind].icon
						const fixed = kind === "start"
						return (
							<button
								key={kind}
								aria-label={`${info[kind].label} block${fixed ? " (already on canvas)" : " — add"}`}
								className="library-block"
								disabled={fixed}
								onClick={() => add(kind)}
							>
								<span className={`block-icon ${kind}`}>
									<Icon size={19} />
								</span>
								<span>
									<strong>{info[kind].label}</strong>
									<small>{info[kind].description}</small>
								</span>
								{fixed ? <Check size={14} /> : <Plus size={16} />}
							</button>
						)
					})}
					<div className="tip">
						<span>CONNECT THE DOTS</span>
						<p>
							Drag between the dots on your blocks to shape the journey. Each
							choice can take its own path.
						</p>
						<div>
							One idea <ArrowRight size={14} /> the next
						</div>
					</div>
					<div className="library-bottom">
						<span className="green-dot" />A little structure. A lot of
						possibility.
					</div>
				</aside>
				<section className="flow-canvas" aria-label="Survey canvas">
					<div className="canvas-label">
						<span className="green-dot" />
						FLOW CANVAS <span> / </span>
						{nodes.length} blocks
					</div>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						nodeTypes={nodeTypes}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={connect}
						isValidConnection={(c) =>
							canConnect(
								c.source,
								c.target,
								c.sourceHandle ?? null,
								nodes,
								edges,
							)
						}
						onNodeClick={(_, n) => setSelectedId(n.id)}
						onPaneClick={() => setSelectedId(null)}
						fitView
						fitViewOptions={{ padding: 0.18 }}
						minZoom={0.25}
						maxZoom={1.5}
						defaultEdgeOptions={{
							type: "smoothstep",
							style: { stroke: "#a5b5ad", strokeWidth: 1.8 },
						}}
						deleteKeyCode={["Backspace", "Delete"]}
					>
						<Background color="#d6dcd6" gap={22} size={1} />
						<Controls showInteractive={false} />
						<MiniMap
							nodeColor="#bbd2c4"
							maskColor="rgba(247,248,244,.75)"
							pannable
							zoomable
						/>
					</ReactFlow>
					<div className="canvas-hint">
						Drag to move · Scroll to zoom · Select a block to edit
					</div>
					<button
						className="fit-button"
						onClick={() => fitView({ padding: 0.2, duration: 300 })}
					>
						Fit all blocks
					</button>
				</section>
				{selected && (
					<aside className="inspector">
						<div className="inspector-heading">
							<div>
								<div className="section-eyebrow">BLOCK SETTINGS</div>
								<h2>{info[selected.type ?? "text"].label} block</h2>
							</div>
							<button
								className="icon-button"
								aria-label="Close settings"
								onClick={() => setSelectedId(null)}
							>
								<X size={18} />
							</button>
						</div>
						<label>
							Title
							<input
								value={selected.data.label}
								onChange={(e) => patch({ label: e.target.value })}
							/>
						</label>
						<label>
							{selected.type === "options" ? "Description" : "Message"}
							<textarea
								rows={5}
								value={selected.data.content}
								onChange={(e) => patch({ content: e.target.value })}
								placeholder="Write something…"
							/>
						</label>
						{selected.type === "options" && (
							<div className="option-editor">
								<label>Choices</label>
								{selected.data.options.map((o, index) => (
									<div className="option-input" key={o.id}>
										<span>{index + 1}</span>
										<input
											aria-label={`Choice ${index + 1}`}
											value={o.label}
											onChange={(e) =>
												patch({
													options: selected.data.options.map((item) =>
														item.id === o.id
															? { ...item, label: e.target.value }
															: item,
													),
												})
											}
										/>
										<button
											className="icon-button"
											disabled={selected.data.options.length <= 1}
											aria-label={`Remove choice ${index + 1}`}
											onClick={() => removeOption(o.id)}
										>
											<X size={14} />
										</button>
									</div>
								))}
								<button
									className="button add-choice"
									onClick={() =>
										patch({
											options: [
												...selected.data.options,
												{
													id: nextOptionId(selected.data.options),
													label: `Option ${selected.data.options.length + 1}`,
												},
											],
										})
									}
								>
									<Plus size={15} />
									Add choice
								</button>
							</div>
						)}
						<div className="node-id">
							Block ID <code>{selected.id}</code>
						</div>
						{selected.deletable !== false && (
							<button
								className="button danger"
								onClick={() => {
									setNodes((ns) => ns.filter((n) => n.id !== selected.id))
									setEdges((es) =>
										es.filter(
											(e) =>
												e.source !== selected.id && e.target !== selected.id,
										),
									)
									setSelectedId(null)
								}}
							>
								<Trash2 size={15} />
								Delete block
							</button>
						)}
					</aside>
				)}
			</main>
			<footer className="statusbar">
				<span>
					<span className="green-dot" />
					{nodes.length} blocks <span className="footer-divider">/</span>{" "}
					{edges.length} connections
				</span>
				<span>
					<button className="path-status" onClick={() => setShowCheck(true)}>
						{validation.valid
							? "All paths complete"
							: `${validation.issues.length} path issues`}{" "}
						<ListChecks size={13} />
					</button>
				</span>
			</footer>
			{notice && (
				<div className="toast" role="status">
					<Check size={16} />
					{notice}
					<button
						className="icon-button"
						aria-label="Dismiss notification"
						onClick={() => setNotice("")}
					>
						<X size={14} />
					</button>
				</div>
			)}
			{showJson && (
				<div className="modal-backdrop">
					<section
						role="dialog"
						aria-modal="true"
						aria-label="Survey JSON"
						className="json-modal"
					>
						<div className="modal-heading">
							<div>
								<h2>Your survey, structured.</h2>
								<p>
									Nodes, choices, positions, and connections. Ready for what’s
									next.
								</p>
							</div>
							<button
								autoFocus
								className="icon-button"
								aria-label="Close JSON"
								onClick={() => setShowJson(false)}
							>
								<X />
							</button>
						</div>
						<pre tabIndex={0}>{json}</pre>
						<div className="modal-footer">
							<span>
								Schema version 1 ·{" "}
								{validation.valid
									? "All paths complete"
									: `Draft: ${validation.issues.length} path issues`}
							</span>
							<button className="button primary" onClick={download}>
								<Download size={15} />
								Download JSON
							</button>
						</div>
					</section>
				</div>
			)}
		</div>
	)
}
export default function SurveyBuilder() {
	return (
		<ReactFlowProvider>
			<Editor />
		</ReactFlowProvider>
	)
}
