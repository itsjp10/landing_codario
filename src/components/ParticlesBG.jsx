import { useEffect, useRef } from 'react';

const ParticlesBG = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return () => {};

		const context = canvas.getContext('2d', { alpha: true });
		if (!context) return () => {};

		const reducedMotion = document.documentElement.dataset.reducedMotion === 'true';
		const particles = [];
		const particleCount = reducedMotion ? 0 : 38;
		let animationId;
		let width;
		let height;
		const pixelRatio = Math.min(2, window.devicePixelRatio || 1);

		const createParticles = () => {
			particles.length = 0;
			for (let i = 0; i < particleCount; i += 1) {
				particles.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: 1.5 + Math.random() * 2.5,
					alpha: 0.35 + Math.random() * 0.4,
					speedX: -0.15 + Math.random() * 0.3,
					speedY: -0.1 + Math.random() * 0.2,
					drift: Math.random() * 0.002 + 0.0005,
				});
			}
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			canvas.width = width * pixelRatio;
			canvas.height = height * pixelRatio;
			context.scale(pixelRatio, pixelRatio);
			createParticles();
		};

		const draw = () => {
			context.clearRect(0, 0, width, height);
			const gradient = context.createRadialGradient(width / 1.5, height / 3, 0, width / 2, height / 2, width);
			gradient.addColorStop(0, 'rgba(59, 175, 218, 0.15)');
			gradient.addColorStop(1, 'rgba(10, 37, 64, 0)');
			context.fillStyle = gradient;
			context.fillRect(0, 0, width, height);

			for (const particle of particles) {
				particle.x += particle.speedX;
				particle.y += particle.speedY;
				particle.speedY += particle.drift;

				if (particle.x < -10) particle.x = width + 10;
				if (particle.x > width + 10) particle.x = -10;
				if (particle.y < -10) particle.y = height + 10;
				if (particle.y > height + 10) particle.y = -10;

				context.beginPath();
				context.fillStyle = `rgba(155, 229, 100, ${particle.alpha})`;
				context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				context.fill();
			}
		};

		const render = () => {
			draw();
			animationId = requestAnimationFrame(render);
		};

		resize();
		if (!reducedMotion) {
			render();
		}

		const handleResize = () => {
			context.setTransform(1, 0, 0, 1, 0, 0);
			resize();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<canvas
				ref={canvasRef}
				aria-hidden="true"
				className="h-full w-full opacity-80"
				role="presentation"
			/>
		</div>
	);
};

export default ParticlesBG;
