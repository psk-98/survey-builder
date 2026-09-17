import { Download, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import type { PathValidation } from "../types";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	json: string;
	validation: PathValidation;
	onExport: () => void;
}
export function JsonDialog({
	open,
	onOpenChange,
	json,
	validation,
	onExport,
}: Props) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl">
					<div className="flex items-start justify-between gap-4 p-6">
						<div>
							<Dialog.Title className="text-xl font-semibold tracking-tight">
								Your survey, structured.
							</Dialog.Title>
							<Dialog.Description className="mt-2 text-xs leading-5 text-stone-500">
								Nodes, choices, positions, and connections. Ready for what’s
								next.
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<Button variant="ghost" size="icon-sm" aria-label="Close JSON">
								<X />
							</Button>
						</Dialog.Close>
					</div>
					<pre
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to focus and scroll the JSON region.
						tabIndex={0}
						className="mx-5 min-h-0 overflow-auto rounded-lg bg-emerald-950 p-5 text-xs leading-6 text-emerald-100"
					>
						{json}
					</pre>
					<div className="flex flex-wrap items-center justify-between gap-3 p-5">
						<span className="text-xs text-stone-500">
							Schema version 1 ·{" "}
							{validation.valid
								? "All paths complete"
								: `Draft: ${validation.issues.length} path issues`}
						</span>
						<Button onClick={onExport}>
							<Download />
							Download JSON
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
