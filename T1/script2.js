import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set the background to white
const humanURL = new URL('human.glb', import.meta.url);
const humanURL2 = new URL('human.glb', import.meta.url);
// Camera and Lights ------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 7);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);

// -----------------------


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movements
controls.dampingFactor = 0.05;

// Create a plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
scene.add(plane);

// Create the first cube with quaternion rotation
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
const cube1 = new THREE.Mesh(geometry, material);
cube1.position.set(-1.5, 0.5, 0); // Move the cube to the left
scene.add(cube1);

// Add edge lines to the first cube
const edges1 = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const edgeLines1 = new THREE.LineSegments(edges1, lineMaterial);
cube1.add(edgeLines1); // Attach edges to the first cube

// Create the second cube with Euler rotation
const cube2 = new THREE.Mesh(geometry, material.clone());
cube2.material.color.set(0xff0000); // Set color to red for distinction
cube2.position.set(1.5, 0.5, 0); // Move the cube to the right
scene.add(cube2);

// Add edge lines to the second cube
const edges2 = new THREE.EdgesGeometry(geometry);
const edgeLines2 = new THREE.LineSegments(edges2, lineMaterial);
cube2.add(edgeLines2); // Attach edges to the second cube

const assetLoader = new GLTFLoader();
let thighL1, thighL2; // References to ThighL bones

let loadedModel;
assetLoader.load(
    humanURL.href,
    function (gltf) {
        const model = gltf.scene;
        loadedModel = gltf.scene;
        scene.add(model);
        model.position.set(3, 0, 0);
        thighL1 = model.getObjectByName('shinL');
        if (!thighL1) console.error("Could not find 'ThighL' in model 1");
       
      // Add visualization helpers for Model 1
      if (thighL1) {
          // Add visualization helpers for Model 1
        const helperGroup1 = new THREE.Group();
        helperGroup1.add(createCircle(0.5, 'x')); // X-axis circle
        helperGroup1.add(createCircle(0.5, 'y')); // Y-axis circle
        helperGroup1.add(createCircle(0.5, 'z')); // Z-axis circle
        thighL1.add(helperGroup1); // Add the group to ThighL

        const axesHelper = new THREE.AxesHelper(3); // Smaller size
        thighL1.add(axesHelper); // Attach an axes helper to visualize orientation
    }

    }
);

assetLoader.load(
    humanURL.href,
    function (gltf) {
        const model2 = gltf.scene;
        loadedModel = gltf.scene;
        scene.add(model2);
        model2.position.set(-3, 0, 0);
    
        thighL2 = model2.getObjectByName('shinL');
        if (!thighL2) console.error("Could not find 'ThighL' in model 2");
        

         // Add visualization helpers for Model 2
    if (thighL2) {
          // Add visualization helpers for Model 1
          const helperGroup2 = new THREE.Group();
          helperGroup2.add(createCircle(0.5, 'x')); // X-axis circle
          helperGroup2.add(createCircle(0.5, 'y')); // Y-axis circle
          helperGroup2.add(createCircle(0.5, 'z')); // Z-axis circle
          thighL2.add(helperGroup2); // Add the group to ThighL
      

        const axesHelper = new THREE.AxesHelper(3); // Smaller size
        thighL2.add(axesHelper); // Attach an axes helper to visualize orientation
    }
    }
);

// Function to create a circle along a specific axis
function createCircle(radius, axis) {
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue by default
    const line = new THREE.LineLoop(geometry, material);

    switch (axis) {
        case 'x':
            line.rotation.y = Math.PI / 2; // Rotate to align with X-axis
            line.material.color.set(0xff0000); // Red
            break;
        case 'y':
            line.rotation.x = Math.PI / 2; // Rotate to align with Y-axis
            line.material.color.set(0x00ff00); // Green
            break;
        case 'z':
            line.material.color.set(0x0000ff); // Blue
            break;
    }
    return line;
}

// Quaternion initialization for the first model
const quaternion = new THREE.Quaternion();
cube1.quaternion.copy(quaternion);

// Euler initialization for the second model
const euler = new THREE.Euler(0, 0, 0, 'XYZ'); // Default to XYZ order
cube2.rotation.copy(euler);

// Add dat.GUI for UI
const gui = new GUI();

// Quaternion controls for the first model's ThighL
const params1 = { x: 0, y: 0, z: 0, w: 1 };
const quaternionFolder1 = gui.addFolder('Quaternion Rotation (ThighL - Model 1)');
quaternionFolder1.add(params1, 'x',  -Math.PI, Math.PI).onChange(updateQuaternion1);
quaternionFolder1.add(params1, 'y',  -Math.PI, Math.PI).onChange(updateQuaternion1);
quaternionFolder1.add(params1, 'z',  -Math.PI, Math.PI).onChange(updateQuaternion1);
quaternionFolder1.add(params1, 'w',  -Math.PI, Math.PI).onChange(updateQuaternion1);
quaternionFolder1.open();

function updateQuaternion1() {
    if (thighL1) {
        thighL1.quaternion.set(params1.x, params1.y, params1.z, params1.w).normalize();
    }
}

// Euler controls for the second model's ThighL
const params2 = { x: 0, y: 0, z: 0 };
const eulerFolder2 = gui.addFolder('Euler Rotation (ThighL - Model 2)');
eulerFolder2.add(params2, 'x', -Math.PI, Math.PI).onChange(updateEuler2);
eulerFolder2.add(params2, 'y', -Math.PI, Math.PI).onChange(updateEuler2);
eulerFolder2.add(params2, 'z', -Math.PI, Math.PI).onChange(updateEuler2);
eulerFolder2.open();



function updateEuler2() {
    if (thighL2) {
        thighL2.rotation.set(params2.x, params2.y, params2.z);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update camera controls
    renderer.render(scene, camera);
}
animate();
