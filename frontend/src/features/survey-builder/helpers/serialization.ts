import type { Edge } from "@xyflow/react";
import type { SurveyDocument, SurveyNode } from "../types";
export function serializeSurvey(
	title: string,
	nodes: SurveyNode[],
	edges: Edge[],
): SurveyDocument {
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
