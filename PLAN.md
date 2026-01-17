# Particle Head - Phase 1 Implementation Plan

## Goal
Create a Three.js particle system that renders a 3D head model as particles with click-drag rotation.

## Project Setup

### 1. Initialize Git Repository
```bash
git init
```

Create `.gitignore` with:
- `node_modules/`
- `dist/`
- `reference/`
- `.DS_Store`
- `*.local`

### 2. Initialize Vite + TypeScript Project
```bash
npm create vite@latest . -- --template vanilla-ts
npm install three
npm install -D @types/three
```

### 3. Project Structure
```
particle-head/
├── PLAN.md               # This plan
├── src/
│   ├── main.ts           # Entry point
│   ├── scene.ts          # Three.js scene setup
│   ├── particles.ts      # Particle system creation
│   └── shaders/
│       ├── particle.vert # Vertex shader
│       └── particle.frag # Fragment shader
├── public/
│   └── models/
│       └── head.glb      # 3D head model
├── index.html
├── package.json
└── tsconfig.json
```

## Implementation Steps

### Step 1: Scene Setup (`src/scene.ts`)
- Create Three.js scene, camera, renderer
- Add OrbitControls for click-drag rotation
- Configure post-processing (bloom pass for glow effect)
- Handle window resize

### Step 2: Load 3D Head Model
- Use GLTFLoader to load a generic head model
- Source: Free low-poly head from Sketchfab or similar
- Extract vertex positions from the loaded geometry

### Step 3: Create Particle System (`src/particles.ts`)
Based on the reference code pattern:
- Extract positions from model: `geometry.attributes.position`
- Create BufferGeometry with attributes:
  - `position` - vertex positions from head model
  - `color` - particle colors
  - `size` - individual particle sizes
  - `random` - per-particle randomness for animation
- Create ShaderMaterial with custom shaders

### Step 4: Vertex Shader (`src/shaders/particle.vert`)
- Apply subtle oscillation to particle positions
- Calculate point size based on distance
- Pass varying values to fragment shader

### Step 5: Fragment Shader (`src/shaders/particle.frag`)
- Render circular/glowing particles
- Apply color with soft falloff
- Discard transparent pixels

### Step 6: Animation Loop
- Update time uniform for shader animation
- Update OrbitControls
- Render with post-processing composer

## Key Technical Decisions

### Vertex Count / Particle Density
- Start with model's native vertex count
- If too sparse: subdivide geometry or sample surface points
- If too dense: downsample positions
- Target: 10,000 - 30,000 particles for good visual density

### Shader vs JavaScript Animation
- **Use shaders** - much better performance for large particle counts
- JavaScript updates would bottleneck at high particle counts

### Model Requirements
- Low-poly head model (5k-30k vertices)
- GLB/GLTF format (best Three.js support)
- No textures needed (only geometry)

## 3D Head Model Source
**Selected**: [Human Head Base Mesh](https://sketchfab.com/3d-models/human-head-base-mesh-e3fa4d8aed5f45869e3d7c616a8a0841) by ferrumiron6
- Free, low-poly, GLB format
- Clean topology, no textures (perfect for particles)
- Free for personal/commercial use

Alternative: [Low Poly Head](https://sketchfab.com/3d-models/low-poly-head-6b6a762bd8b34b6d9d46d44129b55037) by Zypheos

## Files to Create/Modify

| File | Action |
|------|--------|
| `.gitignore` | Create - ignore node_modules, dist, reference |
| `PLAN.md` | Create - project plan |
| `package.json` | Create via Vite init |
| `tsconfig.json` | Create via Vite init |
| `index.html` | Modify for full-screen canvas |
| `src/main.ts` | Create - app entry |
| `src/scene.ts` | Create - Three.js setup |
| `src/particles.ts` | Create - particle system |
| `src/shaders/particle.vert` | Create - vertex shader |
| `src/shaders/particle.frag` | Create - fragment shader |
| `public/models/head.glb` | Add - 3D model file |

## Verification

1. **Dev server**: `npm run dev` - should show particle head
2. **Interaction**: Click and drag to rotate the head
3. **Visual**: Particles should have subtle animation/glow
4. **Performance**: Maintain 60fps with 15k+ particles
