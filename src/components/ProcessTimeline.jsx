import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const defaultSteps = [
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

const ProcessTimeline = ({ steps = defaultSteps }) => {
	const containerRef = useRef(null);
	const lineRef = useRef(null);
	const itemsRef = useRef([]);

	const reducedMotionQuery = useMemo(
		() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null),
		[],
	);

	useEffect(() => {
		if (!gsap.core.globals().ScrollTrigger) {
			gsap.registerPlugin(ScrollTrigger);
		}
	}, []);

	useEffect(() => {
		if (!containerRef.current || reducedMotionQuery?.matches) {
			if (lineRef.current) {
				lineRef.current.style.transform = 'scaleY(1)';
			}
			return undefined;
		}

		const ctx = gsap.context(() => {
			if (lineRef.current) {
				gsap.fromTo(
					lineRef.current,
					{ scaleY: 0 },
					{
						scaleY: 1,
						transformOrigin: 'top center',
						ease: 'none',
						scrollTrigger: {
							trigger: containerRef.current,
							start: 'top 75%',
							end: 'bottom 40%',
							scrub: true,
						},
					},
				);
			}

			itemsRef.current.forEach((node) => {
				if (!node) return;
				gsap.fromTo(
					node,
					{ autoAlpha: 0, y: 48 },
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.6,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: node,
							start: 'top 80%',
						},
					},
				);
			});
		}, containerRef);

		return () => ctx.revert();
	}, [steps, reducedMotionQuery]);

	useEffect(() => {
		if (!reducedMotionQuery) return undefined;
		const handler = (event) => {
			if (!containerRef.current) return;
			if (event.matches) {
				ScrollTrigger.getAll()
					.filter((trigger) => containerRef.current.contains(trigger.trigger))
					.forEach((trigger) => trigger.kill());
				if (lineRef.current) {
					lineRef.current.style.transform = 'scaleY(1)';
				}
				itemsRef.current.forEach((node) => {
					if (node) {
						node.style.opacity = '1';
						node.style.transform = 'translateY(0)';
					}
				});
			}
		};

		if (reducedMotionQuery.addEventListener) {
			reducedMotionQuery.addEventListener('change', handler);
		} else if (reducedMotionQuery.addListener) {
			reducedMotionQuery.addListener(handler);
		}

		return () => {
			if (reducedMotionQuery.removeEventListener) {
				reducedMotionQuery.removeEventListener('change', handler);
			} else if (reducedMotionQuery.removeListener) {
				reducedMotionQuery.removeListener(handler);
			}
		};
	}, [reducedMotionQuery]);

	return (
		<section className="bg-brand-gray/80 py-24" id="process">
			<div className="container">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Process</p>
					<h2 className="mt-4 text-3xl font-semibold text-brand-dark sm:text-4xl">
						Clarity from discovery call to production launch.
					</h2>
					<p className="mt-4 text-sm text-brand-dark/70">
						Sprints, rituals, and transparent communication keep progress visible. Follow each milestone as the timeline
						comes to life while you scroll.
					</p>
				</div>

				<div ref={containerRef} className="relative mt-16 grid gap-12 md:grid-cols-[auto_1fr]">
					<div className="relative mx-auto hidden w-px md:block">
						<div className="absolute inset-0 rounded-full bg-brand-dark/10" aria-hidden="true" />
						<div
							ref={lineRef}
							className="absolute inset-x-0 top-0 h-full rounded-full bg-brand-cyan"
							style={{ transform: 'scaleY(0)', transformOrigin: 'top center' }}
							aria-hidden="true"
						/>
					</div>

					<ol className="space-y-12">
						{steps.map((step, index) => (
							<li
								key={`${step.title}-${index}`}
								ref={(node) => {
									itemsRef.current[index] = node;
								}}
								data-step
								className="relative rounded-3xl border border-brand-dark/10 bg-white/90 p-8 shadow-soft transition will-change-transform"
							>
								<div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
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
