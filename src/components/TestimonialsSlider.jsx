import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const defaultItems = [
	{
		name: 'Maya Chen',
		role: 'COO',
		company: 'OrbitOps',
		quote:
			'Codario Labs rebuilt our marketing stack in five weeks. Pipeline lifted 38% and our ops team finally has a system they trust.',
	},
	{
		name: 'Devin Hart',
		role: 'Head of Product',
		company: 'AtlasPay',
		quote:
			'The squad felt like an extension of our own—design, engineering, and analytics running in sync. Every sprint shipped real value.',
	},
	{
		name: 'Sara Koenig',
		role: 'Growth Lead',
		company: 'Launchpad DAO',
		quote:
			'Messaging, UX, implementation—Codario handled it all. Our investor funnel now performs 2.1x better and the playbooks they left behind are stellar.',
	},
	{
		name: 'Jonas Patel',
		role: 'Founder',
		company: 'Nova CRM',
		quote:
			'They delivered a dashboard our customers rave about. Everything is instrumented, accessible, and ready for the next stage of growth.',
	},
	{
		name: 'Amelia Wright',
		role: 'VP Marketing',
		company: 'Brightside Health',
		quote:
			'From discovery to launch we always knew what was shipping. The new portal onboarded 64% more users in the first month.',
	},
];

const SWIPE_THRESHOLD = 48;

const TestimonialsSlider = ({
	items = defaultItems,
	ariaLabel = 'Testimonials',
	autoPlayMs = 5000,
}) => {
	const baseItems = items.length ? items : defaultItems;
	const length = baseItems.length;
	const extendedItems = useMemo(() => [...baseItems, ...baseItems, ...baseItems], [baseItems]);
	const midpoint = length;

	const [activeIndex, setActiveIndex] = useState(midpoint);
	const [translateX, setTranslateX] = useState(0);

	const containerRef = useRef(null);
	const trackRef = useRef(null);
	const slideRefs = useRef([]);
	const headingRefs = useRef([]);
	const autoplayRef = useRef(null);
	const pointerStartX = useRef(null);
	const pointerActive = useRef(false);
	const shouldFocusHeading = useRef(false);
	const reducedMotionRef = useRef(false);

	const logicalIndex = ((activeIndex - midpoint) % length + length) % length;

	const isReducedMotion = useMemo(() => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}, []);

	useEffect(() => {
		reducedMotionRef.current = isReducedMotion;
	}, [isReducedMotion]);

	const maintainLoopBounds = useCallback(
		(index) => {
			if (index >= midpoint + length) {
				return index - length;
			}
			if (index < midpoint) {
				return index + length;
			}
			return index;
		},
		[length, midpoint],
	);

	const calculateTranslate = useCallback(() => {
		const container = containerRef.current;
		const track = trackRef.current;
		const slide = slideRefs.current[activeIndex];
		if (!container || !track || !slide) return;

		const gap = parseFloat(getComputedStyle(track).gap || '0');
		const slideWidth = slide.offsetWidth;
		const containerWidth = container.offsetWidth;
		const slideLeft = slide.offsetLeft;

		const slideCenter = slideLeft + slideWidth / 2;
		const targetOffset = slideCenter - containerWidth / 2;
		setTranslateX(-targetOffset);
	}, [activeIndex]);

	useEffect(() => {
		const handleResize = () => {
			window.requestAnimationFrame(calculateTranslate);
		};

		handleResize();

		const observer = new ResizeObserver(handleResize);
		if (containerRef.current) observer.observe(containerRef.current);
		if (trackRef.current) observer.observe(trackRef.current);

		window.addEventListener('resize', handleResize);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', handleResize);
		};
	}, [calculateTranslate]);

	useEffect(() => {
		window.requestAnimationFrame(calculateTranslate);
	}, [activeIndex, calculateTranslate]);

	useEffect(() => {
		if (shouldFocusHeading.current) {
			const currentHeading = headingRefs.current[activeIndex];
			if (currentHeading) {
				currentHeading.focus({ preventScroll: true });
			}
			shouldFocusHeading.current = false;
		}
	}, [activeIndex]);

	const stopAutoplay = useCallback(() => {
		if (autoplayRef.current) {
			clearInterval(autoplayRef.current);
			autoplayRef.current = null;
		}
	}, []);

	const startAutoplay = useCallback(() => {
		if (reducedMotionRef.current || autoPlayMs <= 0) return;
		stopAutoplay();
		autoplayRef.current = setInterval(() => {
			setActiveIndex((prev) => maintainLoopBounds(prev + 1));
		}, autoPlayMs);
	}, [autoPlayMs, maintainLoopBounds, stopAutoplay]);

	useEffect(() => {
		startAutoplay();
		const handleVisibility = () => {
			if (document.hidden) {
				stopAutoplay();
			} else {
				startAutoplay();
			}
		};
		document.addEventListener('visibilitychange', handleVisibility);
		return () => {
			stopAutoplay();
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	}, [startAutoplay, stopAutoplay]);

	const goTo = useCallback(
		(targetIndex, { focusHeading = false } = {}) => {
			shouldFocusHeading.current = focusHeading;
			setActiveIndex((prev) => {
				const next = maintainLoopBounds(typeof targetIndex === 'function' ? targetIndex(prev) : targetIndex);
				return next;
			});
		},
		[maintainLoopBounds],
	);

	const handlePrevious = () => {
		stopAutoplay();
		goTo(activeIndex - 1, { focusHeading: true });
		startAutoplay();
	};

	const handleNext = () => {
		stopAutoplay();
		goTo(activeIndex + 1, { focusHeading: true });
		startAutoplay();
	};

	const handleKeyDown = (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			handlePrevious();
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			handleNext();
		}
	};

	const handlePointerDown = (event) => {
		if (event.pointerType === 'mouse') return;
		pointerStartX.current = event.clientX;
		pointerActive.current = true;
		stopAutoplay();
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const handlePointerMove = (event) => {
		if (!pointerActive.current || pointerStartX.current === null) return;
		const delta = event.clientX - pointerStartX.current;
		if (Math.abs(delta) >= SWIPE_THRESHOLD) {
			goTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
			pointerStartX.current = event.clientX;
		}
	};

	const handlePointerUp = (event) => {
		pointerActive.current = false;
		pointerStartX.current = null;
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		startAutoplay();
	};

	const getSlideState = (index) => {
		if (index === activeIndex) return 'active';
		if (index === activeIndex - 1 || index === activeIndex + 1) return 'adjacent';
		return 'inactive';
	};

	return (
		<section className="bg-white py-24" id="testimonials">
			<div
				className="container"
				role="region"
				aria-roledescription="carousel"
				aria-label={ariaLabel}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				onFocus={stopAutoplay}
				onBlur={startAutoplay}
			>
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Testimonials</p>
					<h2 className="mt-4 text-3xl font-semibold text-brand-dark sm:text-4xl">
						Signals from founders and operators shipping with Codario Labs.
					</h2>
				</div>
				<div
					ref={containerRef}
					className="relative mx-auto mt-12 max-w-5xl overflow-hidden px-4 sm:px-6 lg:px-12"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					onMouseEnter={stopAutoplay}
					onMouseLeave={startAutoplay}
				>
					<div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" aria-hidden="true" />
					<div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" aria-hidden="true" />
					<div
						ref={trackRef}
						className="flex items-stretch gap-6 sm:gap-8 transition-transform duration-700 ease-brand will-change-transform"
						style={{ transform: `translateX(${translateX}px)` }}
						aria-live="polite"
					>
						{extendedItems.map((testimonial, idx) => {
							const state = getSlideState(idx);
							const isActive = state === 'active';
							return (
								<article
									key={`${testimonial.name}-${idx}`}
									ref={(node) => {
										slideRefs.current[idx] = node || null;
									}}
									className={`relative flex-none rounded-2xl border border-brand-dark/10 bg-white p-8 shadow-[0_18px_40px_rgba(10,37,64,0.15)] transition-all duration-700 ease-brand w-[85%] sm:w-[70%] lg:w-[42%] ${
										isActive ? 'opacity-100 blur-0 scale-100' : state === 'adjacent' ? 'opacity-60 blur-[1.5px] saturate-75' : 'opacity-0'
									}`}
									style={{ pointerEvents: isActive ? 'auto' : 'none' }}
									role="group"
									aria-label={`Testimonial ${((idx - midpoint) % length + length) % length + 1} of ${length}`}
								>
									<header className="flex items-center gap-4">
										<span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-cyan text-lg font-semibold text-white shadow-sm shadow-brand-dark/20">
											{testimonial.avatar ?? testimonial.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
										</span>
										<div className="leading-tight">
											<h3
												ref={(node) => {
													headingRefs.current[idx] = node || null;
												}}
												className="font-display text-lg font-semibold text-brand-dark outline-none"
												tabIndex={isActive ? 0 : -1}
											>
												{testimonial.name}
											</h3>
											<p className="text-sm text-brand-dark/60">
												{testimonial.role}, {testimonial.company}
											</p>
										</div>
									</header>
									<p className="mt-6 text-base leading-7 text-brand-dark/80">{testimonial.quote}</p>
								</article>
							);
						})}
					</div>

					<div className="mt-8 flex items-center justify-between">
						<button
							type="button"
							onClick={handlePrevious}
							className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-cyan/50 bg-white text-brand-cyan transition hover:bg-brand-cyan hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40"
							aria-label="Previous testimonial"
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
								<path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
						<div className="flex items-center gap-2">
							{baseItems.map((testimonial, idx) => (
								<button
									key={testimonial.name}
									type="button"
									onClick={() => {
										stopAutoplay();
										goTo(midpoint + idx);
										startAutoplay();
									}}
									className={`h-2.5 w-8 rounded-full transition ${
										idx === logicalIndex ? 'bg-brand-cyan' : 'bg-brand-cyan/30'
									}`}
									aria-label={`Go to testimonial from ${testimonial.name}`}
									onFocus={stopAutoplay}
									onBlur={startAutoplay}
								/>
							))}
						</div>
						<button
							type="button"
							onClick={handleNext}
							className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-cyan/50 bg-white text-brand-cyan transition hover:bg-brand-cyan hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40"
							aria-label="Next testimonial"
							onFocus={stopAutoplay}
							onBlur={startAutoplay}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
								<path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>
					<div className="sr-only" aria-live="polite">
						Showing testimonial {logicalIndex + 1} of {length}.
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSlider;
