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
	const [mobileIndex, setMobileIndex] = useState(0);
	const [animDirection, setAnimDirection] = useState(1);
	const panelsRef = useRef(null);
	const buttonsRef = useRef({});
	const previousId = useRef(activeId);
	const autoplayRef = useRef(null);
	const mediaQueryRef = useRef(null);
	const startAutoplayRef = useRef(() => {});
	const stopAutoplayRef = useRef(() => {});
	const mobileIndexRef = useRef(mobileIndex);
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
		if (previousId.current === activeId) return;

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
				0,
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

	useEffect(() => {
		const idx = tabs.findIndex((tab) => tab.id === activeId);
		if (idx !== -1) {
			setMobileIndex(idx);
		}
	}, [activeId]);

	useEffect(() => {
		mobileIndexRef.current = mobileIndex;
	}, [mobileIndex]);

	useEffect(() => {
		if (typeof window === 'undefined') return undefined;

		const media = window.matchMedia('(min-width: 1024px)');
		mediaQueryRef.current = media;
		const stop = () => {
			if (autoplayRef.current) {
				clearInterval(autoplayRef.current);
				autoplayRef.current = null;
			}
		};

		const start = () => {
			if (prefersReducedMotion?.matches) return;
			if (media.matches) {
				stop();
				return;
			}
			stop();
			autoplayRef.current = window.setInterval(() => {
				setAnimDirection(1);
				setMobileIndex((prev) => {
					const next = (prev + 1) % tabs.length;
					setActiveId(tabs[next].id);
					return next;
				});
			}, 9000);
		};

		startAutoplayRef.current = start;
		stopAutoplayRef.current = stop;

		const handleVisibility = () => {
			if (document.hidden) {
				stop();
			} else {
				start();
			}
		};

		const handleMediaChange = () => {
			stop();
			start();
		};

		start();

		document.addEventListener('visibilitychange', handleVisibility);
		if (typeof media.addEventListener === 'function') {
			media.addEventListener('change', handleMediaChange);
		} else if (typeof media.addListener === 'function') {
			media.addListener(handleMediaChange);
		}

		return () => {
			stop();
			document.removeEventListener('visibilitychange', handleVisibility);
			if (typeof media.removeEventListener === 'function') {
				media.removeEventListener('change', handleMediaChange);
			} else if (typeof media.removeListener === 'function') {
				media.removeListener(handleMediaChange);
			}
		};
	}, [prefersReducedMotion]);

	useEffect(() => {
		const stop = stopAutoplayRef.current;
		return () => {
			stop?.();
		};
	}, []);

	const handleTabClick = (id) => {
		if (id === activeId) return;
		const targetIdx = tabs.findIndex((tab) => tab.id === id);
		if (targetIdx !== -1) {
			const current = mobileIndexRef.current;
			const diff = targetIdx - current;
			if (diff !== 0) {
				setAnimDirection(diff > 0 ? 1 : -1);
			}
		}
		setActiveId(id);
	};

	const handleMobileChange = (direction) => {
		const stop = stopAutoplayRef.current;
		const start = startAutoplayRef.current;

		stop?.();

		setMobileIndex((prev) => {
			const next = Math.min(Math.max(prev + direction, 0), tabs.length - 1);
			if (next !== prev) {
				setAnimDirection(direction > 0 ? 1 : -1);
				setActiveId(tabs[next].id);
			}
			return next;
		});

		start?.();
	};

	const isAtStart = mobileIndex <= 0;
	const isAtEnd = mobileIndex >= tabs.length - 1;
	const animationClass =
		animDirection >= 0
			? 'animate-[services-carousel-next_560ms_cubic-bezier(0.22,1,0.36,1)]'
			: 'animate-[services-carousel-prev_560ms_cubic-bezier(0.22,1,0.36,1)]';

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
		<>
			<section id="services" className="bg-white py-24 sm:py-28">
				<div className="container space-y-12 lg:grid lg:gap-12 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.77fr)] lg:items-start">
					<div className="space-y-6">
						<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Service Models</p>
						<h2 className="section-title text-left">
							Pick the engagement that fits your roadmap today-and scales with your product tomorrow.
					</h2>
					<p className="text-base text-brand-dark/70">
						Choose from fast-moving launches, full product builds, or ongoing retainers. Each track pairs strategy with
						design and engineering rituals that keep releases shipping.
					</p>
				</div>

				<div className="lg:hidden">
					<div className="relative">
						<article
							key={mobileIndex}
							className={`relative rounded-3xl border border-brand-dark/10 bg-white/95 p-7 pt-16 shadow-xl shadow-brand-dark/10 ${animationClass}`}
							data-mobile-panel
							role="group"
							aria-label={`${tabs[mobileIndex].label} service`}
							onMouseEnter={() => stopAutoplayRef.current?.()}
							onMouseLeave={() => startAutoplayRef.current?.()}
							onFocus={() => stopAutoplayRef.current?.()}
							onBlur={() => startAutoplayRef.current?.()}
						>
							<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
								<button
									type="button"
									onClick={() => handleMobileChange(-1)}
									disabled={isAtStart}
									aria-label="Previous service"
									className={`pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark shadow-md shadow-brand-dark/10 transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40 ${
										isAtStart ? 'pointer-events-none opacity-40' : ''
									}`}
									onFocus={() => stopAutoplayRef.current?.()}
									onBlur={() => startAutoplayRef.current?.()}
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
										<path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
								<button
									type="button"
									onClick={() => handleMobileChange(1)}
									disabled={isAtEnd}
									aria-label="Next service"
									className={`pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark shadow-md shadow-brand-dark/10 transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40 ${
										isAtEnd ? 'pointer-events-none opacity-40' : ''
									}`}
									onFocus={() => stopAutoplayRef.current?.()}
									onBlur={() => startAutoplayRef.current?.()}
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
										<path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
							</div>
							<div className="space-y-4">
								<p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-dark/55">
									{tabs[mobileIndex].tagline}
								</p>
								<h3 className="text-2xl font-semibold text-brand-dark">{tabs[mobileIndex].label}</h3>
								<p className="text-sm leading-relaxed text-brand-dark/75">{tabs[mobileIndex].description}</p>
								<ul className="space-y-3 text-sm text-brand-dark/80">
									{tabs[mobileIndex].bullets.map((bullet) => (
										<li key={bullet} className="flex items-start gap-3">
											<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-lime" />
											<span>{bullet}</span>
										</li>
									))}
								</ul>
								<a
									className="btn-primary inline-flex w-fit items-center gap-2 bg-brand-dark text-white hover:bg-brand-cyan hover:text-brand-dark focus-visible:bg-brand-cyan focus-visible:text-brand-dark"
									href="#contact"
								>
									Get a Proposal
								</a>
							</div>
							<div className="relative mt-6 overflow-hidden rounded-3xl border border-brand-dark/10 bg-brand-gray/80 p-4">
								<div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-cyan/10 to-brand-lime/0" />
							</div>
						</article>
					</div>
				</div>

				<div ref={panelsRef} className="relative hidden min-h-[400px] lg:block">
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
										className="btn-primary inline-flex w-fit items-center gap-2 bg-brand-dark text-white hover:bg-brand-cyan hover:text-brand-dark focus-visible:bg-brand-cyan focus-visible:text-brand-dark"
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
			<style>
				{`
					@keyframes services-carousel-next {
						0% {
							opacity: 0;
							transform: translate3d(48px, 14px, 0) scale(0.92) rotate(1deg);
							filter: blur(12px);
						}
						55% {
							opacity: 1;
							transform: translate3d(-6px, -2px, 0) scale(1.03) rotate(-0.35deg);
							filter: blur(0);
						}
						100% {
							opacity: 1;
							transform: translate3d(0, 0, 0) scale(1) rotate(0);
							filter: blur(0);
						}
					}

					@keyframes services-carousel-prev {
						0% {
							opacity: 0;
							transform: translate3d(-48px, 14px, 0) scale(0.92) rotate(-1deg);
							filter: blur(12px);
						}
						55% {
							opacity: 1;
							transform: translate3d(6px, -2px, 0) scale(1.03) rotate(0.35deg);
							filter: blur(0);
						}
						100% {
							opacity: 1;
							transform: translate3d(0, 0, 0) scale(1) rotate(0);
							filter: blur(0);
						}
					}
				`}
			</style>
		</>
	);
};

export default ServicesTabs;
