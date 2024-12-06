import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const humanURL = new URL('human.glb', import.meta.url);

// const sampleData = {
// 	qx: 0.0,
// 	qy: 0.707,
// 	qz: 1.0,
// 	qw: 0.707,
// 	yaw: 0.5, // In radians
// 	pitch: 0.3, // In radians
// 	roll: 0.1, // In radians
//   };


  

  
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(0, 2, 5);
orbit.update();

// const boxGeometry = new THREE.BoxGeometry();
// const boxMaterial = new THREE.MeshStandardMaterial({ color: 'blue' });
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const gui = new dat.GUI();



const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
const previousValues = {
	ThighL: 0,
	ShoulderL: 0,
  };
const params = {
  ShoulderL: 0,
  ThighL: 0,
  ShinL_X: 0,
  ShinL_Y: 0,
  ShinL_Z: 0,
};
const assetLoader = new GLTFLoader();

let loadedModel;
assetLoader.load(
  humanURL.href,
  function (gltf) {
    const model = gltf.scene;
    loadedModel = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);

	

    const updateQuaternion = (objectName, axis, angle) => {
      const joint = model.getObjectByName(objectName);
      if (joint) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(...axis), angle);
        joint.quaternion.multiplyQuaternions(joint.quaternion, quaternion); // Apply incrementally
      }
    };

    gui.add(params, 'ThighL', 0, 2 * Math.PI).onChange(function (value) {
		const delta = value - previousValues.ThighL; // Calculate the change
		updateQuaternion('thighL', [1, 0, 0], delta); // Apply only the difference
		previousValues.ThighL = value; // Update the stored value
	  });
	  

    gui.add(params, 'ShoulderL', 0, 2 * Math.PI).onChange(function (value) {
		const delta = value - previousValues.ShoulderL; // Calculate the change
		updateQuaternion('shoulderL', [0, 1, 0], delta); // Apply only the difference
		previousValues.ShoulderL = value; // Update the stored value
	  });
	  

	  const jointQuaternions = {
		shinL: new THREE.Quaternion(), // Store cumulative quaternion for shinL
	  };
	  
	  // Update the shinL rotation based on X, Y, Z Euler angles directly applied to quaternions
	  const updateShinLQuaternion = () => {
		const joint = model.getObjectByName('shinL');
		if (joint) {
		  // Create a quaternion directly from the axis angles (no Euler angles)
		  const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0).normalize(), params.ShinL_X);
		  joint.applyQuaternion(quaternionX);

		  const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), params.ShinL_Y);
		  joint.applyQuaternion(quaternionY);

		  const quaternionZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1).normalize(), params.ShinL_Z);
		  joint.applyQuaternion(quaternionZ);
		  
		  // Combine the quaternions by multiplying them in order (the order matters)
		  jointQuaternions.shinL.copy(quaternionX).multiply(quaternionY).multiply(quaternionZ);
	  
		  // Apply the combined quaternion to the shinL joint
		  joint.quaternion.copy(jointQuaternions.shinL);
		}
	  };
	  
	  // GUI controls for ShinL
	  gui.add(params, 'ShinL_X', 0, 2 * Math.PI).onChange(updateShinLQuaternion);
	  gui.add(params, 'ShinL_Y', 0, 2 * Math.PI).onChange(updateShinLQuaternion);
	  gui.add(params, 'ShinL_Z', 0, 2 * Math.PI).onChange(updateShinLQuaternion);
	  

  },
  undefined,
  function (error) {
    console.error(error);
  }
);


// const quaternionFolder = gui.addFolder('Quaternion Controls');

// // Add GUI controls for quaternion components
// quaternionFolder.add(sampleData, 'qx', -1, 1).step(0.01).name('QX');
// quaternionFolder.add(sampleData, 'qy', -1, 1).step(0.01).name('QY');
// quaternionFolder.add(sampleData, 'qz', -1, 1).step(0.01).name('QZ');
// quaternionFolder.add(sampleData, 'qw', -1, 1).step(0.01).name('QW');

// quaternionFolder.open();

function animate() {
	if (loadedModel) {
	  // Update shinL using quaternion data from sampleData
	//   const shinL = loadedModel.getObjectByName('shinL');
	//   if (shinL) {
	// 	const quaternion = new THREE.Quaternion(
	// 	  sampleData.qx,
	// 	  sampleData.qy,
	// 	  sampleData.qz,
	// 	  sampleData.qw
	// 	);
	// 	shinL.quaternion.copy(quaternion);
	//   }
  
	  // Animate the forearm
	  const forearmR = loadedModel.getObjectByName('forearmR');
	  if (forearmR) {
		const deltaQuaternion = new THREE.Quaternion();
		deltaQuaternion.setFromAxisAngle(new THREE.Vector3(1, 1, 0), 0.005); // Rotate around Z-axis
		forearmR.quaternion.multiplyQuaternions(forearmR.quaternion, deltaQuaternion);
	  }
	}
  

  
	renderer.render(scene, camera);
  }
  
  renderer.setAnimationLoop(animate);
  
