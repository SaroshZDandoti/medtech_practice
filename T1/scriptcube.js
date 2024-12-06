import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set the background to white

// Camera and Lights
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

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
cube1.position.set(-3, 0.5, 0); // Move the cube to the left
scene.add(cube1);

// Add edge lines to the first cube
const edges1 = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const edgeLines1 = new THREE.LineSegments(edges1, lineMaterial);
cube1.add(edgeLines1); // Attach edges to the first cube

// Create axes helper for the first cube
const axesHelper1 = new THREE.AxesHelper(2); // Axes helper with a size of 1
cube1.add(axesHelper1);

// Create the second cube with Euler rotation
const cube2 = new THREE.Mesh(geometry, material.clone());
cube2.material.color.set(0xff0000); // Set color to red for distinction
cube2.position.set(3, 0.5, 0); // Move the cube to the right
scene.add(cube2);

// Add edge lines to the second cube
const edges2 = new THREE.EdgesGeometry(geometry);
const edgeLines2 = new THREE.LineSegments(edges2, lineMaterial);
cube2.add(edgeLines2); // Attach edges to the second cube

// Create axes helper for the second cube
const axesHelper2 = new THREE.AxesHelper(2); // Axes helper with a size of 1
cube2.add(axesHelper2);

// Create circles along the axes for cube 1 (Quaternion)
cube1.add(createCircle(1, 'x', 0xff0000)); // X-axis circle (Red)
cube1.add(createCircle(1, 'y', 0x00ff00)); // Y-axis circle (Green)
cube1.add(createCircle(1, 'z', 0x0000ff)); // Z-axis circle (Blue)

// Create circles along the axes for cube 2 (Euler)
cube2.add(createCircle(1, 'x', 0xff0000)); // X-axis circle (Red)
cube2.add(createCircle(1, 'y', 0x00ff00)); // Y-axis circle (Green)
cube2.add(createCircle(1, 'z', 0x0000ff)); // Z-axis circle (Blue)

// Function to create a circle along a specific axis
function createCircle(radius, axis, color) {
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.LineBasicMaterial({ color: color });
    const line = new THREE.LineLoop(geometry, material);

    // Apply initial rotation based on the axis
    switch (axis) {
        case 'x':
            line.rotation.y = Math.PI / 2; // Rotate to align with X-axis
            break;
        case 'y':
            line.rotation.x = Math.PI / 2; // Rotate to align with Y-axis
            break;
        case 'z':
            break; // No rotation for Z-axis, it's already aligned
    }

    return line;
}

// Quaternion initialization for the first cube
const quaternion = new THREE.Quaternion();
cube1.quaternion.copy(quaternion);

// Euler initialization for the second cube
const euler = new THREE.Euler(0, 0, 0, 'XYZ'); // Default to XYZ order
cube2.rotation.copy(euler);

// Add dat.GUI for UI
const gui = new GUI();

// Controls for the first cube (Quaternion)
const params1 = { x: 0, y: 0, z: 0, w: 1 };
const quaternionFolder = gui.addFolder('Quaternion Rotation (Cube 1)');
quaternionFolder.add(params1, 'x', -Math.PI, Math.PI).onChange(updateQuaternion);
quaternionFolder.add(params1, 'y', -Math.PI, Math.PI).onChange(updateQuaternion);
quaternionFolder.add(params1, 'z', -Math.PI, Math.PI).onChange(updateQuaternion);
quaternionFolder.add(params1, 'w',  -Math.PI, Math.PI).onChange(updateQuaternion);
quaternionFolder.open();

function updateQuaternion() {
    quaternion.set(params1.x, params1.y, params1.z, params1.w).normalize(); // Normalize to maintain a valid rotation
    cube1.quaternion.copy(quaternion);
}

// Controls for the second cube (Euler)
const params2 = { x: 0, y: 0, z: 0 };
const eulerFolder = gui.addFolder('Euler Rotation (Cube 2)');
eulerFolder.add(params2, 'x', -Math.PI, Math.PI).onChange(updateEuler);
eulerFolder.add(params2, 'y', -Math.PI, Math.PI).onChange(updateEuler);
eulerFolder.add(params2, 'z', -Math.PI, Math.PI).onChange(updateEuler);
eulerFolder.open();

function updateEuler() {
    euler.set(params2.x, params2.y, params2.z); // Set the Euler angles
    cube2.rotation.copy(euler);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update camera controls
    renderer.render(scene, camera);
}
animate();
