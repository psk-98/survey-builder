import { Link } from "@tanstack/react-router"
import {
	ArrowDown,
	ArrowRight,
	Braces,
	Check,
	GitBranch,
	ListChecks,
	Plus,
	Sparkles,
} from "lucide-react"
import { Brand } from "@/components/layout/Brand"
import { Button } from "@/components/ui/button"

const features = [
	{
		icon: Plus,
		title: "Start with simple blocks",
		description:
			"Welcome your audience, share a message, or ask a question. Build one step at a time.",
	},
	{
		icon: GitBranch,
		title: "Let every answer lead",
		description:
			"Give each choice its own path. Bring branches together or finish with a personal ending.",
	},
	{
		icon: ListChecks,
		title: "Leave no loose ends",
		description:
			"Check that every choice leads somewhere and every journey reaches an ending.",
	},
]
export function HomePage() {
	return (
		<div className="min-h-dvh bg-[#f7f8f2] text-stone-800">
			<header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-12">
				<Brand />
				<Button variant="ghost" className="ml-auto" asChild>
					<Link to="/login">Sign in</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link to="/surveys">
						Open builder
						<ArrowRight />
					</Link>
				</Button>
			</header>
			<main>
				<section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pt-16 pb-20 lg:grid-cols-2 lg:px-12 lg:pt-24 lg:pb-28">
					<div>
						<div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-800">
							<Sparkles size={13} />A better way to ask
						</div>
						<h1 className="mt-7 max-w-xl text-5xl leading-[1.1] font-semibold tracking-[-.055em] text-emerald-950 sm:text-6xl lg:text-7xl">
							Good questions.
							<br />
							<span className="text-emerald-700">Great conversations.</span>
						</h1>
						<p className="mt-6 max-w-md text-base leading-8 text-stone-500">
							Turn a list of questions into a thoughtful journey. Build a survey
							that follows your audience, one answer at a time.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-4">
							<Button size="lg" className="h-12 rounded-lg px-6" asChild>
								<Link to="/surveys">
									Build your survey
									<ArrowRight />
								</Link>
							</Button>
							<span className="text-xs text-stone-500">
								Your next idea starts here.
							</span>
						</div>
						<p className="mt-6 flex items-center gap-2 text-xs text-emerald-800">
							<Check size={14} />
							Visual editing. Flexible paths. Clear endings.
						</p>
					</div>
					<FlowIllustration />
				</section>
				<section className="border-y border-stone-200/80 bg-white">
					<div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
						<div className="mb-10 flex flex-wrap items-end justify-between gap-5">
							<div>
								<p className="text-[10px] font-semibold tracking-[.2em] text-emerald-700">
									FROM FIRST HELLO TO THANK YOU
								</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">
									A little structure. A lot of possibility.
								</h2>
							</div>
							<span className="text-xs text-stone-500">
								Designed to keep you in the flow.
							</span>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							{features.map(({ icon: Icon, title, description }, index) => (
								<article key={title} className="border-t border-stone-200 pt-6">
									<div className="flex items-center justify-between">
										<span className="flex size-10 items-center justify-center rounded-xl bg-stone-100 text-emerald-900">
											<Icon size={18} />
										</span>
										<span className="font-mono text-xs text-stone-300">
											0{index + 1}
										</span>
									</div>
									<h3 className="mt-5 text-base font-semibold">{title}</h3>
									<p className="mt-3 max-w-sm text-sm leading-7 text-stone-500">
										{description}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>
				<section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-6 py-14 md:flex-row md:items-center lg:px-12">
					<div className="flex items-start gap-4">
						<span className="rounded-xl border border-emerald-200 bg-white p-3 text-emerald-800">
							<Braces size={22} />
						</span>
						<div>
							<h2 className="text-lg font-semibold tracking-tight">
								Built visually. Ready for what’s next.
							</h2>
							<p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
								Export your survey as structured JSON, with every block, choice,
								and connection included.
							</p>
						</div>
					</div>
					<Button variant="outline" asChild>
						<Link to="/surveys">
							Explore the builder
							<ArrowRight />
						</Link>
					</Button>
				</section>
			</main>
			<footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-6 py-6 text-xs text-stone-400 lg:px-12">
				<span>formlane</span>
				<span>Make every question a conversation.</span>
			</footer>
		</div>
	)
}
function FlowIllustration() {
	return (
		<div
			role="img"
			aria-label="Example survey: a welcome message leads to a question with two different endings"
			className="relative rounded-3xl border border-emerald-900/10 bg-emerald-100/40 p-6 shadow-[0_24px_80px_-40px_rgba(6,78,59,.35)] sm:p-10"
		>
			<div className="mb-7 flex items-center gap-2 text-[10px] font-medium tracking-widest text-emerald-900/60">
				<span className="size-1.5 rounded-full bg-emerald-600" />A CONVERSATION,
				CONNECTED
			</div>
			<div className="mx-auto max-w-xs rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
				<p className="text-[10px] font-semibold tracking-wider text-emerald-700">
					START
				</p>
				<p className="mt-2 text-sm font-semibold">
					Hey there. Glad you’re here.
				</p>
				<p className="mt-1 text-xs text-stone-500">
					Let’s make your experience better.
				</p>
			</div>
			<ArrowDown className="mx-auto my-3 size-5 text-emerald-600/50" />
			<div className="mx-auto max-w-xs rounded-xl border border-emerald-400 bg-white p-4 shadow-sm ring-4 ring-emerald-600/5">
				<p className="text-[10px] font-semibold tracking-wider text-amber-700">
					OPTIONS
				</p>
				<p className="mt-2 text-sm font-semibold">How did we do?</p>
				<div className="mt-3 space-y-2">
					<div className="rounded-md border border-stone-200 p-2 text-xs text-stone-600">
						A <span className="ml-2">Loved it</span>
					</div>
					<div className="rounded-md border border-stone-200 p-2 text-xs text-stone-600">
						B <span className="ml-2">Room to grow</span>
					</div>
				</div>
			</div>
			<div className="mx-auto mt-3 mb-4 flex w-2/3 justify-between text-emerald-600/50">
				<ArrowDown size={20} />
				<ArrowDown size={20} />
			</div>
			<div className="grid grid-cols-2 gap-3">
				{["You made our day.", "We’re listening."].map((label) => (
					<div
						key={label}
						className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
					>
						<p className="text-[10px] font-semibold tracking-wider text-rose-600">
							END
						</p>
						<p className="mt-2 text-xs font-semibold">{label}</p>
					</div>
				))}
			</div>
			<div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-emerald-800">
				<Check size={13} />
				Every path has a thoughtful ending
			</div>
		</div>
	)
}
