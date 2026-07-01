// src/components/HeroScene.tsx
// Full-screen Three.js hero globe — renders behind all page content.
// Globe is large, centered, dramatic. Mouse parallax + slow auto-rotation.

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

function createArc(from: THREE.Vector3, to: THREE.Vector3, color: THREE.Color): THREE.Line {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.6);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
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
    // Use a wider FOV so globe fills more of the screen
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    // Pull camera back so globe is large but fully visible
    camera.position.set(0.6, 0.1, 2.4);

    // ── Globe — dot sphere ─────────────────────────────────────────────
    const GLOBE_R = 1.0;
    const dotCount = 9000;
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
      // Teal → sky-blue gradient based on height
      const t = (y + 1) / 2;
      dotColors[i * 3]     = 0.04 + t * 0.12;   // R
      dotColors[i * 3 + 1] = 0.5  + t * 0.4;    // G
      dotColors[i * 3 + 2] = 0.85 + t * 0.15;   // B
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));
    const dotMat = new THREE.PointsMaterial({
      size: 0.0065,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const globe = new THREE.Points(dotGeo, dotMat);
    scene.add(globe);

    // ── Outer atmosphere shell ─────────────────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(1.08, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x0ea5e9),
      transparent: true,
      opacity: 0.055,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // Bright equatorial ring glow
    const ringGeoGlow = new THREE.TorusGeometry(1.04, 0.012, 6, 80);
    const ringMatGlow = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
    });
    const equatorRing = new THREE.Mesh(ringGeoGlow, ringMatGlow);
    equatorRing.rotation.x = Math.PI / 2;
    scene.add(equatorRing);

    // ── Destination markers ────────────────────────────────────────────
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    const markerGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const ringGeo   = new THREE.TorusGeometry(0.04, 0.007, 6, 24);

    const markerMeshes: THREE.Mesh[] = [];
    const ringMeshes:   THREE.Mesh[] = [];

    // Alternate marker colors: teal / gold / violet
    const markerColors = [0x10b981, 0xf59e0b, 0xa78bfa, 0x38bdf8, 0xfb7185];

    DESTINATIONS.forEach((dest, i) => {
      const pos = latLngToVec3(dest.lat, dest.lng, GLOBE_R + 0.012);
      const col = new THREE.Color(markerColors[i % markerColors.length]);

      const m = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: col }));
      m.position.copy(pos);
      markerGroup.add(m);
      markerMeshes.push(m);

      const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.65,
      }));
      r.position.copy(pos);
      r.lookAt(0, 0, 0);
      markerGroup.add(r);
      ringMeshes.push(r);
    });

    // ── Arcs between destination pairs ────────────────────────────────
    const arcPairs: [number, number][] = [
      [0, 4], [1, 5], [2, 7], [3, 6], [8, 11], [9, 10], [1, 8], [4, 7], [5, 3], [11, 2],
    ];
    const arcColors = [
      new THREE.Color(0x0ea5e9), new THREE.Color(0x10b981),
      new THREE.Color(0xa78bfa), new THREE.Color(0xf59e0b),
    ];
    arcPairs.forEach(([a, b], i) => {
      const from = latLngToVec3(DESTINATIONS[a].lat, DESTINATIONS[a].lng, GLOBE_R + 0.01);
      const to   = latLngToVec3(DESTINATIONS[b].lat, DESTINATIONS[b].lng, GLOBE_R + 0.01);
      scene.add(createArc(from, to, arcColors[i % arcColors.length]));
    });

    // ── Airplane ──────────────────────────────────────────────────────
    const planeGeo = new THREE.ConeGeometry(0.02, 0.06, 4);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(plane);

    // Trail
    const trailCount = 60;
    const trailPos = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 0.011,
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.6,
    });
    scene.add(new THREE.Points(trailGeo, trailMat));
    const trailHistory: THREE.Vector3[] = [];

    // ── Stars ─────────────────────────────────────────────────────────
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 8;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.015,
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    })));

    // ── Mouse parallax ────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation ─────────────────────────────────────────────────────
    let frameId: number;
    let t = 0;
    // Camera resting offset (slightly right so globe occupies right 55%)
    const CAM_REST_X = 0.5;
    const CAM_REST_Y = 0.05;
    const CAM_REST_Z = 2.4;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.004;

      // Globe auto-rotate
      globe.rotation.y       += 0.0008;
      markerGroup.rotation.y += 0.0008;
      equatorRing.rotation.z += 0.0003;

      // Airplane orbit at 35° latitude
      const planeAngle = t * 0.55;
      const pR  = GLOBE_R + 0.075;
      const pLat = 35 * (Math.PI / 180);
      const pPos = new THREE.Vector3(
        pR * Math.cos(pLat) * Math.cos(planeAngle),
        pR * Math.sin(pLat),
        pR * Math.cos(pLat) * Math.sin(planeAngle)
      );
      plane.position.copy(pPos);
      const nA = planeAngle + 0.01;
      const nPos = new THREE.Vector3(
        pR * Math.cos(pLat) * Math.cos(nA),
        pR * Math.sin(pLat),
        pR * Math.cos(pLat) * Math.sin(nA)
      );
      plane.lookAt(nPos);

      trailHistory.unshift(pPos.clone());
      if (trailHistory.length > trailCount) trailHistory.pop();
      const trailAttr = trailGeo.attributes.position as THREE.BufferAttribute;
      trailHistory.forEach((p, i) => trailAttr.setXYZ(i, p.x, p.y, p.z));
      trailAttr.needsUpdate = true;

      // Pulse markers
      markerMeshes.forEach((m, i) => {
        const s = 1 + 0.22 * Math.sin(t * 2.2 + i * 0.9);
        m.scale.setScalar(s);
      });
      ringMeshes.forEach((r, i) => {
        const s = 1 + 0.28 * Math.sin(t * 1.6 + i * 0.7);
        r.scale.setScalar(s);
        (r.material as THREE.MeshBasicMaterial).opacity = 0.3 + 0.4 * Math.abs(Math.sin(t + i));
      });

      // Camera parallax — globe shifts right when mouse is left and vice versa
      camera.position.x += (CAM_REST_X + mouseX * 0.12 - camera.position.x) * 0.03;
      camera.position.y += (CAM_REST_Y - mouseY * 0.08 - camera.position.y) * 0.03;
      camera.position.z += (CAM_REST_Z - camera.position.z) * 0.03;
      camera.lookAt(0.3, 0, 0); // Look slightly right of center

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="hero-3d-scene" aria-hidden="true" />
  );
}
