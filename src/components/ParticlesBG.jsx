import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex) => {
	if (!hex) return { r: 59, g: 175, b: 218 };
	const normalized = hex.replace('#', '');
	if (normalized.length === 3) {
		const [r, g, b] = normalized.split('').map((char) => parseInt(char + char, 16));
		return { r, g, b };
	}
	if (normalized.length === 6) {
		const r = parseInt(normalized.slice(0, 2), 16);
		const g = parseInt(normalized.slice(2, 4), 16);
		const b = parseInt(normalized.slice(4, 6), 16);
		return { r, g, b };
	}
	return { r: 59, g: 175, b: 218 };
};

const defaultConfig = {
	density: 1,
	color: '#3BAFDA',
};

const ParticlesBG = ({ density = defaultConfig.density, color = defaultConfig.color, className = '' }) => {
	const canvasRef = useRef(null);
	const animationRef = useRef({ frame: null, active: false });

	useEffect(() => {
		if (typeof window === 'undefined') return () => {};

		const canvas = canvasRef.current;
		if (!canvas) return () => {};

		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return () => {};

		const rgb = hexToRgb(color);
		const particles = [];
		const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

		let width = 0;
		let height = 0;
		let maxDistance = 120;
		let hidden = document.visibilityState === 'hidden';

		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		let prefersReducedMotion = motionQuery.matches;

		const calcParticleCount = () => {
			const surface = width * height;
			const baseDensity = clamp(density, 0.2, 2);
			const count = Math.min(200, Math.max(12, Math.round((surface / 18000) * baseDensity)));
			return prefersReducedMotion || hidden ? 0 : count;
		};

		const resetTransform = () => {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
		};

		const resizeCanvas = () => {
			const rect = canvas.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			resetTransform();
			maxDistance = clamp(Math.min(width, height) * 0.18, 90, 160);
			createParticles(calcParticleCount());
		};

		const createParticles = (count) => {
			particles.length = 0;
			for (let i = 0; i < count; i += 1) {
				particles.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: 1.4 + Math.random() * 2.4,
					opacity: 0.2 + Math.random() * 0.35,
					vx: -0.15 + Math.random() * 0.3,
					vy: -0.1 + Math.random() * 0.2,
					velocityMod: 0.2 + Math.random() * 0.6,
				});
			}
		};

		const updateParticles = () => {
			for (const particle of particles) {
				particle.x += particle.vx * particle.velocityMod;
				particle.y += particle.vy * particle.velocityMod;

				if (particle.x < -12) particle.x = width + 12;
				if (particle.x > width + 12) particle.x = -12;
				if (particle.y < -12) particle.y = height + 12;
				if (particle.y > height + 12) particle.y = -12;
			}
		};

		const drawParticles = () => {
			if (!width || !height) return;
			ctx.clearRect(0, 0, width, height);

			for (let i = 0; i < particles.length; i += 1) {
				const particle = particles[i];
				ctx.beginPath();
				ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`;
				ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				ctx.fill();

				for (let j = i + 1; j < particles.length; j += 1) {
					const other = particles[j];
					const dx = particle.x - other.x;
					const dy = particle.y - other.y;
					const distance = Math.hypot(dx, dy);

					if (distance < maxDistance) {
						const alpha = clamp(1 - distance / maxDistance, 0, 0.45);
						ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.6})`;
						ctx.lineWidth = 0.8;
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(other.x, other.y);
						ctx.stroke();
					}
				}
			}
		};

		const render = () => {
			if (!animationRef.current.active) return;
			updateParticles();
			drawParticles();
			animationRef.current.frame = requestAnimationFrame(render);
		};

		const start = () => {
			if (animationRef.current.active || prefersReducedMotion || hidden) return;
			animationRef.current.active = true;
			animationRef.current.frame = requestAnimationFrame(render);
		};

		const stop = () => {
			animationRef.current.active = false;
			if (animationRef.current.frame) {
				cancelAnimationFrame(animationRef.current.frame);
				animationRef.current.frame = null;
			}
		};

		const handleVisibilityChange = () => {
			hidden = document.visibilityState === 'hidden';
			if (hidden) {
				stop();
			} else {
				createParticles(calcParticleCount());
				start();
			}
		};

		const handleBlur = () => {
			hidden = true;
			stop();
		};

		const handleFocus = () => {
			hidden = document.visibilityState === 'hidden';
			if (!hidden) {
				createParticles(calcParticleCount());
				start();
			}
		};

		const handleMotionChange = (event) => {
			prefersReducedMotion = !!event?.matches;
			if (prefersReducedMotion) {
				stop();
				createParticles(0);
				ctx.clearRect(0, 0, width, height);
			} else {
				createParticles(calcParticleCount());
				start();
			}
		};

		const handleResize = () => {
			resizeCanvas();
		};

		resizeCanvas();
		if (!prefersReducedMotion) {
			start();
		}

		window.addEventListener('resize', handleResize);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleBlur);
		window.addEventListener('focus', handleFocus);

		if (typeof motionQuery.addEventListener === 'function') {
			motionQuery.addEventListener('change', handleMotionChange);
		} else if (typeof motionQuery.addListener === 'function') {
			motionQuery.addListener(handleMotionChange);
		}

		return () => {
			stop();
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('blur', handleBlur);
			window.removeEventListener('focus', handleFocus);
			if (typeof motionQuery.removeEventListener === 'function') {
				motionQuery.removeEventListener('change', handleMotionChange);
			} else if (typeof motionQuery.removeListener === 'function') {
				motionQuery.removeListener(handleMotionChange);
			}
		};
	}, [density, color]);

	return (
		<div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
			<canvas
				ref={canvasRef}
				className="h-full w-full"
				aria-hidden="true"
				role="presentation"
			/>
		</div>
	);
};

export default ParticlesBG;
