import * as THREE from "https://cdn.skypack.dev/three";

const SKIN_WIDTH = 275;
const SKIN_HEIGHT = 348;

const COLS = 3;
const ROWS = 10;

const CELL_WIDTH = SKIN_WIDTH + 10;
const CELL_HEIGHT = SKIN_HEIGHT + 10;

function createSkinURL(id) {
  return `https://cdn.webampskins.org/screenshots/${id}.png`;
}

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    max;
  }
  return value;
}

function progress(position, start, end) {
  const len = end - start;
  return clamp((position - start) / len, 0, 1);
}

function fetchSkinIndex() {
  return fetch("/skins.json")
    .then((r) => r.json())
    .then((data) => data.skins.map((skin) => createSkinURL(skin.md5)));
}

function randomColor() {
  return Math.random() * 16777215;
}

function createSkinMeshes() {
  const meshes = [];

  const count = COLS * ROWS;
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.PlaneGeometry(SKIN_WIDTH, SKIN_HEIGHT, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    meshes.push(mesh);
  }

  return meshes;
}

async function init() {
  const skinIndex = await fetchSkinIndex();

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    10,
    10000
  );
  camera.position.x = (CELL_WIDTH * COLS) / 2 - CELL_WIDTH / 2;
  camera.position.y = 500;
  camera.position.z = 400;

  camera.rotation.x = 1.3;

  const scene = new THREE.Scene();

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

  function animation(time) {
    const scrollOffset = time * 0.1;
    const exitPos = ROWS * CELL_HEIGHT;

    meshes.forEach((mesh, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);

      const offsetX = col * CELL_WIDTH;
      const offsetY = row * CELL_HEIGHT + scrollOffset;
      const loopCount = Math.floor(offsetY / exitPos);

      mesh.position.x = offsetX;

      mesh.position.y = offsetY;
      mesh.position.y -= loopCount * exitPos;

      {
        const fadeEnd = exitPos;
        const fadeStart = exitPos - CELL_HEIGHT;
        const exitProgress = progress(mesh.position.y, fadeStart, fadeEnd);
        mesh.material.opacity = 1 - exitProgress;
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
}

init();
