import * as THREE from "https://cdn.skypack.dev/three";
import { createStarField } from "./stars.js";
import { lerp } from "./math.js";

const SKIN_WIDTH = 275;
const SKIN_HEIGHT = 348;

const COLS = 3;
const ROWS = 10;

const CELL_WIDTH = SKIN_WIDTH + 10;
const CELL_HEIGHT = SKIN_HEIGHT + 10;

function createSkinURL(id) {
  return `https://cdn.webampskins.org/screenshots/${id}.png`;
}

function fetchSkinIndex() {
  return fetch("/skins.json")
    .then((r) => r.json())
    .then((data) => data.skins.map((skin) => createSkinURL(skin.md5)));
}

function createStarFieldMesh() {
  const geometry = new THREE.PlaneGeometry(10000, 10000, 1);

  const image = createStarField(2000, 2000);
  const texture = new THREE.CanvasTexture(image);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
  });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function createSkinMeshes() {
  const meshes = [];

  const count = COLS * ROWS;
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.PlaneGeometry(SKIN_WIDTH, SKIN_HEIGHT, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    meshes.push(mesh);
  }

  return meshes;
}

async function init() {
  const skinIndex = await fetchSkinIndex();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    10,
    10000
  );
  camera.position.x = (CELL_WIDTH * COLS) / 2 - CELL_WIDTH / 2;
  camera.position.y = 500;
  camera.position.z = 300;

  camera.rotation.x = 1.2;

  const light = new THREE.PointLight(0xffffff, 1.25, 10000);
  light.position.copy(camera.position);
  light.position.z = 800;
  scene.add(light);

  const starField = createStarFieldMesh();
  starField.position.x = camera.position.x;
  starField.position.y = 4000;
  starField.position.z = -400;
  starField.rotation.copy(camera.rotation);
  scene.add(starField);

  const meshes = createSkinMeshes();
  meshes.forEach((mesh) => {
    mesh.material.transparent = true;
    scene.add(mesh);
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const meshMeta = new Map();
  function updateImage(mesh, index) {
    const currentIndex = meshMeta.get(mesh);
    if (currentIndex !== index) {
      const skinURL = skinIndex[index % skinIndex.length];
      const texture = new THREE.TextureLoader().load(skinURL);
      mesh.material.map = texture;
      meshMeta.set(mesh, index);
    }
  }

  let scrubTime = 0;

  function animation(time) {
    const scrollOffset = (time + scrubTime) * 0.05 - 2600;
    const farPoint = ROWS * CELL_HEIGHT;

    meshes.forEach((mesh, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);

      const offsetX = col * CELL_WIDTH;
      const offsetY = row * CELL_HEIGHT + scrollOffset;
      const loopCount = Math.floor(offsetY / farPoint);

      mesh.position.x = offsetX;

      mesh.position.y = offsetY;
      mesh.position.y -= loopCount * farPoint;

      {
        const fadeEnd = farPoint;
        const fadeStart = farPoint - CELL_HEIGHT;
        const fadeProgress = lerp(mesh.position.y, fadeStart, fadeEnd);
        mesh.material.opacity = 1 - fadeProgress;
      }

      {
        const indexOffset = loopCount * meshes.length;
        const imageIndex = indexOffset + index;
        updateImage(mesh, imageIndex);
      }
    });

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animation);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        scrubTime -= 5000;
        break;
      case "ArrowDown":
        scrubTime += 5000;
        break;
    }
  });
}

init();
