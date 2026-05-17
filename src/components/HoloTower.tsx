"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HoloTower — slowly rotating cyberpunk wireframe tower, drawn as
 * stacked offset boxes + neon edge lines. Used as a hologram inside
 * the briefing panel.
 */
export default function HoloTower() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    cam.position.set(0, 0.8, 6.5);
    cam.lookAt(0, 0.3, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Stacked boxes — tapered tower
    const SEGMENTS = 14;
    const heightStep = 0.36;
    for (let i = 0; i < SEGMENTS; i++) {
      const t = i / (SEGMENTS - 1);
      const w = 1.2 - t * 0.7;
      const d = w * (0.55 + 0.3 * Math.sin(i * 0.6));
      const h = heightStep * (0.85 + (i % 3 === 0 ? 0.4 : 0));
      const geo = new THREE.BoxGeometry(w, h, d);
      const edges = new THREE.EdgesGeometry(geo);
      const mat = new THREE.LineBasicMaterial({
        color: i > SEGMENTS * 0.66 ? 0xff2dca : 0x00e0ff,
        transparent: true,
        opacity: 0.85 - t * 0.3,
      });
      const seg = new THREE.LineSegments(edges, mat);
      seg.position.y = -1.4 + i * heightStep + (i % 4 === 0 ? 0.1 : 0);
      seg.rotation.y = (i % 2 === 0 ? 1 : -1) * (i * 0.06);
      group.add(seg);
    }

    // Top antenna
    const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const antMat = new THREE.MeshBasicMaterial({ color: 0xff2dca });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.y = -1.4 + SEGMENTS * heightStep + 0.6;
    group.add(antenna);

    // Halo ring
    const ringGeo = new THREE.RingGeometry(2.1, 2.15, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.5;
    group.add(ring);

    // Subtle floor grid (10x10 lines)
    const gridGeo = new THREE.BufferGeometry();
    const verts: number[] = [];
    const G = 4, lines = 10;
    for (let i = 0; i <= lines; i++) {
      const t = -G / 2 + (i / lines) * G;
      verts.push(-G / 2, -1.5, t,  G / 2, -1.5, t);
      verts.push(t, -1.5, -G / 2,  t, -1.5,  G / 2);
    }
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    const gridMat = new THREE.LineBasicMaterial({ color: 0x00e0ff, transparent: true, opacity: 0.2 });
    scene.add(new THREE.LineSegments(gridGeo, gridMat));

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.18;
      // small breathing
      group.position.y = Math.sin(t * 0.6) * 0.04;
      // ring pulse
      ringMat.opacity = 0.25 + 0.25 * (Math.sin(t * 1.4) * 0.5 + 0.5);
      // antenna tip blink (modulate antenna mat color intensity)
      const blink = 0.4 + 0.6 * (Math.sin(t * 4.0) * 0.5 + 0.5);
      antMat.color.setRGB(blink, 0.18 * blink, 0.79 * blink);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
