import type { Edge, Node } from "@xyflow/react";
export type Kind = "start" | "text" | "options" | "end";
export type Option = { id: string; label: string };
export type SurveyNode = Node<
	{ label: string; content: string; options: Option[] },
	Kind
>;
export const initialNodes: SurveyNode[] = [
	{
		id: "start",
		type: "start",
		position: { x: 60, y: 180 },
		deletable: false,
		data: {
			label: "Welcome",
			content: "A little feedback goes a long way.",
			options: [],
		},
	},
	{
		id: "intro",
		type: "text",
		position: { x: 390, y: 180 },
		data: {
			label: "Before we begin",
			content:
				"We’d love to hear about your experience. This survey takes about 2 minutes.",
			options: [],
		},
	},
	{
		id: "question",
		type: "options",
		position: { x: 730, y: 140 },
		data: {
			label: "How was your experience?",
			content: "Choose the option that fits best.",
			options: [
				{ id: "option_1", label: "It was great" },
				{ id: "option_2", label: "It was okay" },
				{ id: "option_3", label: "Could be better" },
			],
		},
	},
	{
		id: "end",
		type: "end",
		position: { x: 1090, y: 180 },
		data: {
			label: "Thank you!",
			content: "Your feedback helps us make things better.",
			options: [],
		},
	},
];
export const initialEdges: Edge[] = [
	{ id: "start-intro", source: "start", target: "intro", sourceHandle: "next" },
	{
		id: "intro-question",
		source: "intro",
		target: "question",
		sourceHandle: "next",
	},
	...["option_1", "option_2", "option_3"].map((id) => ({
		id: `question-${id}`,
		source: "question",
		target: "end",
		sourceHandle: id,
	})),
];
export function serializeSurvey(
	title: string,
	nodes: SurveyNode[],
	edges: Edge[],
) {
	return {
		schemaVersion: 1,
		title,
		startNodeId: nodes.find((n) => n.type === "start")?.id ?? null,
		nodes: nodes.map(({ id, type, position, data }) => ({
			id,
			type,
			position,
			data,
		})),
		edges: edges.map(({ id, source, target, sourceHandle }) => ({
			id,
			source,
			target,
			sourceHandle: sourceHandle ?? null,
		})),
	};
}
// Ignore the outgoing branch being replaced, then reject links that introduce a cycle.
export function canConnect(
	source: string,
	target: string,
	handle: string | null,
	nodes: SurveyNode[],
	edges: Edge[],
) {
	const from = nodes.find((n) => n.id === source);
	const to = nodes.find((n) => n.id === target);
	if (
		!from ||
		!to ||
		source === target ||
		from.type === "end" ||
		to.type === "start"
	)
		return false;
	const remaining = edges.filter(
		(e) => !(e.source === source && e.sourceHandle === handle),
	);
	const pending = [target];
	const visited = new Set<string>();
	while (pending.length) {
		const current = pending.pop()!;
		if (current === source) return false;
		if (visited.has(current)) continue;
		visited.add(current);
		pending.push(
			...remaining.filter((e) => e.source === current).map((e) => e.target),
		);
	}
	return true;
}

export type PathIssue = { nodeId?: string; message: string };
export function checkPaths(nodes: SurveyNode[], edges: Edge[]) {
	const issues: PathIssue[] = [];
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const outgoing = new Map<string, Edge[]>();
	const starts = nodes.filter((n) => n.type === "start");
	if (starts.length !== 1)
		issues.push({ message: "The survey must have exactly one Start block." });
	for (const edge of edges) {
		const source = byId.get(edge.source),
			target = byId.get(edge.target);
		if (!source || !target) {
			issues.push({
				nodeId: source?.id,
				message: "A connection points to a missing block.",
			});
			continue;
		}
		const handles =
			source.type === "options"
				? source.data.options.map((o) => o.id)
				: source.type === "end"
					? []
					: ["next"];
		if (!handles.includes(edge.sourceHandle ?? "") || target.type === "start") {
			issues.push({
				nodeId: source.id,
				message: `“${source.data.label}” has an invalid connection.`,
			});
			continue;
		}
		outgoing.set(source.id, [...(outgoing.get(source.id) ?? []), edge]);
	}
	const reachable = new Set<string>();
	const pending = starts.map((n) => n.id);
	while (pending.length) {
		const id = pending.pop()!;
		if (reachable.has(id)) continue;
		reachable.add(id);
		pending.push(...(outgoing.get(id) ?? []).map((e) => e.target));
	}
	for (const node of nodes) {
		const label = node.data.label || "Untitled block";
		if (!reachable.has(node.id))
			issues.push({
				nodeId: node.id,
				message: `“${label}” is not connected to Start. Connect it or remove it.`,
			});
		if (node.type === "end") continue;
		const ports =
			node.type === "options"
				? node.data.options
				: [{ id: "next", label: "Next" }];
		if (!ports.length)
			issues.push({
				nodeId: node.id,
				message: `“${label}” needs at least one choice.`,
			});
		for (const port of ports) {
			const count = (outgoing.get(node.id) ?? []).filter(
				(e) => e.sourceHandle === port.id,
			).length;
			if (count === 0)
				issues.push({
					nodeId: node.id,
					message:
						node.type === "options"
							? `“${label}” → “${port.label || "Untitled choice"}” has no connection. Connect this choice to a path ending at End.`
							: `“${label}” has no next block. Connect it to a path ending at End.`,
				});
			if (count > 1)
				issues.push({
					nodeId: node.id,
					message: `“${label}” → “${port.label}” has multiple connections. Keep one.`,
				});
		}
	}
	// Iterative DFS catches cycles without enumerating exponentially many branching paths.
	const state = new Map<string, number>();
	for (const node of nodes) {
		if (state.has(node.id)) continue;
		const stack: { id: string; exit: boolean }[] = [
			{ id: node.id, exit: false },
		];
		while (stack.length) {
			const item = stack.pop()!;
			if (item.exit) {
				state.set(item.id, 2);
				continue;
			}
			if (state.get(item.id) === 1) {
				issues.push({
					nodeId: item.id,
					message: `A loop at “${byId.get(item.id)?.data.label}” can prevent a path from reaching End.`,
				});
				continue;
			}
			if (state.get(item.id) === 2) continue;
			state.set(item.id, 1);
			stack.push({ id: item.id, exit: true });
			for (const edge of outgoing.get(item.id) ?? [])
				stack.push({ id: edge.target, exit: false });
		}
	}
	return {
		valid: issues.length === 0,
		issues,
		endCount: nodes.filter((n) => n.type === "end" && reachable.has(n.id))
			.length,
	};
}

// IDs are scoped to the owning node; existing options are never renumbered.
export function nextOptionId(options: Option[]): string {
	const highest = options.reduce((max, option) => {
		const match = /^option_(\d+)$/.exec(option.id);
		return match ? Math.max(max, Number(match[1])) : max;
	}, 0);
	return `option_${highest + 1}`;
}
