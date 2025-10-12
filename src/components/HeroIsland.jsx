import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginsRegistered = false;

const registerGsapPlugins = () => {
	if (pluginsRegistered) return;
	if (typeof window === 'undefined') return;
	gsap.registerPlugin(ScrollTrigger);
	pluginsRegistered = true;
};

const HeroIsland = () => {
	const containerRef = useRef(null);
	const blobRefs = useRef([]);
	const motionQuery = useMemo(
		() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null),
		[],
	);

	useEffect(() => {
		registerGsapPlugins();

		const element = containerRef.current;
		if (!element || typeof window === 'undefined') return undefined;

		const prefersReducedMotion = motionQuery?.matches ?? false;
		const staggerTargets = element.querySelectorAll('[data-hero-stagger]');
		const ctaTarget = element.querySelector('[data-hero-cta]');

		let timeline;
		const blobAnimations = [];

		if (!prefersReducedMotion && gsap) {
			gsap.set(staggerTargets, { autoAlpha: 0, y: 36 });
			if (ctaTarget) gsap.set(ctaTarget, { autoAlpha: 0, y: 28 });

			timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
			timeline.to(staggerTargets, {
				autoAlpha: 1,
				y: 0,
				stagger: 0.12,
				duration: 0.9,
			});
			if (ctaTarget) {
				timeline.to(
					ctaTarget,
					{
						autoAlpha: 1,
						y: 0,
						duration: 0.8,
					},
					'-=0.4',
				);
			}

			const blobs = blobRefs.current.filter(Boolean);
			blobs.forEach((blob, index) => {
				const animation = gsap.to(blob, {
					xPercent: index === 0 ? -6 : 7,
					yPercent: index === 0 ? 8 : -6,
					ease: 'none',
					scrollTrigger: {
						trigger: element,
						start: 'top top',
						end: 'bottom top',
						scrub: true,
					},
				});
				blobAnimations.push(animation);
			});
		} else {
			staggerTargets.forEach((node) => {
				node.style.opacity = '1';
				node.style.transform = 'none';
			});
			if (ctaTarget instanceof HTMLElement) {
				ctaTarget.style.opacity = '1';
				ctaTarget.style.transform = 'none';
			}
		}

		const interactiveButtons = Array.from(element.querySelectorAll('[data-hero-btn]'));
		const cleanupFns = interactiveButtons.map((button) => {
			const onEnter = () => {
				if (prefersReducedMotion) return;
				gsap.to(button, { scale: 1.03, duration: 0.25, ease: 'power3.out' });
			};
			const onLeave = () => {
				if (prefersReducedMotion) return;
				gsap.to(button, { scale: 1, duration: 0.3, ease: 'power3.out' });
			};
			button.addEventListener('mouseenter', onEnter);
			button.addEventListener('mouseleave', onLeave);
			button.addEventListener('focus', onEnter);
			button.addEventListener('blur', onLeave);

			return () => {
				button.removeEventListener('mouseenter', onEnter);
				button.removeEventListener('mouseleave', onLeave);
				button.removeEventListener('focus', onEnter);
				button.removeEventListener('blur', onLeave);
			};
		});

		return () => {
			timeline?.kill();
			blobAnimations.forEach((animation) => animation.kill());
			ScrollTrigger.getAll()
				.filter((trigger) => trigger.trigger === element)
				.forEach((trigger) => trigger.kill());
			cleanupFns.forEach((fn) => fn());
		};
	}, [motionQuery]);

	return (
		<div ref={containerRef} className="container relative z-10 grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,0.65fr)] lg:items-center">
			<div className="relative">
				<span
					data-hero-stagger
					className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-brand-dark/70 backdrop-blur"
				>
					<span className="h-2 w-2 rounded-full bg-brand-lime" />
					Launch and scale faster
				</span>
				<h1
					data-hero-stagger
					className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-tight text-brand-dark sm:text-5xl lg:text-6xl"
				>
					<span className="relative inline-block">
						<span className="absolute inset-[-25%] -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,_rgba(59,175,218,0.18)_0%,_rgba(155,229,100,0.08)_45%,_rgba(10,37,64,0)_90%)] blur-2xl"></span>
						<span className="relative">Build web experiences that launch and scale.</span>
					</span>
				</h1>
				<p data-hero-stagger className="mt-6 max-w-2xl text-lg text-brand-dark/75 sm:text-xl">
					Codario Labs crafts modern web apps, management systems, and high-impact landing pages for startups and
					small businesses. We partner on strategy, build with velocity, and iterate with data.
				</p>
				<div data-hero-cta className="mt-10 flex flex-col gap-4 sm:flex-row">
					<a
						data-hero-btn
						className="btn-primary inline-flex items-center gap-2 bg-brand-dark text-white hover:bg-brand-cyan hover:text-brand-dark focus-visible:bg-brand-cyan focus-visible:text-brand-dark"
						href="#contact"
						aria-label="Get a free audit with Codario Labs"
					>
						Get a Free Audit
					</a>
					<a
						data-hero-btn
						className="btn-secondary inline-flex items-center gap-2"
						href="#work"
						aria-label="See Codario Labs work"
					>
						See Our Work
						<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
							<path d="M5 12h14" strokeLinecap="round" />
							<path d="m12 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</a>
				</div>
				<div className="mt-12 grid gap-6 border-t border-brand-dark/10 pt-8 sm:grid-cols-3 sm:divide-x sm:divide-brand-dark/10">
					<div className="space-y-1">
						<p className="text-3xl font-semibold text-brand-dark">↑ 38%</p>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/60">Avg. conversion lift</p>
					</div>
					<div className="space-y-1 sm:pl-6">
						<p className="text-3xl font-semibold text-brand-dark">Ship in days</p>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/60">Not months</p>
					</div>
					<div className="space-y-1 sm:pl-6">
						<p className="text-3xl font-semibold text-brand-dark">99.9%</p>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/60">Uptime on managed ops</p>
					</div>
				</div>
			</div>

			<div className="relative hidden min-h-[360px] rounded-3xl bg-white/85 p-8 shadow-xl shadow-brand-dark/10 backdrop-blur lg:flex lg:flex-col lg:justify-between">
				<div>
					<h2 className="font-heading text-2xl font-semibold text-brand-dark">What we ship</h2>
					<ul className="mt-6 space-y-4 text-sm text-brand-dark/70">
						<li className="flex items-start gap-3">
							<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-lime" />
							<span>Conversion-first landing pages delivered in 10-14 days.</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-cyan" />
							<span>Operational dashboards, portals, and management systems.</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-dark/80" />
							<span>Growth retainers covering CRO, analytics, and iterative releases.</span>
						</li>
					</ul>
				</div>
				<div className="rounded-2xl border border-brand-dark/10 bg-brand-gray p-5">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/60">Trusted by lean teams</p>
					<p className="mt-3 text-sm text-brand-dark/70">
						"Codario replatformed our product in six weeks with zero downtime and a measurable conversion bump."
					</p>
					<p className="mt-4 text-xs font-medium text-brand-dark/50">— Maya Chen, COO · OrbitOps</p>
				</div>
			</div>

			<div
				ref={(node) => {
					blobRefs.current[0] = node;
				}}
				aria-hidden="true"
				className="pointer-events-none absolute -z-10 -left-24 -top-28 h-[540px] w-[540px] rounded-full bg-brand-cyan/25 blur-3xl mix-blend-screen"
			/>
			<div
				ref={(node) => {
					blobRefs.current[1] = node;
				}}
				aria-hidden="true"
				className="pointer-events-none absolute -z-10 -right-20 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-brand-lime/18 blur-3xl mix-blend-screen"
			/>
		</div>
	);
};

export default HeroIsland;
