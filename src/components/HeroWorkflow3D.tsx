import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const _dummy = new THREE.Object3D();
const _curvePos = new THREE.Vector3();
const _curveTangent = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

interface PulseToken {
  curveIndex: number;
  offset: number;
  speed: number;
}

function StaticWorkflowFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden border border-[#F4F2ED]/10 bg-[#171719] p-6"
    >
      <svg
        viewBox="0 0 480 380"
        className="h-full w-full max-w-[460px]"
        fill="none"
      >
        <path
          d="M70 190 C 140 190, 150 95, 235 95 C 310 95, 330 155, 410 155"
          stroke="#E85D26"
          strokeOpacity="0.65"
          strokeWidth="1.5"
        />
        <path
          d="M70 190 C 150 190, 160 285, 245 285 C 320 285, 340 225, 410 225"
          stroke="#F4F2ED"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        <path
          d="M235 95 C 275 95, 265 285, 245 285"
          stroke="#E85D26"
          strokeOpacity="0.35"
          strokeDasharray="4 4"
          strokeWidth="1.25"
        />
        {[
          { x: 70, y: 190, r: 18, accent: true },
          { x: 235, y: 95, r: 16, accent: false },
          { x: 245, y: 285, r: 16, accent: false },
          { x: 410, y: 155, r: 14, accent: true },
          { x: 410, y: 225, r: 14, accent: false },
        ].map((node, idx) => (
          <g key={idx}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r + 7}
              stroke={node.accent ? '#E85D26' : '#F4F2ED'}
              strokeOpacity="0.3"
              strokeWidth="1"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#1E1E22"
              stroke={node.accent ? '#E85D26' : '#F4F2ED'}
              strokeOpacity={node.accent ? '0.9' : '0.45'}
              strokeWidth="1.5"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={4}
              fill={node.accent ? '#E85D26' : '#F4F2ED'}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function HeroWorkflow3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrowMobile = window.innerWidth < 640;

    if (reducedMotion || isNarrowMobile) {
      setFallbackMode(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Probe WebGL2 support & software GL
    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!probeGl) {
      setFallbackMode(true);
      return;
    }

    const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
    const gpuStr = String(probeGl.getParameter(param));
    probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuStr);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackMode(true);
      return;
    }

    let disposed = false;
    let frameId = 0;
    let cleanupListeners: (() => void) | null = null;
    let cleanupResources: (() => void) | null = null;

    try {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth || 640, container.clientHeight || 520);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x141416);
      scene.fog = new THREE.FogExp2(0x141416, 0.048);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      pmremGenerator.dispose();

      const width = container.clientWidth || 640;
      const height = container.clientHeight || 520;
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0.5, 11.2);

      // Three-point warm/cool lighting rig
      const keyLight = new THREE.DirectionalLight(0xffe6d4, 1.8);
      keyLight.position.set(6, 8, 7);
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight(0xbcc9dc, 0x161618, 0.75);
      scene.add(hemiLight);

      const rimLight = new THREE.DirectionalLight(0xe85d26, 2.2);
      rimLight.position.set(-7, -3, -5);
      scene.add(rimLight);

      // Master workflow assembly group
      const workflowGroup = new THREE.Group();
      scene.add(workflowGroup);

      // Shared materials (varied roughness >= 0.25 and metalness)
      const obsidianMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c20,
        roughness: 0.65,
        metalness: 0.2,
      });

      const brushedSteelMat = new THREE.MeshPhysicalMaterial({
        color: 0xc9c6be,
        roughness: 0.22,
        metalness: 0.92,
        clearcoat: 0.4,
      });

      const accentCopperMat = new THREE.MeshStandardMaterial({
        color: 0xe85d26,
        roughness: 0.28,
        metalness: 0.78,
        emissive: 0x3b1304,
        emissiveIntensity: 0.65,
      });

      const tubeMatPrimary = new THREE.MeshStandardMaterial({
        color: 0x625f59,
        roughness: 0.45,
        metalness: 0.65,
      });

      const tubeMatAccent = new THREE.MeshStandardMaterial({
        color: 0xe85d26,
        roughness: 0.35,
        metalness: 0.7,
      });

      // Composite 4-part procedural node factory (no bare single primitives)
      const disposableGeometries: THREE.BufferGeometry[] = [];
      const baseHexGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.22, 8);
      const collarRingGeo = new THREE.TorusGeometry(0.52, 0.045, 12, 32);
      const capGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.14, 16);
      const corePinGeo = new THREE.OctahedronGeometry(0.14, 0);
      disposableGeometries.push(baseHexGeo, collarRingGeo, capGeo, corePinGeo);

      const nodePositions = [
        new THREE.Vector3(-3.3, 0.4, -0.4),  // 0: Trigger / Webhook
        new THREE.Vector3(-1.3, 1.85, 0.8),  // 1: Parser / Filter
        new THREE.Vector3(-1.1, -1.65, 0.5), // 2: Meta Ads Signal
        new THREE.Vector3(0.45, 0.15, -0.3), // 3: Central n8n Router
        new THREE.Vector3(2.2, 1.55, 0.9),   // 4: CRM Sync
        new THREE.Vector3(2.4, -1.35, -0.6), // 5: Creative Asset Queue
        new THREE.Vector3(3.7, 0.15, 0.2),   // 6: Analytics Output
      ];

      const nodeMeshes: THREE.Group[] = [];

      nodePositions.forEach((pos, idx) => {
        const nodeGroup = new THREE.Group();
        nodeGroup.position.copy(pos);

        const scaleFactor = idx === 3 ? 1.32 : idx === 0 || idx === 6 ? 1.05 : 0.92;
        nodeGroup.scale.setScalar(scaleFactor);

        // Part 1: Matte obsidian housing
        const housing = new THREE.Mesh(baseHexGeo, obsidianMat);
        housing.rotation.x = Math.PI / 2;
        nodeGroup.add(housing);

        // Part 2: Anodized precision collar (burnt orange on primary hubs, steel on secondary)
        const isPrimaryHub = idx === 0 || idx === 3 || idx === 6;
        const collar = new THREE.Mesh(
          collarRingGeo,
          isPrimaryHub ? accentCopperMat : brushedSteelMat
        );
        nodeGroup.add(collar);

        // Part 3: Brushed titanium rear cap
        const cap = new THREE.Mesh(capGeo, brushedSteelMat);
        cap.rotation.x = Math.PI / 2;
        cap.position.z = -0.14;
        nodeGroup.add(cap);

        // Part 4: Faceted core indicator
        const core = new THREE.Mesh(
          corePinGeo,
          isPrimaryHub ? accentCopperMat : brushedSteelMat
        );
        core.position.z = 0.18;
        nodeGroup.add(core);

        workflowGroup.add(nodeGroup);
        nodeMeshes.push(nodeGroup);
      });

      // Workflow spline connections
      const connections: Array<[number, number, boolean]> = [
        [0, 1, true],
        [0, 2, false],
        [0, 3, true],
        [1, 3, false],
        [2, 3, true],
        [3, 4, true],
        [3, 5, false],
        [4, 6, true],
        [5, 6, false],
        [1, 4, false],
      ];

      const curves: THREE.CatmullRomCurve3[] = [];
      connections.forEach(([fromIdx, toIdx, isAccent], cIdx) => {
        const a = nodePositions[fromIdx];
        const b = nodePositions[toIdx];
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        mid.z += (cIdx % 2 === 0 ? 1 : -1) * 0.65;
        mid.y += Math.sin(cIdx * 1.4) * 0.35;

        const curve = new THREE.CatmullRomCurve3([a, mid, b]);
        curves.push(curve);

        const tubeGeo = new THREE.TubeGeometry(curve, 36, isAccent ? 0.028 : 0.018, 8, false);
        disposableGeometries.push(tubeGeo);
        const tube = new THREE.Mesh(tubeGeo, isAccent ? tubeMatAccent : tubeMatPrimary);
        workflowGroup.add(tube);
      });

      // Instanced data pulse packets traveling along workflow curves
      const pulseCount = 36;
      const pulseGeo = new THREE.BoxGeometry(0.16, 0.07, 0.07);
      disposableGeometries.push(pulseGeo);
      const pulseMat = new THREE.MeshStandardMaterial({
        color: 0xf4f2ed,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0xe85d26,
        emissiveIntensity: 0.85,
      });
      const instancedPulses = new THREE.InstancedMesh(pulseGeo, pulseMat, pulseCount);
      instancedPulses.frustumCulled = false;
      workflowGroup.add(instancedPulses);

      const pulseTokens: PulseToken[] = Array.from({ length: pulseCount }, (_, i) => ({
        curveIndex: i % curves.length,
        offset: (i / pulseCount + (i % 3) * 0.17) % 1,
        speed: 0.14 + (i % 4) * 0.04,
      }));

      // Subtle spatial grid plane below nodes
      const gridHelper = new THREE.GridHelper(18, 24, 0x2f2f35, 0x1d1d21);
      gridHelper.position.y = -3.4;
      gridHelper.rotation.x = 0.06;
      scene.add(gridHelper);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // Mouse + scroll targets
      let pointerX = 0;
      let pointerY = 0;
      let scrollProgress = 0;

      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };

      const onScroll = () => {
        const maxScroll = Math.max(1, window.innerHeight * 1.1);
        scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      };

      const onResize = () => {
        if (!container || disposed) return;
        const w = container.clientWidth || 640;
        const h = container.clientHeight || 520;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const onContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        setFallbackMode(true);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      cleanupListeners = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      };

      cleanupResources = () => {
        disposableGeometries.forEach((g) => g.dispose());
        obsidianMat.dispose();
        brushedSteelMat.dispose();
        accentCopperMat.dispose();
        tubeMatPrimary.dispose();
        tubeMatAccent.dispose();
        pulseMat.dispose();
        envTexture.dispose();
        renderer.dispose();
      };

      const clock = new THREE.Clock();
      let currentRotY = 0;
      let currentRotX = 0;
      let currentCamZ = 11.2;

      const afterDraw = (cb: () => void) => {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 80);
        }
      };

      const tick = () => {
        if (disposed) return;
        try {
          const delta = Math.min(clock.getDelta(), 0.1);
          const elapsed = clock.getElapsedTime();

          const targetRotY = pointerX * 0.28 + scrollProgress * 0.95 + Math.sin(elapsed * 0.25) * 0.08;
          const targetRotX = pointerY * 0.16 - scrollProgress * 0.28;
          const targetCamZ = 11.2 - scrollProgress * 2.1;

          currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 4.5, delta);
          currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX, 4.5, delta);
          currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 4.0, delta);

          workflowGroup.rotation.y = currentRotY;
          workflowGroup.rotation.x = currentRotX;
          camera.position.z = currentCamZ;
          camera.lookAt(0, 0, 0);

          // Gentle node breathing & axial spin
          for (let i = 0; i < nodeMeshes.length; i++) {
            const node = nodeMeshes[i];
            node.position.y = nodePositions[i].y + Math.sin(elapsed * 1.1 + i * 0.9) * 0.07;
            node.children[3].rotation.y = elapsed * 0.8 + i;
          }

          // Advance instanced data pulses along curves
          for (let i = 0; i < pulseTokens.length; i++) {
            const p = pulseTokens[i];
            const t = (p.offset + elapsed * p.speed) % 1;
            const curve = curves[p.curveIndex];
            curve.getPointAt(t, _curvePos);
            curve.getTangentAt(t, _curveTangent);

            _dummy.position.copy(_curvePos);
            _dummy.quaternion.setFromUnitVectors(_up, _curveTangent);
            _dummy.rotateZ(Math.PI / 2);
            _dummy.updateMatrix();
            instancedPulses.setMatrixAt(i, _dummy.matrix);
          }
          instancedPulses.instanceMatrix.needsUpdate = true;

          renderer.render(scene, camera);

          if (isSoftwareGl) {
            afterDraw(tick);
          } else {
            frameId = requestAnimationFrame(tick);
          }
        } catch {
          disposed = true;
          setFallbackMode(true);
        }
      };

      tick();
    } catch {
      renderer.dispose();
      setFallbackMode(true);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      cleanupListeners?.();
      cleanupResources?.();
    };
  }, []);

  if (fallbackMode) {
    return <StaticWorkflowFallback />;
  }

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D automation workflow visualization"
      className="relative h-full w-full overflow-hidden border border-[#F4F2ED]/10 bg-[#141416]"
    />
  );
}
