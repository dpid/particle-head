import { createScene } from './scene';
import { createParticleSystem } from './particles';
import './style.css';

async function init() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Container element not found');
  }

  const ctx = createScene(container);
  const { points, material } = await createParticleSystem('/models/head.gltf');

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
