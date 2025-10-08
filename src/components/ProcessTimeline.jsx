import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const steps = [
	{
		title: 'Discover',
		description:
			'Workshops, stakeholder interviews, analytics audits, and competitive reviews align on outcomes, success metrics, and user journeys.',
	},
	{
		title: 'Scope',
		description:
			'Feature prioritization, technical architecture, and delivery plan. We map milestones, resources, and integrations with transparent timelines.',
	},
	{
		title: 'Build',
		description:
			'Design and engineering pair in fast feedback loops. Components, flows, and QA ship in preview environments with automated testing.',
	},
	{
		title: 'Iterate',
		description:
			'We use analytics, heatmaps, and interviews to validate outcomes. Experiments, optimizations, and content updates go live continuously.',
	},
	{
		title: 'Launch',
		description:
			'Cutover support, performance monitoring, and enablement. We train teams, document playbooks, and track KPIs post-launch.',
	},
];

const ProcessTimeline = () => {
	const containerRef = useRef(null);
	const lineRef = useRef(null);

	useEffect(() => {
		if (!gsap.core.globals().ScrollTrigger) {
			gsap.registerPlugin(ScrollTrigger);
		}
	}, []);

	useEffect(() => {
		const reducedMotion = document.documentElement.dataset.reducedMotion === 'true';
		if (reducedMotion || !containerRef.current) return undefined;

		const ctx = gsap.context(() => {
			if (lineRef.current) {
				gsap.fromTo(
					lineRef.current,
					{ height: '0%' },
					{
						height: '100%',
						scrollTrigger: {
							trigger: containerRef.current,
							start: 'top 75%',
							end: 'bottom 60%',
							scrub: true,
						},
						ease: 'linear',
					},
				);
			}

			const items = gsap.utils.toArray('[data-step]');
			items.forEach((item) => {
				gsap.fromTo(
					item,
					{ opacity: 0, y: 40 },
					{
						opacity: 1,
						y: 0,
						duration: 0.6,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: item,
							start: 'top 80%',
						},
					},
				);
			});
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<section className="bg-brand-gray/80 py-24" id="process">
			<div className="container">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Process</p>
					<h2 className="mt-4 text-3xl font-semibold text-brand-dark sm:text-4xl">
						Clarity from discovery call to production launch.
					</h2>
					<p className="mt-4 text-sm text-brand-dark/70">
						Sprints, rituals, and transparent communication keep progress visible. The timeline below animates as you scroll to map our end-to-end partnership.
					</p>
				</div>
				<div ref={containerRef} className="relative mt-16 grid gap-12 md:grid-cols-[auto_1fr]">
					<div className="relative mx-auto hidden w-px md:block">
						<div className="absolute inset-0 rounded-full bg-brand-dark/10"></div>
						<div ref={lineRef} className="absolute inset-x-0 top-0 origin-top rounded-full bg-brand-cyan"></div>
					</div>
					<ol className="space-y-12">
						{steps.map((step, index) => (
							<li
								key={step.title}
								data-step
								className="relative rounded-3xl border border-brand-dark/10 bg-white/90 p-8 shadow-soft"
							>
								<div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
									<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-brand-dark/50">
										<span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-dark">
											{String(index + 1).padStart(2, '0')}
										</span>
										<span>{step.title}</span>
									</div>
									<p className="text-sm text-brand-dark/70 md:flex-1">{step.description}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
};

export default ProcessTimeline;
