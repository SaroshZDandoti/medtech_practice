import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Function to create a joint
function createJoint(position) {
	const geometry = new THREE.SphereGeometry(0.2, 16, 16);
	const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const sphere = new THREE.Mesh(geometry, material);
	sphere.position.set(position.x, position.y, position.z);
	return sphere;
}

// Function to create a bone
function createBone(start, end) {
	const length = start.distanceTo(end);
	const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cylinder = new THREE.Mesh(geometry, material);

	// Position and rotate the cylinder
	cylinder.position.copy(start).lerp(end, 0.5); // Place at the midpoint
	cylinder.lookAt(end); // Orient towards the endpoint
	cylinder.rotateX(Math.PI / 2); // Align along the Z-axis

	return cylinder;
}

// Skeleton setup
const skeleton = new THREE.Group();

// Joints
const joints = {
	head: createJoint(new THREE.Vector3(0, 4, 0)),
	shoulderLeft: createJoint(new THREE.Vector3(-1, 3, 0)),
	shoulderRight: createJoint(new THREE.Vector3(1, 3, 0)),
	elbowLeft: createJoint(new THREE.Vector3(-2, 2, 0)),
	elbowRight: createJoint(new THREE.Vector3(2, 2, 0)),
	hipLeft: createJoint(new THREE.Vector3(-0.5, 1, 0)),
	hipRight: createJoint(new THREE.Vector3(0.5, 1, 0)),
	kneeLeft: createJoint(new THREE.Vector3(-0.5, 0, 0)),
	kneeRight: createJoint(new THREE.Vector3(0.5, 0, 0)),
};

// Add joints to skeleton
Object.values(joints).forEach(joint => skeleton.add(joint));

// Bones
const bones = [
	createBone(joints.head.position, joints.shoulderLeft.position),
	createBone(joints.head.position, joints.shoulderRight.position),
	createBone(joints.shoulderLeft.position, joints.elbowLeft.position),
	createBone(joints.shoulderRight.position, joints.elbowRight.position),
	createBone(joints.shoulderLeft.position, joints.hipLeft.position),
	createBone(joints.shoulderRight.position, joints.hipRight.position),
	createBone(joints.hipLeft.position, joints.kneeLeft.position),
	createBone(joints.hipRight.position, joints.kneeRight.position),
];

// Add bones to skeleton
bones.forEach(bone => skeleton.add(bone));

// Add skeleton to scene
scene.add(skeleton);

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Render loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();