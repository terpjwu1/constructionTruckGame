import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Enhanced Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3b7334, // Grass green
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Roads
const createRoad = (startX, startZ, width, length, isVertical = false) => {
    const roadGeometry = new THREE.PlaneGeometry(width, length);
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(startX, 0.01, startZ); // Slightly above ground to prevent z-fighting
    if (!isVertical) {
        road.rotation.z = Math.PI / 2;
    }
    road.receiveShadow = true;
    scene.add(road);

    // Add white lines
    const lineGeometry = new THREE.PlaneGeometry(0.3, length);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.set(startX, 0.02, startZ);
    if (!isVertical) {
        line.rotation.z = Math.PI / 2;
    }
    line.receiveShadow = true;
    scene.add(line);
};

// Create road network
createRoad(0, 0, 10, 200, true); // Main vertical road
createRoad(0, 0, 10, 200, false); // Main horizontal road
createRoad(-50, 0, 10, 100, false); // Left horizontal road
createRoad(50, 0, 10, 100, false); // Right horizontal road
createRoad(0, -50, 10, 100, true); // Bottom vertical road
createRoad(0, 50, 10, 100, true); // Top vertical road
createRoad(-25, -25, 10, 50, true); // Additional vertical road
createRoad(25, 25, 10, 50, true); // Additional vertical road
createRoad(-25, -25, 10, 50, false); // Additional horizontal road
createRoad(25, 25, 10, 50, false); // Additional horizontal road

// Excavator group
const excavatorGroup = new THREE.Group();
scene.add(excavatorGroup);

// Base (tracks) with wheels
const trackGeometry = new THREE.BoxGeometry(8, 1, 12);
const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const tracks = new THREE.Mesh(trackGeometry, trackMaterial);
tracks.position.y = 0.5;
tracks.castShadow = true;
excavatorGroup.add(tracks);

// Add wheels to tracks
const wheelRadius = 0.56;
const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 7, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const wheelPositions = [
    [-4, wheelRadius, 0],
    [4, wheelRadius, 0],
    [-4, wheelRadius, 4],
    [4, wheelRadius, 4],
    [-4, wheelRadius, -4],
    [4, wheelRadius, -4],
];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...pos);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    tracks.add(wheel);
});

// Add connecting block between tracks and body
const baseConnectorGeometry = new THREE.BoxGeometry(7, 2, 10);
const baseConnectorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a,
    metalness: 0.6,
    roughness: 0.4
});
const baseConnector = new THREE.Mesh(baseConnectorGeometry, baseConnectorMaterial);
baseConnector.position.y = 2;
baseConnector.castShadow = true;
excavatorGroup.add(baseConnector);

// Body
const bodyGeometry = new THREE.BoxGeometry(6, 4, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDB58 });
const excavatorBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
excavatorBody.position.y = 5;
excavatorBody.castShadow = true;
excavatorGroup.add(excavatorBody);

// Cabin
const cabinGeometry = new THREE.BoxGeometry(4, 3, 4);
const cabinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.2
});
const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
cabin.position.set(0, 5, 1);
cabin.castShadow = true;
excavatorBody.add(cabin);

// Add cabin windows
const windowGeometry = new THREE.PlaneGeometry(3, 2);
const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    metalness: 0.9,
    roughness: 0.1
});
const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
frontWindow.position.set(0, 0, -2.01);
frontWindow.rotation.y = Math.PI;
cabin.add(frontWindow);

// Boom arm group
const boomGroup = new THREE.Group();
boomGroup.position.set(0, 4, -2);
excavatorBody.add(boomGroup);

// Main boom
const boomGeometry = new THREE.BoxGeometry(1, 1, 12);
const boomMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDB58 });
const boom = new THREE.Mesh(boomGeometry, boomMaterial);
boom.position.z = -6;
boom.rotation.x = 0;
boom.castShadow = true;
boomGroup.add(boom);

// Hydraulic cylinder for boom
const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const boomCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
boomCylinder.position.set(0, 1, -4);
boomCylinder.rotation.x = 0;
boomGroup.add(boomCylinder);

// Stick
const stickGeometry = new THREE.BoxGeometry(0.8, 0.8, 8);
const stick = new THREE.Mesh(stickGeometry, boomMaterial);
stick.position.set(0, 0, -6);
stick.rotation.x = 0;
stick.castShadow = true;
boom.add(stick);

// Add bucket
const bucketGroup = new THREE.Group();
stick.add(bucketGroup);
bucketGroup.position.set(0, 0, -4);

// Bucket base
const bucketBaseGeometry = new THREE.BoxGeometry(2.4, 1.6, 0.8);
const bucketMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFDB58,
    metalness: 0.6,
    roughness: 0.4
});
const bucketBase = new THREE.Mesh(bucketBaseGeometry, bucketMaterial);
bucketBase.rotation.x = 0;
bucketBase.castShadow = true;
bucketGroup.add(bucketBase);

// Bucket front
const bucketFrontGeometry = new THREE.BoxGeometry(2.4, 2.4, 0.2);
const bucketFront = new THREE.Mesh(bucketFrontGeometry, bucketMaterial);
bucketFront.position.set(0, -1.2, 0.3);
bucketFront.rotation.x = -Math.PI / 2;
bucketFront.castShadow = true;
bucketBase.add(bucketFront);

// Bucket sides
const bucketSideGeometry = new THREE.BoxGeometry(0.2, 2.4, 1.2);
const bucketSideLeft = new THREE.Mesh(bucketSideGeometry, bucketMaterial);
bucketSideLeft.position.set(1.2, -0.4, 0);
bucketSideLeft.castShadow = true;
bucketBase.add(bucketSideLeft);

const bucketSideRight = new THREE.Mesh(bucketSideGeometry, bucketMaterial);
bucketSideRight.position.set(-1.2, -0.4, 0);
bucketSideRight.castShadow = true;
bucketBase.add(bucketSideRight);

// Bucket teeth
const teethPositions = [-0.8, -0.4, 0, 0.4, 0.8];
teethPositions.forEach(x => {
    const toothGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const tooth = new THREE.Mesh(toothGeometry, bucketMaterial);
    tooth.position.set(x, -2.4, 0);
    tooth.castShadow = true;
    bucketFront.add(tooth);
});

// Add magnet
const magnetGroup = new THREE.Group();
stick.add(magnetGroup);
magnetGroup.position.set(0, 0, -4);

// Magnet head
const magnetHeadGeometry = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 32);
const magnetMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.8,
    roughness: 0.2
});
const magnetHead = new THREE.Mesh(magnetHeadGeometry, magnetMaterial);
magnetHead.rotation.x = Math.PI / 2;
magnetHead.castShadow = true;
magnetGroup.add(magnetHead);

// Magnet connection
const magnetConnectorGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
const magnetConnector = new THREE.Mesh(magnetConnectorGeometry, magnetMaterial);
magnetConnector.position.y = 0.6;
magnetConnector.castShadow = true;
magnetHead.add(magnetConnector);

// Initially hide magnet
magnetGroup.visible = false;

// Dump Truck (positioned on the road)
const dumpTruckGroup = new THREE.Group();
scene.add(dumpTruckGroup);
dumpTruckGroup.position.set(10, 0, 0); // Position along the road

// Dump truck body
const dumpTruckBaseGeometry = new THREE.BoxGeometry(3, 1, 6);
const dumpTruckMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2E8B57,
    metalness: 0.6,
    roughness: 0.4
});
const dumpTruckBase = new THREE.Mesh(dumpTruckBaseGeometry, dumpTruckMaterial);
dumpTruckBase.position.y = 0.5;
dumpTruckBase.castShadow = true;
dumpTruckGroup.add(dumpTruckBase);

// Dump truck container
const containerGeometry = new THREE.BoxGeometry(3, 2, 4);
const container = new THREE.Mesh(containerGeometry, dumpTruckMaterial);
container.position.set(0, 2, -0.5);
container.castShadow = true;
dumpTruckGroup.add(container);

// Truck cabin with details
const truckCabinGeometry = new THREE.BoxGeometry(3, 2, 2);
const truckCabin = new THREE.Mesh(truckCabinGeometry, dumpTruckMaterial);
truckCabin.position.set(0, 1.5, 2);
truckCabin.castShadow = true;
dumpTruckGroup.add(truckCabin);

// Truck windows
const truckWindowGeometry = new THREE.PlaneGeometry(2, 1);
const frontTruckWindow = new THREE.Mesh(truckWindowGeometry, windowMaterial);
frontTruckWindow.position.set(0, 0.5, 1.01);
truckCabin.add(frontTruckWindow);

// Camera setup
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground

// Game state
const gameState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    rotateLeft: false,
    rotateRight: false,
    boomUp: false,
    boomDown: false,
    stickIn: false,
    stickOut: false,
    speed: 0.15,
    rotationSpeed: 0.03,
    boomAngle: 0,
    stickAngle: 0,
    boomSpeed: 0.02,
    stickSpeed: 0.02,
    attachmentMode: 'bucket', // 'bucket', 'magnet', 'wreckingBall'
    attachedCar: null,
    magnetRange: 5
};

// Input handling
window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'arrowup': gameState.moveForward = true; break;
        case 'arrowdown': gameState.moveBackward = true; break;
        case 'arrowleft': gameState.rotateLeft = true; break;
        case 'arrowright': gameState.rotateRight = true; break;
        case 'w': gameState.boomUp = true; break;
        case 's': gameState.boomDown = true; break;
        case 'a': gameState.stickOut = true; break;
        case 'd': gameState.stickIn = true; break;
        case ' ': // Spacebar to toggle magnet attraction
            if (gameState.attachmentMode === 'magnet') {
                if (gameState.attachedCar) {
                    releaseCarInBin();
                } else {
                    // Try to attract nearby car
                    const magnetPosition = new THREE.Vector3();
                    magnetHead.getWorldPosition(magnetPosition);
                    let closestCar = null;
                    let closestDistance = Infinity;
                    rustyCars.forEach(car => {
                        const carPosition = new THREE.Vector3();
                        car.getWorldPosition(carPosition);
                        const distance = carPosition.distanceTo(magnetPosition);
                        if (distance < gameState.magnetRange && distance < closestDistance) {
                            closestCar = car;
                            closestDistance = distance;
                        }
                    });
                    if (closestCar) {
                        gameState.attachedCar = closestCar;
                        closestCar.position.y = 2;
                    }
                }
            }
            break;
        case 't': // Cycle attachment mode
            if (gameState.attachmentMode === 'bucket') {
                gameState.attachmentMode = 'magnet';
            } else if (gameState.attachmentMode === 'magnet') {
                gameState.attachmentMode = 'wreckingBall';
                if (gameState.attachedCar) releaseCarInBin();
            } else {
                gameState.attachmentMode = 'bucket';
                if (gameState.attachedCar) releaseCarInBin();
            }
            updateAttachmentVisibility();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'arrowup': gameState.moveForward = false; break;
        case 'arrowdown': gameState.moveBackward = false; break;
        case 'arrowleft': gameState.rotateLeft = false; break;
        case 'arrowright': gameState.rotateRight = false; break;
        case 'w': gameState.boomUp = false; break;
        case 's': gameState.boomDown = false; break;
        case 'a': gameState.stickOut = false; break;
        case 'd': gameState.stickIn = false; break;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to check if a car is near the garbage bin
function isNearBin(carPosition) {
    const binPosition = garbageBinGroup.position;
    const distance = carPosition.distanceTo(binPosition);
    return distance < 5; // Consider 5 units as "near" the bin
}

// Function to release car into bin
function releaseCarInBin() {
    if (!gameState.attachedCar) return;

    const carPosition = new THREE.Vector3();
    gameState.attachedCar.getWorldPosition(carPosition);

    if (isNearBin(carPosition)) {
        // Remove the car if it's near the bin
        scene.remove(gameState.attachedCar);
        const index = rustyCars.indexOf(gameState.attachedCar);
        if (index > -1) {
            rustyCars.splice(index, 1);
        }
    } else {
        // Just detach the car if not near bin
        gameState.attachedCar.position.y = 0.5; // Reset height to ground
    }
    
    gameState.attachedCar = null;
}

// --- Chain setup ---
const chainLinks = [];
const numLinks = 10;
const linkLength = 0.5 * 2; // Scaled for large excavator
const chainGroup = new THREE.Group();
stick.add(chainGroup);
chainGroup.position.set(0, 0, -4); // End of stick

for (let i = 0; i < numLinks; i++) {
  const link = new THREE.Mesh(
    new THREE.SphereGeometry(0.15 * 2, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 })
  );
  link.castShadow = true;
  link.position.set(0, -i * linkLength, 0);
  chainGroup.add(link);
  chainLinks.push({ mesh: link, pos: link.position.clone(), prev: link.position.clone() });
}

// --- Wrecking ball setup ---
const wreckingBall = new THREE.Mesh(
  new THREE.SphereGeometry(1.2 * 2, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.3 })
);
wreckingBall.castShadow = true;
scene.add(wreckingBall);

// --- Chain physics update ---
function updateChainPhysics() {
  // Get world positions for stick end
  const stickEnd = new THREE.Vector3();
  chainGroup.getWorldPosition(stickEnd);

  // 1. Set first link position
  chainLinks[0].pos.copy(stickEnd);

  // 2. Verlet integration for inner links
  for (let i = 1; i < numLinks; i++) {
    const link = chainLinks[i];
    const temp = link.pos.clone();
    link.pos.add(link.pos.clone().sub(link.prev));
    link.pos.y -= 0.15; // gravity
    link.prev.copy(temp);
  }

  // 3. Constrain links to fixed length
  for (let k = 0; k < 3; k++) { // iterate for stability
    for (let i = 0; i < numLinks - 1; i++) {
      const a = chainLinks[i];
      const b = chainLinks[i + 1];
      const delta = b.pos.clone().sub(a.pos);
      const dist = delta.length();
      const diff = (dist - linkLength) / dist;
      if (i !== 0) a.pos.add(delta.clone().multiplyScalar(0.5 * diff));
      if (i !== numLinks - 1) b.pos.sub(delta.clone().multiplyScalar(0.5 * diff));
    }
  }

  // 4. Update mesh positions
  for (let i = 0; i < numLinks; i++) {
    chainLinks[i].mesh.position.copy(chainLinks[i].pos);
    chainGroup.worldToLocal(chainLinks[i].mesh.position);
  }

  // 5. Position the wrecking ball at the end of the chain
  wreckingBall.position.copy(chainLinks[numLinks - 1].pos);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Get the excavator's forward direction
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(excavatorGroup.quaternion);

    // Update excavator position and rotation
    if (gameState.moveForward) {
        excavatorGroup.position.add(forward.multiplyScalar(gameState.speed));
    }
    if (gameState.moveBackward) {
        excavatorGroup.position.add(forward.multiplyScalar(-gameState.speed));
    }
    if (gameState.rotateLeft) excavatorGroup.rotation.y += gameState.rotationSpeed;
    if (gameState.rotateRight) excavatorGroup.rotation.y -= gameState.rotationSpeed;

    // Update boom movement
    if (gameState.boomUp && gameState.boomAngle > -Math.PI / 3) {
        gameState.boomAngle -= gameState.boomSpeed;
        boom.rotation.x = gameState.boomAngle;
        boomCylinder.rotation.x = gameState.boomAngle;
    }
    if (gameState.boomDown && gameState.boomAngle < Math.PI / 4) {
        gameState.boomAngle += gameState.boomSpeed;
        boom.rotation.x = gameState.boomAngle;
        boomCylinder.rotation.x = gameState.boomAngle;
    }

    // Update stick movement
    if (gameState.stickOut && gameState.stickAngle > -Math.PI / 2) {
        gameState.stickAngle -= gameState.stickSpeed;
        stick.rotation.x = gameState.stickAngle;
    }
    if (gameState.stickIn && gameState.stickAngle < Math.PI / 4) {
        gameState.stickAngle += gameState.stickSpeed;
        stick.rotation.x = gameState.stickAngle;
    }

    // Update attached car position (only in magnet mode)
    if (gameState.attachmentMode === 'magnet' && gameState.attachedCar) {
        const magnetPosition = new THREE.Vector3();
        magnetHead.getWorldPosition(magnetPosition);
        gameState.attachedCar.position.copy(magnetPosition);
        gameState.attachedCar.position.y -= 2;
    }

    // Update chain physics and wrecking ball visibility
    if (gameState.attachmentMode === 'wreckingBall') {
        chainGroup.visible = true;
        wreckingBall.visible = true;
        updateChainPhysics();
    } else {
        chainGroup.visible = false;
        wreckingBall.visible = false;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Set initial attachment visibility
updateAttachmentVisibility();

// Add rusty cars
function createRustyCar(x, z) {
    const carGroup = new THREE.Group();
    scene.add(carGroup);
    carGroup.position.set(x, 0.5, z);

    // Car body
    const carBodyGeometry = new THREE.BoxGeometry(2, 1.5, 4);
    const carMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });
    const carBody = new THREE.Mesh(carBodyGeometry, carMaterial);
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(2, 1, 2);
    const roof = new THREE.Mesh(roofGeometry, carMaterial);
    roof.position.set(0, 1.25, 0.5);
    roof.castShadow = true;
    carGroup.add(roof);

    // Add wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wheelPositions = [
        [-1, -0.5, -1],
        [1, -0.5, -1],
        [-1, -0.5, 1],
        [1, -0.5, 1]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        carGroup.add(wheel);
    });

    return carGroup;
}

// Create several rusty cars
const rustyCars = [
    createRustyCar(-20, 20),
    createRustyCar(20, -20),
    createRustyCar(-30, -30),
    createRustyCar(30, 30)
];

// Add garbage bin
const garbageBinGroup = new THREE.Group();
scene.add(garbageBinGroup);
garbageBinGroup.position.set(-40, 0, 0);

const binBaseGeometry = new THREE.BoxGeometry(6, 8, 6);
const binMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2E8B57,
    metalness: 0.4,
    roughness: 0.6
});
const binBase = new THREE.Mesh(binBaseGeometry, binMaterial);
binBase.position.y = 4;
binBase.castShadow = true;
garbageBinGroup.add(binBase);

// Bin lid
const binLidGeometry = new THREE.BoxGeometry(6.4, 0.5, 6.4);
const binLid = new THREE.Mesh(binLidGeometry, binMaterial);
binLid.position.y = 8.25;
binLid.castShadow = true;
garbageBinGroup.add(binLid);

function updateAttachmentVisibility() {
    bucketGroup.visible = (gameState.attachmentMode === 'bucket');
    magnetGroup.visible = (gameState.attachmentMode === 'magnet');
    chainGroup.visible = wreckingBall.visible = (gameState.attachmentMode === 'wreckingBall');
}

animate();

// --- Tree creation function ---
function createTree(x, z) {
    const tree = new THREE.Group();
    // Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5 * 2, 0.5 * 2, 5 * 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
    );
    trunk.position.y = 5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    // Foliage
    const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(2 * 2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x228B22 })
    );
    foliage.position.y = 12;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);
    tree.position.set(x, 0, z);
    scene.add(tree);
}

// --- Add random trees ---
const treeCount = 20;
const minDist = 40; // Avoid center 40x40 area
for (let i = 0; i < treeCount; i++) {
    let x, z;
    do {
        x = Math.floor(Math.random() * 160) - 80;
        z = Math.floor(Math.random() * 160) - 80;
    } while (Math.abs(x) < minDist && Math.abs(z) < minDist);
    createTree(x, z);
}

// --- Stop sign creation function ---
function createStopSign(x, z, rotation = 0) {
    const signGroup = new THREE.Group();
    // Pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * 2, 0.15 * 2, 6 * 2, 12),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    pole.position.y = 6;
    signGroup.add(pole);
    // Octagonal sign
    const sign = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2 * 2, 1.2 * 2, 0.3 * 2, 8),
        new THREE.MeshStandardMaterial({ color: 0xff2222 })
    );
    sign.position.y = 12.4;
    sign.rotation.x = Math.PI / 2;
    signGroup.add(sign);
    // Position and rotate
    signGroup.position.set(x, 0, z);
    signGroup.rotation.y = rotation;
    scene.add(signGroup);
}

// --- Road intersection coordinates (example grid) ---
const intersections = [
    [-20, -20], [0, -20], [20, -20],
    [-20, 0],  [0, 0],  [20, 0],
    [-20, 20], [0, 20], [20, 20]
];

// --- Randomly select intersections for stop signs ---
const stopSignCount = Math.floor(Math.random() * 5) + 4; // 4-8 stop signs
const used = new Set();
for (let i = 0; i < stopSignCount; i++) {
    let idx;
    do {
        idx = Math.floor(Math.random() * intersections.length);
    } while (used.has(idx));
    used.add(idx);
    const [x, z] = intersections[idx];
    // Place sign slightly off the intersection, facing in
    createStopSign(x + 6, z - 6, Math.PI / 4);
}

// --- Background music placeholder ---
// To use: place a file named 'background.mp3' in your public or assets folder
const listener = new THREE.AudioListener();
camera.add(listener);
const bgMusic = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('background.mp3', function(buffer) {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.3);
    bgMusic.play();
});

// --- Basketball court creation function ---
function createBasketballCourt(x, z) {
    // Court surface
    const court = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 10),
        new THREE.MeshStandardMaterial({ color: 0xd2691e })
    );
    court.rotation.x = -Math.PI / 2;
    court.position.set(x, 0.02, z);
    court.receiveShadow = true;
    scene.add(court);

    // Center circle
    const centerCircle = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 1.7, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(x, 0.03, z);
    scene.add(centerCircle);

    // Basketball at center
    const basketball = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xFF8C00 })
    );
    basketball.position.set(x, 0.5, z);
    basketball.castShadow = true;
    scene.add(basketball);

    // Hoops (one at each end, facing each other)
    for (let dx of [-9, 9]) {
        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 4, 12),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        pole.position.set(x + dx, 2, z);
        scene.add(pole);
        // Backboard
        const backboard = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        backboard.position.set(x + dx, 4, z - 0.7 * Math.sign(dx));
        backboard.rotation.y = dx > 0 ? Math.PI : 0;
        scene.add(backboard);
        // Rim
        const rim = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.07, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0xffa500 })
        );
        rim.position.set(x + dx, 3.5, z - 1.1 * Math.sign(dx));
        rim.rotation.x = Math.PI / 2;
        rim.rotation.y = dx > 0 ? Math.PI : 0;
        scene.add(rim);
    }
}

// --- Add basketball court at (60, 0, 60) ---
createBasketballCourt(60, 60);

// --- Swing creation function ---
function addSwingToTree(tree) {
    // Ropes
    const leftRope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05 * 2, 0.05 * 2, 3 * 2, 8),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    leftRope.position.set(-1, 10.5, 1.4);
    // Right rope
    const rightRope = leftRope.clone();
    rightRope.position.x = 1;
    // Seat
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1.2 * 2, 0.2 * 2, 0.4 * 2),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    seat.position.set(0, 9, 1.4);
    tree.add(leftRope, rightRope, seat);
}

// --- Add swing to the first tree created ---
if (scene.children) {
    // Find the first tree group (created by createTree)
    const firstTree = scene.children.find(obj => obj.type === 'Group' && obj.children.length >= 2 && obj.children[0].geometry && obj.children[0].geometry.type === 'CylinderGeometry');
    if (firstTree) {
        addSwingToTree(firstTree);
    }
}

// --- Double-click to zoom functionality ---
renderer.domElement.addEventListener('dblclick', onDoubleClick, false);

function onDoubleClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    // Intersect with ground and all visible meshes
    const objects = [ground];
    scene.traverse(obj => {
        if (obj.isMesh && obj.visible && obj !== ground) objects.push(obj);
    });
    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        smoothZoomTo(point);
    }
}

let zoomLerp = null;
function smoothZoomTo(targetPoint) {
    // Start lerping controls.target and camera position
    const startTarget = controls.target.clone();
    const startPos = camera.position.clone();
    // Direction from camera to target
    const camToTarget = controls.target.clone().sub(camera.position);
    // New camera position: keep same offset from new target, but clamp distance
    let newTarget = targetPoint.clone();
    let newCamPos = newTarget.clone().sub(camToTarget);
    // Clamp camera height
    newCamPos.y = Math.max(newCamPos.y, 5);
    // Clamp distance (min 10, max 60)
    const dist = newTarget.distanceTo(newCamPos);
    if (dist < 10) {
        newCamPos = newTarget.clone().add(startPos.clone().sub(startTarget).setLength(10));
    } else if (dist > 60) {
        newCamPos = newTarget.clone().add(startPos.clone().sub(startTarget).setLength(60));
    }
    let t = 0;
    zoomLerp = function animateZoom() {
        t += 0.06;
        controls.target.lerpVectors(startTarget, newTarget, t);
        camera.position.lerpVectors(startPos, newCamPos, t);
        if (t < 1) {
            requestAnimationFrame(zoomLerp);
        } else {
            controls.target.copy(newTarget);
            camera.position.copy(newCamPos);
            zoomLerp = null;
        }
    };
    zoomLerp();
} 