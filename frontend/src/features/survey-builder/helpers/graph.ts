import type { Edge } from "@xyflow/react"
import type { PathIssue, PathValidation, SurveyNode } from "../types"
// Ignore the outgoing branch being replaced, then reject links that introduce a cycle.
export function canConnect(
	source: string,
	target: string,
	handle: string | null,
	nodes: SurveyNode[],
	edges: Edge[],
) {
	const from = nodes.find((n) => n.id === source)
	const to = nodes.find((n) => n.id === target)
	if (
		!from ||
		!to ||
		source === target ||
		from.type === "end" ||
		to.type === "start"
	)
		return false
	const remaining = edges.filter(
		(e) => !(e.source === source && e.sourceHandle === handle),
	)
	const pending = [target]
	const visited = new Set<string>()
	while (pending.length) {
		const current = pending.pop()
		if (current === undefined) break
		if (current === source) return false
		if (visited.has(current)) continue
		visited.add(current)
		pending.push(
			...remaining.filter((e) => e.source === current).map((e) => e.target),
		)
	}
	return true
}

export function checkPaths(nodes: SurveyNode[], edges: Edge[]): PathValidation {
	const issues: PathIssue[] = []
	const byId = new Map(nodes.map((n) => [n.id, n]))
	const outgoing = new Map<string, Edge[]>()
	const starts = nodes.filter((n) => n.type === "start")
	if (starts.length !== 1)
		issues.push({ message: "The survey must have exactly one Start block." })
	for (const edge of edges) {
		const source = byId.get(edge.source),
			target = byId.get(edge.target)
		if (!source || !target) {
			issues.push({
				nodeId: source?.id,
				message: "A connection points to a missing block.",
			})
			continue
		}
		const handles =
			source.type === "options"
				? source.data.options.map((o) => o.id)
				: source.type === "end"
					? []
					: ["next"]
		if (!handles.includes(edge.sourceHandle ?? "") || target.type === "start") {
			issues.push({
				nodeId: source.id,
				message: `“${source.data.label}” has an invalid connection.`,
			})
			continue
		}
		outgoing.set(source.id, [...(outgoing.get(source.id) ?? []), edge])
	}
	const reachable = new Set<string>()
	const pending = starts.map((n) => n.id)
	while (pending.length) {
		const id = pending.pop()
		if (id === undefined) break
		if (reachable.has(id)) continue
		reachable.add(id)
		pending.push(...(outgoing.get(id) ?? []).map((e) => e.target))
	}
	for (const node of nodes) {
		const label = node.data.label || "Untitled block"
		if (!reachable.has(node.id))
			issues.push({
				nodeId: node.id,
				message: `“${label}” is not connected to Start. Connect it or remove it.`,
			})
		if (node.type === "end") continue
		const ports =
			node.type === "options"
				? node.data.options
				: [{ id: "next", label: "Next" }]
		if (!ports.length)
			issues.push({
				nodeId: node.id,
				message: `“${label}” needs at least one choice.`,
			})
		for (const port of ports) {
			const count = (outgoing.get(node.id) ?? []).filter(
				(e) => e.sourceHandle === port.id,
			).length
			if (count === 0)
				issues.push({
					nodeId: node.id,
					message:
						node.type === "options"
							? `“${label}” → “${port.label || "Untitled choice"}” has no connection. Connect this choice to a path ending at End.`
							: `“${label}” has no next block. Connect it to a path ending at End.`,
				})
			if (count > 1)
				issues.push({
					nodeId: node.id,
					message: `“${label}” → “${port.label}” has multiple connections. Keep one.`,
				})
		}
	}
	// Iterative DFS catches cycles without enumerating exponentially many branching paths.
	const state = new Map<string, number>()
	for (const node of nodes) {
		if (state.has(node.id)) continue
		const stack: { id: string; exit: boolean }[] = [
			{ id: node.id, exit: false },
		]
		while (stack.length) {
			const item = stack.pop()
			if (!item) break
			if (item.exit) {
				state.set(item.id, 2)
				continue
			}
			if (state.get(item.id) === 1) {
				issues.push({
					nodeId: item.id,
					message: `A loop at “${byId.get(item.id)?.data.label}” can prevent a path from reaching End.`,
				})
				continue
			}
			if (state.get(item.id) === 2) continue
			state.set(item.id, 1)
			stack.push({ id: item.id, exit: true })
			for (const edge of outgoing.get(item.id) ?? [])
				stack.push({ id: edge.target, exit: false })
		}
	}
	return {
		valid: issues.length === 0,
		issues,
		endCount: nodes.filter((n) => n.type === "end" && reachable.has(n.id))
			.length,
	}
}
