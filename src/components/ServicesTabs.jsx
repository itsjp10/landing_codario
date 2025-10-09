import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

const tabs = [
	{
		id: 'landing-pages',
		label: 'Landing Pages',
		tagline: 'Launch offers faster',
		description:
			'Positioning, copy, and modular sections built for experimentation. We validate narratives, wireframe conversion-first layouts, and launch in less than two weeks.',
		bullets: ['Audience-specific messaging', 'A/B-ready hero & CTA frameworks', 'Lifecycle analytics & automations'],
		mock: new URL('../assets/mock1.jpg', import.meta.url).href,
	},
	{
		id: 'web-apps',
		label: 'Web Apps & Management Systems',
		tagline: 'Ship product features',
		description:
			'From customer portals to internal dashboards, we architect scalable systems with typed APIs, component libraries, and automated deployments.',
		bullets: ['Design systems & reusable UI kits', 'Role-based access and audit trails', 'End-to-end & performance testing'],
		mock: new URL('../assets/mock3.jpg', import.meta.url).href,
	},
	{
		id: 'growth',
		label: 'Maintenance & Growth',
		tagline: 'Continuous improvements',
		description:
			'Partner retainers blend analytics, CRO, and engineering to keep your roadmap moving. Expect weekly iterations, experiments, and automation.',
		bullets: ['Prioritized roadmap & sprints', 'Analytics reviews & CRO experiments', 'Operations tooling & workflow automation'],
		mock: new URL('../assets/mock4.jpg', import.meta.url).href,
	},
];

const ServicesTabs = () => {
	const [activeId, setActiveId] = useState(tabs[0].id);
	const panelsRef = useRef(null);
	const buttonsRef = useRef({});
	const previousId = useRef(activeId);
	const prefersReducedMotion = useMemo(
		() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null),
		[],
	);

	const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeId) ?? tabs[0], [activeId]);

	useEffect(() => {
		if (!prefersReducedMotion) return undefined;

		const handler = (event) => {
			if (event.matches) {
				gsap.globalTimeline.timeScale(0);
			} else {
				gsap.globalTimeline.timeScale(1);
			}
		};

		if (typeof prefersReducedMotion.addEventListener === 'function') {
			prefersReducedMotion.addEventListener('change', handler);
		} else if (typeof prefersReducedMotion.addListener === 'function') {
			prefersReducedMotion.addListener(handler);
		}

		return () => {
			if (typeof prefersReducedMotion.removeEventListener === 'function') {
				prefersReducedMotion.removeEventListener('change', handler);
			} else if (typeof prefersReducedMotion.removeListener === 'function') {
				prefersReducedMotion.removeListener(handler);
			}
		};
	}, [prefersReducedMotion]);

	useEffect(() => {
		if (!panelsRef.current) return;
		if (prefersReducedMotion?.matches) return;

	const previousPanel = panelsRef.current.querySelector(`[data-panel="${previousId.current}"]`);
	const currentPanel = panelsRef.current.querySelector(`[data-panel="${activeId}"]`);

	if (!previousPanel || !currentPanel) return;

	const timeline = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.45 } });

	timeline
		.to(previousPanel, { autoAlpha: 0 }, 0)
		.set(previousPanel, { display: 'none' })
		.fromTo(
			currentPanel,
			{ autoAlpha: 0, display: 'grid' },
			{ autoAlpha: 1 },
			0
		)
		.fromTo(
			currentPanel.querySelectorAll('[data-panel-stagger]'),
			{ autoAlpha: 0, y: 16 },
			{ autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 },
			0.05,
		);

	return () => timeline.kill();
	}, [activeId, prefersReducedMotion]);

	useEffect(() => {
		previousId.current = activeId;
	}, [activeId]);

	const handleTabClick = (id) => {
		if (id === activeId) return;
		setActiveId(id);
	};

	const handleKeyDown = (event, index) => {
		const { key } = event;
		const lastIndex = tabs.length - 1;

		if (key === 'ArrowRight' || key === 'ArrowDown') {
			event.preventDefault();
			const nextIndex = index === lastIndex ? 0 : index + 1;
			const nextTab = tabs[nextIndex];
			buttonsRef.current[nextTab.id]?.focus();
			setActiveId(nextTab.id);
		}
		if (key === 'ArrowLeft' || key === 'ArrowUp') {
			event.preventDefault();
			const prevIndex = index === 0 ? lastIndex : index - 1;
			const prevTab = tabs[prevIndex];
			buttonsRef.current[prevTab.id]?.focus();
			setActiveId(prevTab.id);
		}
		if (key === 'Home') {
			event.preventDefault();
			buttonsRef.current[tabs[0].id]?.focus();
			setActiveId(tabs[0].id);
		}
		if (key === 'End') {
			event.preventDefault();
			buttonsRef.current[tabs[lastIndex].id]?.focus();
			setActiveId(tabs[lastIndex].id);
		}
	};

	return (
		<section id="services" className="bg-white py-24 sm:py-28">
			<div className="container grid gap-12 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.77fr)] lg:items-start">
				<div className="space-y-6">
					<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Service Models</p>
					<h2 className="section-title text-left">
						Pick the engagement that fits your roadmap today—and scales with your product tomorrow.
					</h2>
					<p className="text-base text-brand-dark/70">
						Choose from fast-moving launches, full product builds, or ongoing retainers. Each track pairs strategy with
						design and engineering rituals that keep releases shipping.
					</p>
				</div>

				<div ref={panelsRef} className="relative min-h-[400px]">
					{tabs.map((tab) => {
						const selected = tab.id === activeId;
						return (
							<article
								key={tab.id}
								data-panel={tab.id}
								id={`${tab.id}-panel`}
								role="tabpanel"
								aria-labelledby={`${tab.id}-tab`}
								tabIndex={selected ? 0 : -1}
								className={`panel-card absolute inset-0 grid gap-8 rounded-3xl border border-brand-dark/10 bg-white/95 p-8 shadow-xl shadow-brand-dark/10 transition ${
									selected ? 'z-[1]' : 'z-0'
								}`}
								style={{ display: selected ? 'grid' : 'none' }}
							>
								<div className="space-y-4">
									<p data-panel-stagger className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-dark/55">
										{tab.tagline}
									</p>
									<h3 data-panel-stagger className="text-2xl font-semibold text-brand-dark">
										{tab.label}
									</h3>
									<p data-panel-stagger className="text-sm leading-relaxed text-brand-dark/75">{tab.description}</p>
									<ul data-panel-stagger className="space-y-3 text-sm text-brand-dark/80">
										{tab.bullets.map((bullet) => (
											<li key={bullet} className="flex items-start gap-3">
												<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-lime" />
												<span>{bullet}</span>
											</li>
										))}
									</ul>
									<a
										data-panel-stagger
										className="btn-primary inline-flex w-fit items-center gap-2 bg-brand-dark text-white hover:bg-brand-cyan focus-visible:bg-brand-cyan"
										href="#contact"
									>
										Get a Proposal
									</a>
								</div>

								<div className="relative overflow-hidden rounded-3xl border border-brand-dark/10 bg-brand-gray/80 p-4">
									<img
										data-panel-stagger
										src={tab.mock}
										alt={`${tab.label} showcase`}
										className="h-full w-full rounded-2xl object-cover"
										loading="lazy"
									/>
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-cyan/10 to-brand-lime/0" />
								</div>
							</article>
						);
					})}
				</div>

				<div
					role="tablist"
					aria-label="Codario Labs services"
					aria-orientation="horizontal"
					className="flex flex-wrap gap-4 lg:col-span-2"
				>
					{tabs.map((tab, index) => {
						const selected = tab.id === activeId;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								id={`${tab.id}-tab`}
								aria-selected={selected}
								aria-controls={`${tab.id}-panel`}
								onClick={() => handleTabClick(tab.id)}
								onKeyDown={(event) => handleKeyDown(event, index)}
								ref={(node) => {
									if (node) {
										buttonsRef.current[tab.id] = node;
									}
								}}
								className={`flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40 sm:flex-1 sm:min-w-[240px] sm:w-auto ${
									selected
										? 'border-brand-dark bg-white text-brand-dark shadow-lg shadow-brand-dark/10'
										: 'border-transparent bg-white/50 text-brand-dark/60 hover:text-brand-dark'
								}`}
							>
								<div>
									<p className="font-heading text-lg font-semibold">{tab.label}</p>
									<p className="text-xs uppercase tracking-[0.3em] text-brand-dark/50">{tab.tagline}</p>
								</div>
								<span
									className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
										selected ? 'bg-brand-dark text-white' : 'bg-brand-dark/8 text-brand-dark/50'
									}`}
									aria-hidden="true"
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
										<path d="M5 12h14" strokeLinecap="round" />
										<path d="m12 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default ServicesTabs;
