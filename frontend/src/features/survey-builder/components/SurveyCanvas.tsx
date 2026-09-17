import {
	Background,
	Controls,
	MiniMap,
	type NodeTypes,
	ReactFlow,
	useNodesInitialized,
	useReactFlow,
} from "@xyflow/react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { canConnect } from "../helpers/graph";
import type { SurveyEditor } from "../hooks/useSurveyEditor";
import { SurveyBlock } from "./SurveyBlock";

const nodeTypes = {
	start: SurveyBlock,
	text: SurveyBlock,
	options: SurveyBlock,
	end: SurveyBlock,
} satisfies NodeTypes;
type Props = Pick<
	SurveyEditor,
	| "nodes"
	| "edges"
	| "canvasRef"
	| "onNodesChange"
	| "onEdgesChange"
	| "connect"
	| "setSelectedId"
>;
export function SurveyCanvas({
	nodes,
	edges,
	canvasRef,
	onNodesChange,
	onEdgesChange,
	connect,
	setSelectedId,
}: Props) {
	const initialized = useNodesInitialized();
	const fitted = useRef(false);
	const { fitView } = useReactFlow();
	useEffect(() => {
		if (!initialized || fitted.current) return;
		const frame = requestAnimationFrame(() => {
			fitted.current = true;
			void fitView({ padding: 0.18 });
		});
		return () => cancelAnimationFrame(frame);
	}, [initialized, fitView]);
	return (
		<section
			ref={canvasRef}
			aria-label="Survey canvas"
			className="relative min-w-0 flex-1 bg-stone-50 [--xy-edge-stroke-default:#91a797] [--xy-edge-stroke-width-default:1.8] [--xy-controls-button-background-color-default:white] [--xy-controls-button-border-color-default:#e7e5e4] [&_.react-flow__controls]:overflow-hidden [&_.react-flow__controls]:rounded-lg [&_.react-flow__controls]:border [&_.react-flow__controls]:border-stone-200 [&_.react-flow__controls]:shadow-sm"
		>
			<div className="pointer-events-none absolute top-5 left-5 z-10 flex items-center gap-2 text-[10px] font-medium tracking-wider text-stone-500">
				<span className="size-1.5 rounded-full bg-emerald-600" />
				FLOW CANVAS<span className="text-stone-300">/</span>
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
					canConnect(c.source, c.target, c.sourceHandle ?? null, nodes, edges)
				}
				onNodeClick={(_, n) => setSelectedId(n.id)}
				onPaneClick={() => setSelectedId(null)}
				fitView
				fitViewOptions={{ padding: 0.18 }}
				minZoom={0.1}
				maxZoom={1.5}
				defaultEdgeOptions={{ type: "smoothstep" }}
				deleteKeyCode={["Backspace", "Delete"]}
			>
				<Background color="#d6d3d1" gap={22} size={1} />
				<Controls showInteractive={false} />
				<MiniMap
					className="!bottom-4 hidden sm:block !rounded-lg !border !border-stone-200"
					nodeColor="#bad5c3"
					maskColor="rgba(250,250,249,.75)"
					pannable
					zoomable
				/>
			</ReactFlow>
			<p className="pointer-events-none absolute bottom-5 left-16 hidden text-[10px] text-stone-400 md:block">
				Drag to move · Scroll to zoom · Select a block to edit
			</p>
			<Button
				variant="outline"
				size="sm"
				className="absolute top-4 right-4 text-xs"
				onClick={() => fitView({ padding: 0.2, duration: 300 })}
			>
				Fit all blocks
			</Button>
		</section>
	);
}
