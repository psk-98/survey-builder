import { Braces, Download, ListChecks } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";

interface Props {
	title: string;
	onTitleChange: (value: string) => void;
	issueCount: number;
	checking: boolean;
	onCheck: () => void;
	onJson: () => void;
	onExport: () => void;
}
export function BuilderHeader({
	title,
	onTitleChange,
	issueCount,
	checking,
	onCheck,
	onJson,
	onExport,
}: Props) {
	return (
		<header className="flex shrink-0 flex-wrap items-center gap-4 border-b border-stone-200 bg-white px-4 py-4 lg:px-7">
			<Brand />
			<div className="ml-auto flex items-center gap-2 sm:ml-2 sm:border-l sm:border-stone-200 sm:pl-5">
				<input
					className="w-36 rounded-md bg-transparent px-2 py-1 text-sm font-medium sm:w-48"
					aria-label="Survey name"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
				/>
				<span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] text-stone-500">
					Draft
				</span>
			</div>
			<div className="flex w-full flex-wrap gap-2 lg:ml-auto lg:w-auto">
				<Button variant="outline" aria-expanded={checking} onClick={onCheck}>
					<ListChecks />
					Check paths
					{issueCount > 0 && (
						<span className="rounded bg-amber-100 px-1.5 text-xs text-amber-800">
							{issueCount}
						</span>
					)}
				</Button>
				<Button variant="outline" onClick={onJson}>
					<Braces />
					View JSON
				</Button>
				<Button onClick={onExport}>
					<Download />
					Export JSON
				</Button>
			</div>
		</header>
	);
}
