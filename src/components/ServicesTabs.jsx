import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const tabs = [
	{
		id: 'landing-pages',
		label: 'Landing Pages',
		eyebrow: 'Launch offers faster',
		description:
			'Positioning, copy, and modular sections built for experimentation. We validate narratives, wireframe high-converting layouts, and launch in less than two weeks.',
		bullets: ['Audience-specific messaging', 'A/B testing hooks + hero', 'Lifecycle & analytics instrumentation'],
		mock: new URL('../assets/mock1.jpg', import.meta.url).href,
	},
	{
		id: 'web-apps',
		label: 'Web Apps / Management Systems',
		eyebrow: 'Ship product features',
		description:
			'From customer portals to internal dashboards, we architect scalable systems with typed APIs, modular UI kits, and automated deployments.',
		bullets: ['Design systems & component libraries', 'Role-based access + audit trails', 'End-to-end & performance testing'],
		mock: new URL('../assets/mock3.jpg', import.meta.url).href,
	},
	{
		id: 'maintenance',
		label: 'Maintenance & Growth',
		eyebrow: 'Continuous improvements',
		description:
			'Partner retainers pair analytics, CRO, and engineering to keep your roadmap moving. We deliver ongoing experiments, optimizations, and automation.',
		bullets: ['Prioritized roadmap with sprints', 'Analytics reviews & CRO experiments', 'Operations tooling & process automation'],
		mock: new URL('../assets/mock4.jpg', import.meta.url).href,
	},
];

const ServicesTabs = () => {
	const [activeId, setActiveId] = useState(tabs[0].id);
	const cardRef = useRef(null);
	const mediaRef = useRef(null);
	const sectionRef = useRef(null);

	const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeId) ?? tabs[0], [activeId]);

	useEffect(() => {
		if (!gsap.core.globals().ScrollTrigger) {
			gsap.registerPlugin(ScrollTrigger);
		}
	}, []);

	useEffect(() => {
		const reducedMotion = document.documentElement.dataset.reducedMotion === 'true';
		if (reducedMotion) return undefined;

		const ctx = gsap.context(() => {
			if (cardRef.current) {
				gsap.fromTo(
					cardRef.current.querySelectorAll('[data-tab-stagger]'),
					{ opacity: 0, y: 32 },
					{
						opacity: 1,
						y: 0,
						stagger: 0.08,
						duration: 0.6,
						ease: 'power2.out',
					},
				);
			}
			if (mediaRef.current) {
				gsap.fromTo(
					mediaRef.current,
					{ opacity: 0, xPercent: 8, rotate: 1 },
					{ opacity: 1, xPercent: 0, rotate: 0, duration: 0.75, ease: 'power3.out' },
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, [activeTab]);

	useEffect(() => {
		const reducedMotion = document.documentElement.dataset.reducedMotion === 'true';
		if (reducedMotion || !sectionRef.current) return undefined;

		const timeline = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef.current,
				start: 'top 80%',
				once: true,
			},
		});

		timeline.from(sectionRef.current.querySelectorAll('[data-section-title]'), {
			y: 40,
			opacity: 0,
			stagger: 0.1,
			duration: 0.6,
			ease: 'power3.out',
		});

		return () => timeline.kill();
	}, []);

	return (
		<section ref={sectionRef} className="bg-brand-gray/50 py-24" id="service-tabs">
			<div className="container grid gap-10 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.85fr)] lg:items-start">
				<div className="space-y-6">
					<p data-section-title className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">
						Service Models
					</p>
					<h2 data-section-title className="max-w-xl text-3xl font-semibold text-brand-dark sm:text-4xl">
						Pick the engagement that fits your roadmap today—and grows with your product tomorrow.
					</h2>
					<p data-section-title className="text-base text-brand-dark/70">
						Tabs animate between the most common Codario Labs service tracks. Each includes discovery, build, and optimization rituals led by product, design, and engineering specialists.
					</p>
					<div role="tablist" aria-label="Codario services" className="space-y-3">
						{tabs.map((tab) => {
							const selected = tab.id === activeId;
							return (
								<button
									key={tab.id}
									type="button"
									role="tab"
									aria-selected={selected}
									aria-controls={`${tab.id}-panel`}
									id={`${tab.id}-tab`}
									onClick={() => setActiveId(tab.id)}
									className={`flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40 ${
										selected
											? 'border-brand-dark bg-white text-brand-dark shadow-soft'
											: 'border-transparent bg-white/40 text-brand-dark/60 hover:text-brand-dark'
									}`}
								>
									<div>
										<p className="font-display text-lg font-semibold">{tab.label}</p>
										<p className="text-xs uppercase tracking-[0.3em] text-brand-dark/50">{tab.eyebrow}</p>
									</div>
									<span
										className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
											selected ? 'bg-brand-dark text-white' : 'bg-brand-dark/5 text-brand-dark/40'
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
				<article
					ref={cardRef}
					className="card relative overflow-hidden border border-brand-dark/10 bg-white p-8 shadow-card"
					id={`${activeTab.id}-panel`}
					role="tabpanel"
					aria-labelledby={`${activeTab.id}-tab`}
				>
					<div className="grid gap-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-center">
						<div className="space-y-4">
							<p data-tab-stagger className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/50">
								{activeTab.eyebrow}
							</p>
							<h3 data-tab-stagger className="text-2xl font-semibold text-brand-dark">
								{activeTab.label}
							</h3>
							<p data-tab-stagger className="text-sm leading-relaxed text-brand-dark/70">
								{activeTab.description}
							</p>
							<ul data-tab-stagger className="space-y-3 text-sm text-brand-dark/80">
								{activeTab.bullets.map((bullet) => (
									<li key={bullet} className="flex items-start gap-3">
										<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-lime"></span>
										<span>{bullet}</span>
									</li>
								))}
							</ul>
						</div>
						<div
							ref={mediaRef}
							className="relative overflow-hidden rounded-3xl border border-brand-dark/10 bg-brand-gray/80 p-4 shadow-inner"
						>
							<img
								src={activeTab.mock}
								alt={`${activeTab.label} showcase`}
								className="h-full w-full rounded-2xl object-cover"
								loading="lazy"
							/>
							<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-cyan/10 to-brand-lime/0"></div>
						</div>
					</div>
				</article>
			</div>
		</section>
	);
};

export default ServicesTabs;
