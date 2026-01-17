import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import vertexShader from './shaders/particle.vert?raw';
import fragmentShader from './shaders/particle.frag?raw';

const PALETTE = [
  0x7c3aed,
  0xa78bfa,
  0xc4b5fd,
  0x818cf8,
  0x60a5fa,
  0xffffff,
].map((c) => new THREE.Color(c));

export interface ParticleSystem {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
}

export async function createParticleSystem(
  modelPath: string
): Promise<ParticleSystem> {
  const positions = await loadModelPositions(modelPath);
  const particleCount = positions.length / 3;

  const geometry = new THREE.BufferGeometry();

  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const randoms = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    hsl.h += (Math.random() - 0.5) * 0.05;
    hsl.s = Math.min(1, Math.max(0.5, hsl.s + (Math.random() - 0.5) * 0.2));
    hsl.l = Math.min(0.9, Math.max(0.4, hsl.l + (Math.random() - 0.5) * 0.3));

    const finalColor = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
    colors[i * 3] = finalColor.r;
    colors[i * 3 + 1] = finalColor.g;
    colors[i * 3 + 2] = finalColor.b;

    sizes[i] = 0.8 + Math.random() * 0.8;

    randoms[i * 3] = Math.random() * 10;
    randoms[i * 3 + 1] = Math.random() * Math.PI * 2;
    randoms[i * 3 + 2] = 0.5 + 0.5 * Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  return { points, material };
}

async function loadModelPositions(modelPath: string): Promise<Float32Array> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const allPositions: number[] = [];

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            const positionAttr = child.geometry.attributes.position;
            if (positionAttr) {
              child.updateMatrixWorld(true);
              for (let i = 0; i < positionAttr.count; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttr, i);
                vertex.applyMatrix4(child.matrixWorld);
                allPositions.push(vertex.x, vertex.y, vertex.z);
              }
            }
          }
        });

        const positions = new Float32Array(allPositions);
        const normalized = normalizePositions(positions);
        resolve(normalized);
      },
      undefined,
      reject
    );
  });
}

function normalizePositions(positions: Float32Array): Float32Array {
  const TARGET_SIZE = 20;

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX = Math.max(maxX, positions[i]);
    minY = Math.min(minY, positions[i + 1]);
    maxY = Math.max(maxY, positions[i + 1]);
    minZ = Math.min(minZ, positions[i + 2]);
    maxZ = Math.max(maxZ, positions[i + 2]);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  const maxDimension = Math.max(sizeX, sizeY, sizeZ) || 1;
  const scale = TARGET_SIZE / maxDimension;

  const result = new Float32Array(positions.length);

  for (let i = 0; i < positions.length; i += 3) {
    result[i] = (positions[i] - centerX) * scale;
    result[i + 1] = (positions[i + 1] - centerY) * scale;
    result[i + 2] = (positions[i + 2] - centerZ) * scale;
  }

  return result;
}
