import {
	addEdge,
	type Connection,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react"
import { useMemo, useRef, useState } from "react"
import { initialEdges, initialNodes } from "../fixtures"
import { canConnect, checkPaths } from "../helpers/graph"
import { createSurveyNode } from "../helpers/nodes"
import { nextOptionId } from "../helpers/options"
import { serializeSurvey } from "../helpers/serialization"
import type { AddableKind, SurveyNode } from "../types"

export function useSurveyEditor() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<SurveyNode>(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const [title, setTitle] = useState("Customer experience")
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const canvasRef = useRef<HTMLElement>(null)
	const { screenToFlowPosition, fitView } = useReactFlow<SurveyNode>()
	const selected = nodes.find((n) => n.id === selectedId)
	const validation = useMemo(() => checkPaths(nodes, edges), [nodes, edges])
	const json = useMemo(
		() => JSON.stringify(serializeSurvey(title, nodes, edges), null, 2),
		[title, nodes, edges],
	)
	function add(kind: AddableKind) {
		const bounds = canvasRef.current?.getBoundingClientRect()
		if (!bounds) return
		const node = createSurveyNode(
			kind,
			crypto.randomUUID(),
			screenToFlowPosition({
				x: bounds.x + bounds.width / 2 - 100,
				y: bounds.y + bounds.height / 2 - 80,
			}),
		)
		setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), node])
		setSelectedId(node.id)
	}
	function patch(data: Partial<SurveyNode["data"]>) {
		setNodes((ns) =>
			ns.map((n) =>
				n.id === selectedId ? { ...n, data: { ...n.data, ...data } } : n,
			),
		)
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
	function addOption() {
		setNodes((ns) =>
			ns.map((n) =>
				n.id === selectedId && n.type === "options"
					? {
							...n,
							data: {
								...n.data,
								options: [
									...n.data.options,
									{
										id: nextOptionId(n.data.options),
										label: `Option ${n.data.options.length + 1}`,
									},
								],
							},
						}
					: n,
			),
		)
	}
	function removeOption(id: string) {
		if (!selected || selected.data.options.length <= 1) return
		patch({ options: selected.data.options.filter((o) => o.id !== id) })
		setEdges((es) =>
			es.filter((e) => !(e.source === selectedId && e.sourceHandle === id)),
		)
	}
	function removeSelected() {
		if (!selected || selected.type === "start") return
		setNodes((ns) => ns.filter((n) => n.id !== selected.id))
		setEdges((es) =>
			es.filter((e) => e.source !== selected.id && e.target !== selected.id),
		)
		setSelectedId(null)
	}
	function focusNode(id: string) {
		setSelectedId(id)
		setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })))
		void fitView({ nodes: [{ id }], padding: 0.5, maxZoom: 1, duration: 300 })
	}
	return {
		nodes,
		edges,
		title,
		setTitle,
		selected,
		setSelectedId,
		canvasRef,
		validation,
		json,
		add,
		patch,
		connect,
		addOption,
		removeOption,
		removeSelected,
		focusNode,
		onNodesChange,
		onEdgesChange,
	}
}
export type SurveyEditor = ReturnType<typeof useSurveyEditor>
