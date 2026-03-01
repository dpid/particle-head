import { createScene } from './scene';
import { createParticleSystem } from './particles';
import './style.css';

async function init() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Container element not found');
  }

  const ctx = createScene(container);
  const modelPath = `${import.meta.env.BASE_URL}models/head.gltf`;
  const { points, material } = await createParticleSystem(modelPath);

  ctx.scene.add(points);

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = ctx.clock.getElapsedTime();
    material.uniforms.time.value = elapsed;

    ctx.controls.update();
    ctx.composer.render();
  }

  animate();
}

init().catch(console.error);
