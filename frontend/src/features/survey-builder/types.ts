import type { Node } from "@xyflow/react";
export type SurveyNodeType = "start" | "text" | "options" | "end";
export type SurveyOption = { id: string; label: string };
export type SurveyNodeData = {
	label: string;
	content: string;
	options: SurveyOption[];
};
export type SurveyNode = Node<SurveyNodeData, SurveyNodeType> & {
	type: SurveyNodeType;
};

export type AddableKind = Exclude<SurveyNodeType, "start">;
export type PathIssue = { nodeId?: string; message: string };
export type PathValidation = {
	valid: boolean;
	issues: PathIssue[];
	endCount: number;
};
export interface SurveyDocument {
	schemaVersion: 1;
	title: string;
	startNodeId: string | null;
	nodes: Array<{
		id: string;
		type: SurveyNodeType;
		position: { x: number; y: number };
		data: SurveyNodeData;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
		sourceHandle: string | null;
	}>;
}
