import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import GUI from 'lil-gui';

let container, renderer, scene, camera, controls;
let composer, bloomPass;
let cardGroup, cardMesh, borderMesh, earthMesh, atmosMesh, stars, clock;
let cardMaterial;

const TEX_LOADER = new THREE.TextureLoader();

// Mouse / tilt
const mouse = new THREE.Vector2();
const targetRotation = new THREE.Vector2();
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Parameters
const params = {
  rotationSpeed: 0.1,      // Earth spin
  tiltStrength: 0.3,       // Card tilt power
  bloomStrength: 0.9,
  bloomRadius: 0.5,
  bloomThreshold: 0.15,
  atmosIntensity: 0.8,
  brightness: 1.0,
  glassRoughness: 0.15,
  glassTransmission: 0.9,
};

init();
animate();

function init() {
  container = document.getElementById('world');

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  resizeRenderer();

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.02);

  // Camera
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 14;

  // Lights
  const ambient = new THREE.AmbientLight(0x111111);
  scene.add(ambient);

  const rimLight = new THREE.SpotLight(0x22d3ee, 10);
  rimLight.position.set(-5, 5, 2);
  rimLight.lookAt(0, 0, 0);
  scene.add(rimLight);

  // Card group
  cardGroup = new THREE.Group();
  scene.add(cardGroup);

  createGlassCard();
  createHyperEarth();
  createStarField();

  // Postprocessing
  const renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    params.bloomStrength,
    params.bloomRadius,
    params.bloomThreshold
  );
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  setupGUI();
  clock = new THREE.Clock();

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove, false);

  // Fade out loader
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.style.opacity = 0;
  }, 1000);
}

function createGlassCard() {
  const cardWidth = 3.4;
  const cardHeight = 5.0;

  // Frosted glass
  const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
  cardMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.1,
    roughness: params.glassRoughness,
    transmission: params.glassTransmission,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
  });
  cardMesh = new THREE.Mesh(cardGeo, cardMaterial);
  cardMesh.position.z = -0.1;
  cardGroup.add(cardMesh);

  // Border
  const borderGeo = new THREE.PlaneGeometry(cardWidth * 1.01, cardHeight * 1.01);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  });
  borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.z = -0.1;
  cardGroup.add(borderMesh);

  // Top & bottom accents
  const cornerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const c1 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.02), cornerMat);
  c1.position.set(0, cardHeight / 2 + 0.05, -0.1);
  cardGroup.add(c1);

  const c2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.02), cornerMat);
  c2.position.set(0, -cardHeight / 2 - 0.05, -0.1);
  cardGroup.add(c2);
}

function createHyperEarth() {
  const sphereGeo = new THREE.SphereGeometry(1.25, 128, 128);

  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: {
        value: TEX_LOADER.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
        ),
      },
      nightTexture: {
        value: TEX_LOADER.load(
          'https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth-night.jpg'
        ),
      },
      specularTexture: {
        value: TEX_LOADER.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
        ),
      },
      sunDirection: { value: new THREE.Vector3(5, 3, 5) },
      brightness: { value: params.brightness },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  });

  earthMesh = new THREE.Mesh(sphereGeo, earthMat);
  earthMesh.position.z = 0.5;
  cardGroup.add(earthMesh);

  // Atmosphere
  const atmosGeo = new THREE.SphereGeometry(1.35, 64, 64);
  const atmosMat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
      bias: { value: 0.7 },
      power: { value: 4.0 },
      intensity: { value: params.atmosIntensity },
    },
    vertexShader: document.getElementById('atmosphereVertex').textContent,
    fragmentShader: document.getElementById('atmosphereFragment').textContent,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
  atmosMesh.position.copy(earthMesh.position);
  cardGroup.add(atmosMesh);
}

function createStarField() {
  const count = 2500;
  const geom = new THREE.BufferGeometry();
  const pos = [];
  const colors = [];

  // More blue-white space colors
  const palette = [0xffffff, 0x93c5fd, 0xfef3c7, 0xa5b4fc];

  // Stars in a sphere shell around the origin (Earth)
  for (let i = 0; i < count; i++) {
    // Random direction
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    // Distance from center (20–40)
    const radius = 20 + Math.random() * 20;
    const x = dir.x * radius;
    const y = dir.y * radius;
    const z = dir.z * radius;
    pos.push(x, y, z);

    const col = new THREE.Color(
      palette[Math.floor(Math.random() * palette.length)]
    );
    const brightness = 0.7 + Math.random() * 0.6; // brighter
    colors.push(col.r * brightness, col.g * brightness, col.b * brightness);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.22,                      // bigger stars
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    map: TEX_LOADER.load(
      'https://raw.githubusercontent.com/Kuntal-Das/textures/main/icons/star.png'
    ),
    blending: THREE.AdditiveBlending,
    depthWrite: false,               // no depth writing → pure glow
    sizeAttenuation: true
  });

  stars = new THREE.Points(geom, mat);
  scene.add(stars);
}
function setupGUI() {
  const gui = new GUI();
  gui.title('Planet Controls');

  const f1 = gui.addFolder('Planet');
  f1.add(params, 'rotationSpeed', 0.0, 0.5).name('Spin');
  f1
    .add(params, 'brightness', 0.5, 1.5, 0.01)
    .name('Brightness')
    .onChange((v) => {
      if (earthMesh && earthMesh.material.uniforms.brightness) {
        earthMesh.material.uniforms.brightness.value = v;
      }
    });
  f1
    .add(params, 'atmosIntensity', 0.0, 2.0, 0.01)
    .name('Atmosphere')
    .onChange((v) => {
      if (atmosMesh && atmosMesh.material.uniforms.intensity) {
        atmosMesh.material.uniforms.intensity.value = v;
      }
    });

  const f2 = gui.addFolder('Interaction');
  f2.add(params, 'tiltStrength', 0.0, 1.0).name('Tilt Power');

  const f3 = gui.addFolder('Post FX');
  f3
    .add(params, 'bloomStrength', 0.0, 3.0, 0.01)
    .name('Bloom Strength')
    .onChange((v) => (bloomPass.strength = v));
  f3
    .add(params, 'bloomRadius', 0.0, 2.0, 0.01)
    .name('Bloom Radius')
    .onChange((v) => (bloomPass.radius = v));
  f3
    .add(params, 'bloomThreshold', 0.0, 1.0, 0.01)
    .name('Bloom Threshold')
    .onChange((v) => (bloomPass.threshold = v));

  const f4 = gui.addFolder('Glass');
  f4
    .add(params, 'glassTransmission', 0.0, 1.0, 0.01)
    .name('Opacity')
    .onChange((v) => {
      if (cardMaterial) cardMaterial.transmission = v;
    });
  f4
    .add(params, 'glassRoughness', 0.0, 1.0, 0.01)
    .name('Roughness')
    .onChange((v) => {
      if (cardMaterial) cardMaterial.roughness = v;
    });
}

function onMouseMove(event) {
  mouse.x = (event.clientX - windowHalfX) / windowHalfX;
  mouse.y = (event.clientY - windowHalfY) / windowHalfY;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Earth spin + moving sun direction
  if (earthMesh) {
    earthMesh.rotation.y += params.rotationSpeed * delta;

    const sunUniform = earthMesh.material.uniforms.sunDirection;
    if (sunUniform) {
      const t = elapsed * 0.1;
      sunUniform.value.set(Math.cos(t) * 5.0, 3.0, Math.sin(t) * 5.0);
    }
  }

  // Card tilt
  if (cardGroup) {
    targetRotation.x = mouse.y * params.tiltStrength;
    targetRotation.y = mouse.x * params.tiltStrength;

    cardGroup.rotation.x += (targetRotation.x - cardGroup.rotation.x) * 5 * delta;
    cardGroup.rotation.y += (targetRotation.y - cardGroup.rotation.y) * 5 * delta;

    cardGroup.position.y = Math.sin(elapsed * 0.8) * 0.15;
  }

  // Star parallax
  if (stars) {
    stars.rotation.y = -mouse.x * 0.05;
    stars.rotation.x = -mouse.y * 0.05;
  }

  controls.update();
  composer.render();
}

function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  windowHalfX = width / 2;
  windowHalfY = height / 2;

  renderer.setSize(width, height);
  composer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height);
}
