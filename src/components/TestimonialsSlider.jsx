import { useCallback, useEffect, useRef, useState } from 'react';

const testimonials = [
	{
		name: 'Maya Chen',
		role: 'COO, OrbitOps',
		quote:
			'Codario Labs rebuilt our product marketing stack in five weeks. We saw a 38% lift in qualified pipeline the first month and our ops team finally has a system they trust.',
		rating: 5,
		initials: 'MC',
	},
	{
		name: 'Devin Hart',
		role: 'Head of Product, AtlasPay',
		quote:
			'The team felt like an extension of our own—design, engineering, and analytics running in sync. Every sprint shipped value and the launch went out with zero critical bugs.',
		rating: 5,
		initials: 'DH',
	},
	{
		name: 'Sara Koenig',
		role: 'Growth Lead, Launchpad DAO',
		quote:
			'They guided messaging, UX, and implementation. The net-new investor funnel is performing 2.1x better and the documentation they left behind is stellar.',
		rating: 5,
		initials: 'SK',
	},
];

const TestimonialsSlider = () => {
	const [index, setIndex] = useState(0);
	const autoplayRef = useRef(null);
	const sliderRef = useRef(null);
	const reducedRef = useRef(false);
	const [isReducedMotion, setIsReducedMotion] = useState(false);

	const startAutoplay = useCallback(() => {
		if (reducedRef.current) return;
		clearInterval(autoplayRef.current);
		autoplayRef.current = setInterval(() => {
			setIndex((prev) => (prev + 1) % testimonials.length);
		}, 6000);
	}, []);

	const stopAutoplay = useCallback(() => {
		clearInterval(autoplayRef.current);
	}, []);

	useEffect(() => {
		const reduced = document.documentElement.dataset.reducedMotion === 'true';
		reducedRef.current = reduced;
		setIsReducedMotion(reduced);
	}, []);

	useEffect(() => {
		if (reducedRef.current) {
			stopAutoplay();
			return undefined;
		}
		startAutoplay();
		return () => stopAutoplay();
	}, [startAutoplay, stopAutoplay]);

	useEffect(() => {
		const node = sliderRef.current;
		if (!node || reducedRef.current) return undefined;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					startAutoplay();
				} else {
					stopAutoplay();
				}
			},
			{ threshold: 0.5 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	});

	const handleFocus = () => stopAutoplay();
	const handleBlur = () => startAutoplay();

	return (
		<section className="bg-white py-24" id="testimonials">
			<div className="container">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-dark/60">Testimonials</p>
					<h2 className="mt-4 text-3xl font-semibold text-brand-dark sm:text-4xl">
						Signals from founders and operators shipping with Codario Labs.
					</h2>
				</div>
				<div
					ref={sliderRef}
					className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-brand-dark/10 bg-brand-gray/70 p-10 shadow-soft"
					onMouseEnter={stopAutoplay}
					onMouseLeave={startAutoplay}
				>
					<div className="relative">
						{testimonials.map((testimonial, testimonialIndex) => {
							const isActive = testimonialIndex === index;
							return (
								<article
									key={testimonial.name}
									id={`testimonial-slide-${testimonialIndex}`}
									className={`transition-all duration-500 ease-brand ${
										isActive ? 'opacity-100 translate-x-0' : 'pointer-events-none -translate-x-6 opacity-0'
									}`}
									role={isActive ? 'group' : 'presentation'}
									aria-roledescription="slide"
									aria-hidden={!isActive}
								>
									<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
										<div className="flex flex-none flex-col items-center gap-3 text-center sm:items-start sm:text-left">
											<span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark text-lg font-semibold text-white">
												{testimonial.initials}
											</span>
											<div>
												<p className="font-display text-lg font-semibold text-brand-dark">{testimonial.name}</p>
												<p className="text-sm text-brand-dark/60">{testimonial.role}</p>
											</div>
										</div>
										<p className="text-lg leading-8 text-brand-dark/80">{testimonial.quote}</p>
									</div>
									<div className="mt-8 flex items-center gap-3" aria-label={`${testimonial.rating} star rating`}>
										{Array.from({ length: 5 }).map((_, starIndex) => (
											<svg
												key={starIndex}
												className={`h-5 w-5 ${starIndex < testimonial.rating ? 'text-brand-lime' : 'text-brand-dark/20'}`}
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path d="M12 3.1 9.4 8.4l-5.6.4 4.3 3.7-1.3 5.4L12 15.8l5.2 2.1-1.3-5.4 4.3-3.7-5.6-.4z" />
											</svg>
										))}
										<span className="text-sm text-brand-dark/60">5.0 rating</span>
									</div>
								</article>
							);
						})}
					</div>
					<div className="mt-10 flex items-center justify-between">
						<div className="flex items-center gap-2" role="tablist" aria-label="Testimonials navigator">
							{testimonials.map((testimonial, testimonialIndex) => (
								<button
									key={testimonial.name}
									type="button"
									role="tab"
									aria-selected={testimonialIndex === index}
									aria-controls={`testimonial-slide-${testimonialIndex}`}
									className={`h-2.5 w-8 rounded-full transition ${
										testimonialIndex === index ? 'bg-brand-dark' : 'bg-brand-dark/15'
									}`}
									onClick={() => setIndex(testimonialIndex)}
								>
									<span className="sr-only">{`Go to testimonial from ${testimonial.name}`}</span>
								</button>
							))}
						</div>
						<div className="flex items-center gap-3">
							<button
								type="button"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40"
								onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
								onFocus={handleFocus}
								onBlur={handleBlur}
								aria-label="Previous testimonial"
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
									<path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<button
								type="button"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/40"
								onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
								onFocus={handleFocus}
								onBlur={handleBlur}
								aria-label="Next testimonial"
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
									<path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
						</div>
					</div>
					<div className="sr-only" aria-live="polite">
						Showing testimonial {index + 1} of {testimonials.length}.
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSlider;
