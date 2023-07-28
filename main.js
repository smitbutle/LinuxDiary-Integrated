import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import blueTexture from "/skyblue.jpg";
import skyTexture from "/sky.jpg";
import waterNormals from "/waternormals.jpg";

import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { GUI } from "dat.gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

let snowParticles, snowMaterial;
let container, intro, defi, schedule, stats;
let camera, scene, renderer;
let controls, previousMouseX;
let text,
	polarBear,
	polarBearAnimation,
	seagullAnimation,
	seagull,
	snowMan,
	snowManAnimation,
	shipAnimation;

/* Loading Manager */
const loadingManager = new THREE.LoadingManager();
let loadingStartTime = 0;

// loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
// 	loadingStartTime = performance.now();
// 	console.log("started");
// };

loadingManager.onProgress = function (url, loaded, total) {
	const loader = document.getElementById("loader");
	const container = document.getElementById("container");
	const progress = document.getElementById("progress");
	progress.value = (loaded / total) * 100;
	loader.style.display = "grid";
	container.style.display = "none";
};
loadingManager.onLoad = function (url, item, total) {
	const loader = document.getElementById("loader");
	const container = document.getElementById("container");
	loader.style.display = "none";
	container.style.display = "flex";
	// const loadingTime = performance.now() - loadingStartTime;
	// const minimumLoadingTime = 3000; // 3 seconds in milliseconds

	// if (loadingTime < minimumLoadingTime) {
	// 	const remainingTime = minimumLoadingTime - loadingTime;
	// 	setTimeout(function () {
	// 		const loader = document.getElementById("loader");
	// 		const container = document.getElementById("container");
	// 		loader.style.display = "none";
	// 		container.style.display = "flex";
	// 	}, remainingTime);
	// } else {
	// 	const loader = document.getElementById("loader");
	// 	const container = document.getElementById("container");
	// 	loader.style.display = "none";
	// 	container.style.display = "flex";
	// }
};

const loader = new GLTFLoader(loadingManager);
// const container = document.getElementsByClassName("container")[0];

//fonts
const fontLoader = new FontLoader();
fontLoader.load(
	"node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json",
	(font) => {
		const textGeometry = new TextGeometry("Linux Diary", {
			font: font,
			size: 1,
			height: 0.2,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.03,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 5,
		});
		const textMaterial = new THREE.MeshBasicMaterial({ color: "gray" });
		text = new THREE.Mesh(textGeometry, textMaterial);
		text.position.set(20, 8, 20); // Adjust the position of the text
		text.rotation.y = Math.PI * 0.6;
		// Rotate the text to face up
	}
);

class Island {
	constructor() {
		loader.load("/island2.glb", (gltf) => {
			// jaast differnece disena mnun comment out kela
			// gltf.scene.traverse((child) => {
			// 	if (child.isMesh) {
			// 		console.log(child);
			// 		child.material.lights = true;
			// 	}
			// });
			scene.add(gltf.scene);
			gltf.scene.scale.set(5, 5, 5);
			gltf.scene.position.set(0, 10, -100);
			gltf.scene.rotation.y = 1.8;
			this.island = gltf.scene;
			this.island.add(text);

			polarBear = new PolarBear(this.island);
			seagull = new Seagull(this.island);
			// snowMan = new SnowMan(this.island);
		});
	}
}
class PolarBear {
	constructor(parentObj) {
		loader.load("/PolarBear/polarBear.glb", (gltf) => {
			parentObj.add(gltf.scene);
			gltf.scene.scale.set(0.03, 0.03, 0.03);
			gltf.scene.position.set(35, 6.5, -10);
			gltf.scene.rotation.y = Math.PI * 0.4;
			gltf.scene.rotateX(0.3);
			polarBearAnimation = gltf.animations[0];
			this.bear = gltf.scene;
			if (polarBearAnimation && this.bear) {
				this.mixer = new THREE.AnimationMixer(this.bear);
				const action = this.mixer.clipAction(polarBearAnimation);
				action.play();
			}
		});
	}
}
class Seagull {
	constructor(parentObject) {
		// Create and load the seagull object
		loader.load("/seagull/seagull.glb", (gltf) => {
			this.seagull = gltf.scene;
			this.seagull.scale.set(2, 2, 2);

			// Define the parameters for the revolving motion
			const radius = 40; // Radius of the circular path
			const speed = 0.5; // Speed of the revolving motion

			const initialAngle = Math.random() * Math.PI * 2; // Random initial angle
			const initialX = Math.cos(initialAngle) * radius;
			const initialZ = Math.sin(initialAngle) * radius;
			seagullAnimation = gltf.animations[0];
			this.seagull.position.set(initialX, 15, initialZ);
			parentObject.add(this.seagull);
			if (seagullAnimation && this.seagull) {
				this.mixer = new THREE.AnimationMixer(this.seagull);
				const action = this.mixer.clipAction(seagullAnimation);
				action.play();
			}

			const clock = new THREE.Clock();

			const animate = () => {
				const elapsedTime = clock.getElapsedTime();
				const angle = elapsedTime * speed;
				const x = Math.cos(angle) * radius;
				const z = Math.sin(angle) * radius;
				this.seagull.position.set(x, 15, z);
				this.seagull.lookAt(parentObject.position);

				requestAnimationFrame(animate);
			};

			animate();
		});
	}
}

class SnowMan {
	constructor(parentObj) {
		loader.load("/snowman/snowman.glb", (gltf) => {
			parentObj.add(gltf.scene);
			gltf.scene.scale.set(2, 3, 2);
			gltf.scene.position.set(-20, 4.5, -10);
			gltf.scene.rotation.y = -Math.PI * 1.5;
			snowManAnimation = gltf.animations[0];
			this.obj = gltf.scene;
			if (snowManAnimation && this.obj) {
				this.mixer = new THREE.AnimationMixer(this.obj);
				const action = this.mixer.clipAction(snowManAnimation);
				action.play();
			}
		});
	}
}
class Tux {
	constructor() {
		loader.load("/tux/Tux.glb", (gltf) => {
			scene.add(gltf.scene);
			gltf.scene.scale.set(25, 25, 25);
			gltf.scene.position.set(-14, 45, -320);
			gltf.scene.rotation.y = -Math.PI * 0.5;
			this.obj = gltf.scene;
		});
	}
}
class Ship {
	constructor() {
		loader.load("/ship/ship.glb", (gltf) => {
			scene.add(gltf.scene);
			gltf.scene.scale.set(6, 6, 6);
			gltf.scene.position.set(0, 40, -320);
			gltf.scene.rotation.y = -Math.PI * 0.5;
			shipAnimation = gltf.animations[0];
			this.obj = gltf.scene;
			if (shipAnimation && this.obj) {
				this.mixer = new THREE.AnimationMixer(this.obj);
				const action = this.mixer.clipAction(shipAnimation);
				action.play();
			}
		});
	}
}

let isDragging = false;

let touchStartX = 0;

window.addEventListener("touchstart", (event) => {
	isDragging = true;
	touchStartX = event.touches[0].clientX;
});

window.addEventListener("touchend", () => {
	isDragging = false;
});

window.addEventListener("touchmove", (event) => {
	if (isDragging) {
		const delta = event.touches[0].clientX - touchStartX;
		const angle = (delta / window.innerWidth) * Math.PI * 2;
		if (island.island) island.island.rotation.y += angle * 0.5;
		touchStartX = event.touches[0].clientX;
	}
});

window.onmousedown = (event) => {
	isDragging = true;
	previousMouseX = event.clientX;
};
window.onmouseup = () => {
	isDragging = false;
};
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
window.onmousemove = (e) => {
	if (isDragging) {
		const delta = event.clientX - previousMouseX;
		const angle = (delta / window.innerWidth) * Math.PI * 2;
		if (island.island) island.island.rotation.y += angle * 0.5;
		previousMouseX = event.clientX;
	}
};
const island = new Island();
const ship = new Ship();
const tux = new Tux();

init();
animate();
function init() {
	container = document.getElementById("container");
	intro = document.getElementById("introduction");
	defi = document.getElementById("defination");
	schedule = document.getElementById("schedule");

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.LinearToneMapping;
	renderer.toneMappingExposure = 0.5;
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);
	//

	scene = new THREE.Scene();
	scene.background = new THREE.TextureLoader().load(skyTexture);

	const aLight = new THREE.AmbientLight(0xffffff, 0.3);
	scene.add(aLight);
	// const directionalLight = new THREE.DirectionalLight(0x00008B, 0.4);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 2.65);
	const directionalLightHelper = new THREE.DirectionalLightHelper(
		directionalLight
	);
	// scene.add(directionalLightHelper);
	directionalLight.position.set(-24, 462, -916);
	// directionalLight.color.set(4f42b5); //ocean blue
	directionalLight.rotateZ(-0.4);
	directionalLight.scale.set(100, 100, 100);
	directionalLight.castShadow = true;
	scene.add(directionalLight);



	camera = new THREE.PerspectiveCamera(
		55,
		window.innerWidth / window.innerHeight,
		1,
		20000
	);
	//{x: -24.71246352270173, y: 462.2678991177499, z: -916.6984048572901}
	camera.position.set(0, 80, -400);
	// camera.position.set(-24,462,-916)

	// const planeGeometry = new THREE.PlaneGeometry(2000, 1200);
	// const planeMaterial = new THREE.MeshBasicMaterial({
	// 	map: new THREE.TextureLoader().load(blueTexture),
	// });
	// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	// plane.position.set(0, -100, 0); // Adjust the position of the plane
	// plane.rotation.x = Math.PI * -0.5; // Rotate the plane to face up
	// scene.add(plane);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = false;
	controls.enableRotate = false; // Disable auto-rotation
	controls.enablePan = false; // Disable panning

	stats = new Stats();
	container.appendChild(stats.dom);

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	// renderer.setSize(window.innerWidth, window.innerHeight);
	// 	if (island.island) {
	// 	if (window.innerWidth < 768) {
	// 		island.island.position.set(0, 7, -50);
	// 	} else {
	// 		island.island.position.set(0, 10, -100);
	// 	}
	// }
}
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
	render();
	if (isDragging)
		intro.innerHTML = `Welcome to the world of <strike>Tuxes 🐧</strike> Linux Diary`;
	if (polarBear && polarBear.mixer) {
		polarBear.mixer.update(clock.getDelta());
	}
	if (seagull && seagull.mixer) {
		seagull.mixer.update(clock.getDelta() * 150);
	}
	if (snowMan && snowMan.mixer) {
		snowMan.mixer.update(clock.getDelta() * 200);
	}
	if (ship && ship.mixer) {
		ship.obj.receiveShadow = true;
		if (isDragging) ship.mixer.update(clock.getDelta() * 1000);
	}
	if (island.island) {
		const rotation = Math.abs(island.island.rotation.y);
		const anglePerSection = (2 * Math.PI) / 3; // Divide the rotation into 3 equal parts
		const currentSection = Math.floor((rotation / anglePerSection) % 3);
		intro.style.display = currentSection === 0 ? "flex" : "none";
		defi.style.display = currentSection === 1 ? "flex" : "none";
		schedule.style.display = currentSection === 2 ? "flex" : "none";
	}
	if (island.island) camera.lookAt(island.island.position);
	controls.update();
	stats.update();
}

function render() {
	const time = performance.now() * 0.001;
	renderer.render(scene, camera);
}
