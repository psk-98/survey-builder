import { ArrowRight, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_KINDS, BLOCKS } from "../constants";
import type { AddableKind } from "../types";
export function BlockLibrary({
	onAdd,
}: {
	onAdd: (kind: AddableKind) => void;
}) {
	return (
		<aside
			aria-label="Block library"
			className="flex w-[72px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-stone-200 bg-white p-3 md:w-60 md:p-5 xl:w-64"
		>
			<div className="mb-4 hidden md:block">
				<p className="text-[10px] font-semibold tracking-[.2em] text-stone-400">
					YOUR TOOLKIT
				</p>
				<h2 className="mt-2 text-lg font-semibold tracking-tight">
					Build your survey
				</h2>
				<p className="mt-2 text-xs leading-6 text-stone-500">
					A few simple blocks.
					<br />
					Endless ways to connect.
				</p>
			</div>
			{BLOCK_KINDS.map((kind) => {
				const block = BLOCKS[kind];
				const Icon = block.icon;
				return (
					<button
						type="button"
						key={kind}
						disabled={kind === "start"}
						aria-label={`${block.label} block${kind === "start" ? " (already on canvas)" : " — add"}`}
						onClick={() => {
							if (kind !== "start") onAdd(kind);
						}}
						className="flex items-center gap-3 rounded-lg border border-stone-200 p-2 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50/40 disabled:opacity-50 md:p-3"
					>
						<span
							className={cn(
								"flex size-8 shrink-0 items-center justify-center rounded-lg",
								block.color,
							)}
						>
							<Icon size={17} />
						</span>
						<span className="hidden min-w-0 flex-1 md:block">
							<strong className="text-xs font-semibold">{block.label}</strong>
							<small className="mt-1 block text-[10px] leading-4 text-stone-500">
								{block.description}
							</small>
						</span>
						{kind === "start" ? (
							<Check className="hidden size-3 shrink-0 md:block" />
						) : (
							<Plus className="hidden size-3 shrink-0 md:block" />
						)}
					</button>
				);
			})}
			<div className="mt-5 hidden rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 md:block">
				<p className="text-[9px] font-bold tracking-widest text-emerald-800">
					CONNECT THE DOTS
				</p>
				<p className="mt-3 text-xs leading-6 text-emerald-900/70">
					Drag between the dots to shape the journey. Each choice can take its
					own path.
				</p>
				<p className="mt-4 flex items-center gap-2 text-xs text-emerald-800">
					One idea <ArrowRight size={13} /> the next
				</p>
			</div>
		</aside>
	);
}
