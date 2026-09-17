import { Link } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";
export function Brand() {
	return (
		<Link
			to="/"
			aria-label="Formlane home"
			className="inline-flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-emerald-950 no-underline"
		>
			<span className="flex size-9 items-center justify-center rounded-xl bg-emerald-900 text-white">
				<GitBranch className="size-5" />
			</span>
			formlane
		</Link>
	);
}
