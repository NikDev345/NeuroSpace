🪐 Hyper-Realistic 3D Planet Card (Three.js + GLSL)

An interactive 3D holographic Earth card, powered by Three.js, GLSL shaders, and post-processing bloom.
It renders a physically-accurate Earth surface, with real day/night transition, cloud layers, specular ocean highlights, and a glowing atmosphere using custom shader logic.

The planet sits on a glass-like holographic card, with smooth mouse-based tilt interaction, breathing animation, scroll zoom, and a galactic starfield background.

Designed for immersive UI exploration, modern Sci-Fi UI, data dashboards, or futuristic digital cards.

<p align="center"> <em>“Touch the universe.”</em> </p>
🚀 Live Demo

You can run this project directly in your browser using GitHub Pages:

https://YOUR-USERNAME.github.io/YOUR-REPO/


After enabling GitHub Pages in repo → Settings → Pages → Source: main.

🎥 Preview

You can add screenshots/gifs here:

docs/
├── preview.png
├── demo.gif


Example:

![3D Earth Card Preview](docs/preview.png)

✨ Features
🌍 Physically-Inspired Earth Renderer

Day → Night terminator line

Specular reflection over oceans

Soft cloud layer blended over surface

City lights visible on night side

Rayleigh-like scattering near shadow edge

Dynamic sun direction

Custom GLSL fragment shader

💫 Atmospheric Glow

Fresnel-based rim lighting

Additive blending halo

Adjustable intensity & color

🖼 Holographic Card UI

Glass material (transmission, thickness)

Neon wireframe borders

Sci-Fi corner accents

Smooth tilt based on mouse position

Subtle floating animation (“breathing”)

🌌 Deep Space Star Field

3D distributed star sphere

Random star brightness & color

Parallax movement with cursor

Additive blending glow

Infinite feel without noise textures

🎛 Post-Processing

ACES Filmic tone mapping

Bloom pass (UnrealBloomPass)

Adjustable bloom strength / radius

UI via lil-gui

🔧 Technology Stack
Layer	Tech
WebGL Engine	Three.js
Shaders	GLSL (custom vertex + fragment)
Effects	UnrealBloomPass, ACES Filmic tone mapping
Interaction	OrbitControls, Mouse tilt
UI	lil-gui
Environment	CSS nebula + 3D star sphere
Build	ES Modules (importmap)
Hosting	GitHub Pages
🕹 Controls
Action	Description
Move mouse	Tilt the holographic card
Scroll	Zoom camera
Drag	Orbit view (pan disabled)
GUI panel	Adjust bloom, glass, rotation
Earth auto spin	Adjustable rotation speed
📂 Folder Structure
project-root/
│── index.html
│── style.css
│── script.js
│── README.md
└── docs/ (optional screenshots)


No bundlers required — everything runs directly via ES modules.

🧑‍💻 Getting Started
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO

2. Start a local server (recommended)

Three.js ES modules must run from a local server.

npx serve


or

python -m http.server 8000


Then open:

http://localhost:8000

🌍 How It Works (Short Breakdown)
Earth Rendering

The planet uses one sphere with three textures:

Diffuse map (day)

Night lights map

Specular map

Cloud transparency map

Shader computes:

NdotL = dot(normal, sunDirection);
dayMix = smoothstep(-0.2, 0.2, NdotL);
finalColor = mix(nightSide, daySide, dayMix);


Plus specular ocean, cloud whitening, and dark-side scattering.

Atmosphere

A second slightly larger sphere with:

pow(bias - dot(vNormal, viewDir), power)


gives a soft rim halo.

Starfield

Instead of random box noise, we generate a sphere shell:

const dir = new THREE.Vector3(...).normalize();
const radius = 20 + Math.random() * 20;


So stars form a natural sky dome.

🧭 Roadmap / Future Ideas

Saturn / Mars card variants

Solar system mode

Shader-based galaxy nebulas

Space dust particles (depth movement)

AI-generated card metadata

Touch mobile support

Real time cloud movement

ISS orbit satellite visualization

Double-sided glass card flip

NFT metadata display (Web3)

GPT-driven planet info panel

🏷 License

This project is open-source under MIT.

You are free to:

use

modify

distribute

commercial use allowed

Just keep credit.

🙏 Credits

Textures from the Three.js examples and NASA datasets.
Shader logic inspired by real atmospheric scattering papers.

❤️ Author

Created by YOUR NAME
(Sci-Fi UI, AI + graphics enthusiast)

If you use this project, tag me — I’d love to see what you build with it.

🔥 Final Notes

This project is optimized for:

learning Three.js shaders

portfolio showcase

futuristic UI concepts

inspiration for real-time data visualization

If you want help improving:

performance

shader realism

more planets

adding GUI presets

demo video for portfolio

Just ask — I’ll guide you.


- I WILL COME WITH THE NEW UPDATE WITH THIS REPO 
AND POST IT SOON 
STAY TUNED 