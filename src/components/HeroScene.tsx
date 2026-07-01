// src/components/HeroScene.tsx
// A Three.js-powered 3D hero scene:
//   • Animated dot-grid globe with glowing destination markers
//   • An orbiting airplane leaving a trail
//   • Floating connection arcs between destinations
//   • Scroll-based camera zoom + mouse parallax
//   • Fully responsive, cleans up on unmount

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const DESTINATIONS = [
  { lat: 28.6,  lng: 77.2,  label: 'Delhi' },
  { lat: 19.0,  lng: 72.8,  label: 'Mumbai' },
  { lat: 13.0,  lng: 80.2,  label: 'Chennai' },
  { lat: 51.5,  lng: -0.1,  label: 'London' },
  { lat: 40.7,  lng: -74.0, label: 'New York' },
  { lat: 35.7,  lng: 139.7, label: 'Tokyo' },
  { lat: -33.9, lng: 151.2, label: 'Sydney' },
  { lat: 48.9,  lng: 2.3,   label: 'Paris' },
  { lat: 25.2,  lng: 55.3,  label: 'Dubai' },
  { lat: -15.8, lng: -47.9, label: 'Brasilia' },
  { lat: 1.3,   lng: 103.8, label: 'Singapore' },
  { lat: 37.6,  lng: -122.4,label: 'San Francisco' },
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArc(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: THREE.Color,
  segments = 60
): THREE.Line {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.55);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const points = curve.getPoints(segments);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.45,
    linewidth: 1,
  });
  return new THREE.Line(geo, mat);
}

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // ── Globe — dot sphere ─────────────────────────────────────────────
    const GLOBE_R = 1;
    const dotCount = 7000;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotColors = new Float32Array(dotCount * 3);

    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const x = GLOBE_R * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_R * Math.sin(phi) * Math.sin(theta);
      const z = GLOBE_R * Math.cos(phi);
      dotPositions[i * 3]     = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;
      // Color gradient: teal at poles, blue at equator
      const t = (y + 1) / 2;
      dotColors[i * 3]     = 0.05 + t * 0.1;
      dotColors[i * 3 + 1] = 0.55 + t * 0.3;
      dotColors[i * 3 + 2] = 0.8  + t * 0.2;
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));
    const dotMat = new THREE.PointsMaterial({
      size: 0.007,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const globe = new THREE.Points(dotGeo, dotMat);
    scene.add(globe);

    // ── Globe atmosphere glow shell ────────────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(1.07, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x0ea5e9),
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // ── Inner glow sphere ─────────────────────────────────────────────
    const innerGlowGeo = new THREE.SphereGeometry(0.98, 32, 32);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x10b981),
      transparent: true,
      opacity: 0.025,
    });
    scene.add(new THREE.Mesh(innerGlowGeo, innerGlowMat));

    // ── Destination markers ────────────────────────────────────────────
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    const markerGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    // Ring around marker
    const ringGeo = new THREE.TorusGeometry(0.035, 0.006, 6, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.7,
    });

    const markerMeshes: THREE.Mesh[] = [];
    const ringMeshes: THREE.Mesh[] = [];

    DESTINATIONS.forEach((dest) => {
      const pos = latLngToVec3(dest.lat, dest.lng, GLOBE_R + 0.01);
      const m = new THREE.Mesh(markerGeo, markerMat.clone());
      m.position.copy(pos);
      markerGroup.add(m);
      markerMeshes.push(m);

      const r = new THREE.Mesh(ringGeo, (ringMat as THREE.MeshBasicMaterial).clone());
      r.position.copy(pos);
      r.lookAt(0, 0, 0);
      markerGroup.add(r);
      ringMeshes.push(r);
    });

    // ── Arcs between destination pairs ────────────────────────────────
    const arcPairs = [
      [0, 4], [1, 5], [2, 7], [3, 6], [8, 11], [9, 10], [1, 8], [4, 7],
    ] as const;
    const arcColors = [
      new THREE.Color(0x0ea5e9),
      new THREE.Color(0x10b981),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0xf59e0b),
    ];

    arcPairs.forEach(([a, b], i) => {
      const from = latLngToVec3(DESTINATIONS[a].lat, DESTINATIONS[a].lng, GLOBE_R + 0.01);
      const to   = latLngToVec3(DESTINATIONS[b].lat, DESTINATIONS[b].lng, GLOBE_R + 0.01);
      const arc  = createArc(from, to, arcColors[i % arcColors.length]);
      scene.add(arc);
    });

    // ── Airplane (simple arrow mesh) ──────────────────────────────────
    const planeGeo = new THREE.ConeGeometry(0.018, 0.055, 4);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(plane);

    // Trail particles
    const trailCount = 60;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 0.009,
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.55,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    scene.add(trail);

    // ── Starfield backdrop ────────────────────────────────────────────
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 20;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.018,
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Mouse parallax ────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Scroll camera zoom ────────────────────────────────────────────
    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll);

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation Loop ─────────────────────────────────────────────────
    let frameId: number;
    let t = 0;
    const trailHistory: THREE.Vector3[] = [];

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.004;

      // Globe slow spin
      globe.rotation.y += 0.0012;
      markerGroup.rotation.y += 0.0012;

      // Airplane orbits on a tilted latitude
      const planeAngle = t * 0.6;
      const pR = GLOBE_R + 0.06;
      const pLat = 30 * (Math.PI / 180);
      const planePos = new THREE.Vector3(
        pR * Math.cos(pLat) * Math.cos(planeAngle),
        pR * Math.sin(pLat),
        pR * Math.cos(pLat) * Math.sin(planeAngle)
      );
      plane.position.copy(planePos);
      // Orient plane along its velocity
      const nextAngle = planeAngle + 0.01;
      const nextPos = new THREE.Vector3(
        pR * Math.cos(pLat) * Math.cos(nextAngle),
        pR * Math.sin(pLat),
        pR * Math.cos(pLat) * Math.sin(nextAngle)
      );
      plane.lookAt(nextPos);

      // Trail update
      trailHistory.unshift(planePos.clone());
      if (trailHistory.length > trailCount) trailHistory.pop();
      const trailAttr = trailGeo.attributes.position as THREE.BufferAttribute;
      trailHistory.forEach((p, i) => {
        trailAttr.setXYZ(i, p.x, p.y, p.z);
        // Fade opacity for older trail points handled via size falloff
      });
      trailAttr.needsUpdate = true;

      // Pulse markers
      markerMeshes.forEach((m, i) => {
        const pulse = 1 + 0.18 * Math.sin(t * 2 + i * 0.8);
        m.scale.setScalar(pulse);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.7 + 0.3 * Math.sin(t + i);
      });
      ringMeshes.forEach((r, i) => {
        const pulsR = 1 + 0.22 * Math.sin(t * 1.5 + i * 0.6);
        r.scale.setScalar(pulsR);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.35 * Math.abs(Math.sin(t * 0.9 + i));
      });

      // Scroll-based camera dolly
      const scrollFactor = Math.min(scrollY / 600, 1);
      camera.position.z = 3.2 + scrollFactor * 1.5;

      // Mouse parallax — subtle camera drift
      camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.1  - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero-3d-scene"
      aria-hidden="true"
    />
  );
}
