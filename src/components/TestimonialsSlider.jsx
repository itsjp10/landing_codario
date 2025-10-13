import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const defaultItems = [
	{
		name: 'Ava Smith',
		role: 'Founder',
		company: 'Seedly',
		quote: 'They shipped in days, not months. Clean, scalable, and on brand.',
	},
	{
		name: 'Liam Jones',
		role: 'COO',
		company: 'MarketOne',
		quote: 'Our conversion lifted 32%. Clear communication and fast delivery.',
	},
	{
		name: 'Noah Lee',
		role: 'CTO',
		company: 'Nimbus',
		quote: 'Reliable, thoughtful engineering and solid code quality.',
	},
	{
		name: 'Emma Davis',
		role: 'PM',
		company: 'Flowbit',
		quote: 'Smooth process, from scope to launch. Great collaboration.',
	},
	{
		name: 'Olivia Chen',
		role: 'CEO',
		company: 'BrightCart',
		quote: 'The best dev partner we\u2019ve worked with\u2014period.',
	},
];

const SWIPE_THRESHOLD = 48;

const usePrefersReducedMotion = () => {
	const [prefers, setPrefers] = useState(() => {
		if (typeof window === 'undefined' || !('matchMedia' in window)) {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	useEffect(() => {
		if (typeof window === 'undefined' || !('matchMedia' in window)) {
			return undefined;
		}
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const handleChange = () => setPrefers(media.matches);
		if (media.addEventListener) {
			media.addEventListener('change', handleChange);
		} else {
			media.addListener(handleChange);
		}
		return () => {
			if (media.removeEventListener) {
				media.removeEventListener('change', handleChange);
			} else {
				media.removeListener(handleChange);
			}
		};
	}, []);

	return prefers;
};

const TestimonialsSlider = ({ items = defaultItems, ariaLabel = 'Testimonials', autoPlayMs = 5000 }) => {
	const normalizedItems = items.length ? items : defaultItems;
	const length = normalizedItems.length;
	const extendedItems = useMemo(() => normalizedItems.concat(normalizedItems, normalizedItems), [normalizedItems]);
	const midpoint = length;

	const [activeIndex, setActiveIndex] = useState(midpoint);
	const [translateX, setTranslateX] = useState(0);

	const prefersReducedMotion = usePrefersReducedMotion();

	const containerRef = useRef(null);
	const trackRef = useRef(null);
	const slideRefs = useRef([]);
	const headingRefs = useRef([]);
	const autoplayRef = useRef(null);
	const pointerStartXRef = useRef(null);
	const pointerActiveRef = useRef(false);
	const shouldFocusHeading = useRef(false);

	const logicalIndex = length ? ((activeIndex - midpoint) % length + length) % length : 0;

	const maintainLoopBounds = useCallback(
		(index) => {
			if (length === 0) return 0;
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
		const slide = slideRefs.current[activeIndex];
		if (!container || !slide) return;

		const containerWidth = container.offsetWidth;
		const slideLeft = slide.offsetLeft;
		const slideWidth = slide.offsetWidth;
		const slideCenter = slideLeft + slideWidth / 2;
		const targetOffset = slideCenter - containerWidth / 2;
		setTranslateX(-targetOffset);
	}, [activeIndex]);

	useEffect(() => {
		const handleResize = () => window.requestAnimationFrame(calculateTranslate);
		handleResize();

		let observer;
		if (typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(handleResize);
			if (containerRef.current) observer.observe(containerRef.current);
			if (trackRef.current) observer.observe(trackRef.current);
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			if (observer) observer.disconnect();
		};
	}, [calculateTranslate]);

	useEffect(() => {
		window.requestAnimationFrame(calculateTranslate);
	}, [activeIndex, calculateTranslate]);

	useEffect(() => {
		if (shouldFocusHeading.current) {
			const target = headingRefs.current[activeIndex];
			if (target) {
				target.focus({ preventScroll: true });
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
		if (prefersReducedMotion || autoPlayMs <= 0 || length <= 1) return;
		stopAutoplay();
		autoplayRef.current = setInterval(() => {
			setActiveIndex((prev) => maintainLoopBounds(prev + 1));
		}, autoPlayMs);
	}, [autoPlayMs, length, maintainLoopBounds, prefersReducedMotion, stopAutoplay]);

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

	useEffect(() => {
		if (prefersReducedMotion) {
			stopAutoplay();
		} else {
			startAutoplay();
		}
	}, [prefersReducedMotion, startAutoplay, stopAutoplay]);

	const goTo = useCallback(
		(targetIndex, { focusHeading = false } = {}) => {
			shouldFocusHeading.current = focusHeading;
			setActiveIndex((prev) => {
				const next = typeof targetIndex === 'function' ? targetIndex(prev) : targetIndex;
				return maintainLoopBounds(next);
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
		pointerStartXRef.current = event.clientX;
		pointerActiveRef.current = true;
		stopAutoplay();
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const handlePointerMove = (event) => {
		if (!pointerActiveRef.current || pointerStartXRef.current === null) return;
		const delta = event.clientX - pointerStartXRef.current;
		if (Math.abs(delta) >= SWIPE_THRESHOLD) {
			goTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
			pointerStartXRef.current = event.clientX;
		}
	};

	const handlePointerUp = (event) => {
		pointerActiveRef.current = false;
		pointerStartXRef.current = null;
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		startAutoplay();
	};

	const getSlideState = (index) => {
		if (index === activeIndex) return 'active';
		if (index === activeIndex - 1 || index === activeIndex + 1) return 'adjacent';
		return 'inactive';
	};

	const trackClassName = useMemo(
		() =>
			[
				'flex items-stretch gap-6 sm:gap-8',
				prefersReducedMotion ? '' : 'transition-transform duration-700 ease-brand',
				'will-change-transform',
			]
				.filter(Boolean)
				.join(' '),
		[prefersReducedMotion],
	);

	const slideBaseClasses = 'relative flex-none rounded-2xl border border-brand-dark/10 bg-white p-8 shadow-[0_18px_40px_rgba(10,37,64,0.15)] w-[85%] sm:w-[70%] lg:w-[42%]';
	const slideTransitionClasses = prefersReducedMotion ? '' : 'transition-all duration-700 ease-brand';

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
					<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
					<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
					<div
						ref={trackRef}
						className={trackClassName}
						style={{ transform: `translateX(${translateX}px)` }}
						aria-live="polite"
					>
						{extendedItems.map((testimonial, idx) => {
							const state = getSlideState(idx);
							const isActive = state === 'active';
							const isAdjacent = state === 'adjacent';
							const stateClasses = isActive
								? 'opacity-100 blur-0 scale-100 saturate-100'
								: isAdjacent
								? 'opacity-60 blur-[1.5px] saturate-75 scale-[0.95]'
								: 'opacity-0 pointer-events-none scale-90';
							const identityIndex = length ? ((idx - midpoint) % length + length) % length : idx;
							return (
								<article
									key={`${testimonial.name}-${idx}`}
									ref={(node) => {
										slideRefs.current[idx] = node || null;
									}}
									className={`${slideBaseClasses} ${slideTransitionClasses} ${stateClasses}`}
									style={{ pointerEvents: isActive ? 'auto' : 'none' }}
									role="group"
									aria-label={`Testimonial ${identityIndex + 1} of ${length}`}
								>
									<header className="flex items-center gap-4">
										<span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-cyan text-lg font-semibold text-white shadow-sm shadow-brand-dark/20">
											{testimonial.avatar ?? testimonial.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
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
												{testimonial.role}
												{testimonial.company ? `, ${testimonial.company}` : ''}
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
							onFocus={stopAutoplay}
							onBlur={startAutoplay}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
								<path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
						<div className="flex items-center gap-2">
							{normalizedItems.map((testimonial, idx) => (
								<button
									key={testimonial.name}
									type="button"
									onClick={() => {
										stopAutoplay();
										goTo(midpoint + idx, { focusHeading: true });
										startAutoplay();
									}}
									className={`h-2.5 w-8 rounded-full transition ${idx === logicalIndex ? 'bg-brand-cyan' : 'bg-brand-cyan/30'}`}
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
