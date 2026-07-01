// src/utils/animations.ts
// Pure CSS/JS 3D animation utilities — no libraries, fully tree-shakeable.
// All functions return a cleanup function for useEffect.

/** ──────────────────────────────────────────────
 *  3D MOUSE-TRACKING TILT for cards
 *  Adds perspective tilt + specular highlight on hover.
 *  Automatically disabled on touch-only devices.
 * ────────────────────────────────────────────── */
export function initTiltCards(selector: string, options?: {
  maxTilt?: number;
  perspective?: number;
  scaleOnHover?: number;
  glowColor?: string;
}) {
  const isTouchOnly = !window.matchMedia('(hover: hover)').matches;
  if (isTouchOnly) return () => {};

  const {
    maxTilt = 10,
    perspective = 900,
    scaleOnHover = 1.03,
    glowColor = 'rgba(14, 165, 233, 0.18)',
  } = options ?? {};

  const cards = Array.from(document.querySelectorAll<HTMLElement>(selector));

  const handlers: { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }[] = [];

  cards.forEach((card) => {
    // Add specular highlight pseudo via injected data attr
    card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = -dy * maxTilt; // rotateX (vertical tilt)
      const ry = dx * maxTilt;  // rotateY (horizontal tilt)

      card.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scaleOnHover}) translateZ(8px)`;
      card.style.boxShadow = `0 24px 48px rgba(0,0,0,0.45), 0 0 28px ${glowColor}`;
      card.style.willChange = 'transform';
    };

    const onLeave = () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
      card.style.boxShadow = '';
      card.style.willChange = 'auto';
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    handlers.push({ el: card, move: onMove, leave: onLeave });
  });

  return () => {
    handlers.forEach(({ el, move, leave }) => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  };
}

/** ──────────────────────────────────────────────
 *  SCROLL REVEAL for activity cards
 *  IntersectionObserver-based reveal:
 *  items start as  translateX(-20px) rotateY(-8deg) opacity:0
 *  and animate to  translateX(0)     rotateY(0)     opacity:1
 * ────────────────────────────────────────────── */
export function initScrollReveal(selector = '.activity-item') {
  const items = Array.from(document.querySelectorAll<HTMLElement>(selector));

  items.forEach((el) => {
    if (!el.classList.contains('revealed') && !el.classList.contains('reveal-initialized')) {
      el.classList.add('reveal-initialized');
      el.style.opacity = '0';
      el.style.transform = 'translateX(-24px) rotateY(-8deg)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0) rotateY(0)';
            el.classList.add('revealed');
          }, i * 60);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );

  items.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

/** ──────────────────────────────────────────────
 *  STAGGER ENTRANCE for saved trip cards
 * ────────────────────────────────────────────── */
export function initStaggerCards(selector = '.trip-card') {
  const cards = Array.from(document.querySelectorAll<HTMLElement>(selector));
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(32px) rotateX(10deg)';
    card.style.transition = `opacity 0.5s ease ${i * 80}ms, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`;
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) rotateX(0)';
      }, 50);
    });
  });

  return () => {};
}
