import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Create globe with texture and city lights
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
      () => console.log("Earth texture loaded"),
      undefined,
      (err) => console.error("Earth texture error:", err)
    );
    const cityLightsTexture = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.jpg",
      () => console.log("City lights texture loaded"),
      undefined,
      (err) => console.error("City lights texture error:", err)
    );
    const material = new THREE.MeshBasicMaterial({
      map: earthTexture,
      emissiveMap: cityLightsTexture,
      emissive: 0x00ffcc, // Neon cyan glow
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(2.01, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Add Broteq logo
    const logoTexture = textureLoader.load(
      "https://raw.githubusercontent.com/Goosey-13/Broteq_Images/main/Broteq%20Logo-ver4.png",
      () => console.log("Logo loaded successfully"),
      undefined,
      (err) => console.error("Logo loading failed:", err)
    );
    const logoMaterial = new THREE.SpriteMaterial({
      map: logoTexture,
      transparent: true,
      color: 0xffffff,
    });
    const logoSprite = new THREE.Sprite(logoMaterial);
    logoSprite.position.set(0, 3, 0); // Above the globe
    logoSprite.scale.set(5.5, 1.703, 1); // Adjusted for 672x208 aspect ratio (672/208 ≈ 3.23)
    scene.add(logoSprite);

    // Add data connection lines
    const connections: { line: THREE.Line; opacity: number; fade: number }[] = [];
    const numConnections = 3;
    function createConnection() {
      const phi1 = Math.random() * Math.PI * 2;
      const theta1 = Math.acos(2 * Math.random() - 1);
      const phi2 = Math.random() * Math.PI * 2;
      const theta2 = Math.acos(2 * Math.random() - 1);

      const start = new THREE.Vector3(
        2 * Math.sin(theta1) * Math.cos(phi1),
        2 * Math.sin(theta1) * Math.sin(phi1),
        2 * Math.cos(theta1)
      );
      const end = new THREE.Vector3(
        2 * Math.sin(theta2) * Math.cos(phi2),
        2 * Math.sin(theta2) * Math.sin(phi2),
        2 * Math.cos(theta2)
      );

      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3().lerpVectors(start, end, 0.5).multiplyScalar(1.5),
        end
      );
      const points = curve.getPoints(50);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      return { line, opacity: 0.4, fade: -0.004 };
    }

    for (let i = 0; i < numConnections; i++) {
      connections.push(createConnection());
    }