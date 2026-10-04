/* PLIK: controls.js */

import * as THREE from 'three';
import nipplejs from 'nipplejs';

export class PlayerController {
  constructor(player, collidableObjects, collisionMap, options = {}) {
    this.player = player;
    this.collidableObjects = collidableObjects; 
    this.collisionMap = collisionMap;           
    
    this.moveSpeed = options.moveSpeed || 8;
    this.jumpForce = options.jumpForce || 18;
    this.gravity = options.gravity || 50;
    this.groundRestingY = options.groundRestingY || 0.1;

    this.maxStepHeight = 1.2; 
    this.playerDimensions = new THREE.Vector3(0.6, 1.0, 0.6);

    this.velocity = new THREE.Vector3();
    this.isOnGround = true;
    this.moveDirection = new THREE.Vector3();
    this.forwardVector = new THREE.Vector3();
    this.rightVector = new THREE.Vector3();
    this.cameraAxis = new THREE.Vector3(0, 1, 0);
    
    this.maxJumps = 2;
    this.jumpsRemaining = this.maxJumps;
    
    this.keys = {};
    this.isMobile = false;
    this.canJump = true;
    this.joystickDirection = new THREE.Vector2();
    this.joystick = null;

    this.enabled = true; 
    this.mode = 'explore';

    this.playerBox = new THREE.Box3();
    this.objectBox = new THREE.Box3();
    
    // Dla InstancedMesh
    this.tempMatrix = new THREE.Matrix4();
    this.tempPosition = new THREE.Vector3();
    this.tempBox = new THREE.Box3();
    
    this.setupInput();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'digging') {
      this.velocity.y = 0;
      this.isOnGround = true;
    }
  }

  setIsMobile(isMobile) {
    this.isMobile = isMobile;
    const mobileControls = document.getElementById('mobile-game-controls');
    const joystickZone = document.getElementById('joystick-zone');
    if (mobileControls) mobileControls.style.display = isMobile ? 'block' : 'none';
    if (joystickZone) joystickZone.style.display = isMobile ? 'block' : 'none';
    this.setupInput();
  }

  isTyping() {
      const active = document.activeElement;
      return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  }

  setupInput() {
    this.cleanupInput();
    
    this.handleKeyDown = (e) => {
      if (!this.enabled || this.isTyping()) return;
      this.keys[e.code] = true;
      
      if (e.code === 'Space' && this.canJump && this.mode === 'explore') { 
        this.jump(); 
        this.canJump = false; 
      }
    };
    
    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') { this.canJump = true; }
    };
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    if (this.isMobile) { this.setupMobileControls(); }
  }
  
  cleanupInput() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton && this.handleMobileJumpStart) {
        jumpButton.removeEventListener('touchstart', this.handleMobileJumpStart);
        jumpButton.removeEventListener('touchend', this.handleMobileJumpEnd);
    }
    if (this.joystick) { this.joystick.destroy(); this.joystick = null; }
  }
  
  jump() {
    if (this.jumpsRemaining > 0) {
        this.velocity.y = this.jumpForce;
        this.jumpsRemaining--;
        this.isOnGround = false;
    }
  }

  reset() {
      this.keys = {};
      this.velocity.set(0, 0, 0);
      this.joystickDirection.set(0, 0);
      this.enabled = true;
      this.jumpsRemaining = this.maxJumps;
      this.isOnGround = true;
      this.mode = 'explore';
      
      if (this.joystick) {
          this.joystickDirection.set(0, 0);
      }
  }
  
  update(deltaTime, cameraRotation) {
    if (!this.enabled) {
        this.velocity.x = 0;
        this.velocity.z = 0;
        return;
    }

    const timeStep = Math.min(deltaTime, 0.05);

    // Grawitacja
    if (this.mode === 'explore' && !this.isOnGround) {
      this.velocity.y -= this.gravity * timeStep;
    }

    const moveDirection = this.moveDirection;
    moveDirection.set(0, 0, 0);
    const isTyping = this.isTyping();

    if (!this.isMobile && !isTyping) {
        this.forwardVector.set(0, 0, -1).applyAxisAngle(this.cameraAxis, cameraRotation);
        this.rightVector.set(1, 0, 0).applyAxisAngle(this.cameraAxis, cameraRotation);
        
        if (this.keys['KeyW']) moveDirection.add(this.forwardVector);
        if (this.keys['KeyS']) moveDirection.sub(this.forwardVector);
        if (this.keys['KeyA']) moveDirection.sub(this.rightVector);
        if (this.keys['KeyD']) moveDirection.add(this.rightVector);
    } else if (this.isMobile) {
        moveDirection.set(this.joystickDirection.x, 0, -this.joystickDirection.y);
        moveDirection.applyAxisAngle(this.cameraAxis, cameraRotation);
    }

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      this.player.rotation.y = angle;
    }

    const targetVX = moveDirection.x * this.moveSpeed;
    const targetVZ = moveDirection.z * this.moveSpeed;

    if (this.isOnGround) {
        this.velocity.x = targetVX;
        this.velocity.z = targetVZ;
    } else {
        const hasInput = moveDirection.lengthSq() > 0.001;
        const airControlFactor = hasInput ? (25.0 * timeStep) : (2.0 * timeStep);
        this.velocity.x += (targetVX - this.velocity.x) * airControlFactor;
        this.velocity.z += (targetVZ - this.velocity.z) * airControlFactor;
    }

    this.applyMovementAndCollisions(timeStep);
  }

  // Pomocnicza do obliczania bounding box dla instancji
  getInstanceBoundingBox(mesh, instanceId) {
    mesh.getMatrixAt(instanceId, this.tempMatrix);
    this.tempPosition.setFromMatrixPosition(this.tempMatrix);
    
    return this.tempBox.setFromCenterAndSize(
      this.tempPosition,
      new THREE.Vector3(1, 1, 1)
    );
  }

  applyMovementAndCollisions(deltaTime) {
    const halfHeight = this.playerDimensions.y / 2;
    const halfWidth = this.playerDimensions.x / 2;
    const halfDepth = this.playerDimensions.z / 2;
    const epsilon = 0.001;

    // Zbierz kandydatów do kolizji
    const candidates = [];
    
    // Dodaj zwykłe obiekty (nie-instanced)
    for (let i = 0; i < this.collidableObjects.length; i++) {
      const obj = this.collidableObjects[i];
      
      if (obj.isInstancedMesh) {
        continue; // InstancedMesh obsłużymy przez collisionMap
      } else {
        candidates.push({ type: 'object', object: obj });
      }
    }

    // Dodaj bloki z collisionMap (instancje)
    if (this.collisionMap && this.collisionMap.size > 0) {
        const playerX = Math.floor(this.player.position.x);
        const playerY = Math.floor(this.player.position.y);
        const playerZ = Math.floor(this.player.position.z);
        const rangeH = 2;
        const rangeV_Down = 2;
        const rangeV_Up = 3;
        
        for (let x = playerX - rangeH; x <= playerX + rangeH; x++) {
            for (let z = playerZ - rangeH; z <= playerZ + rangeH; z++) {
                for (let y = playerY - rangeV_Down; y <= playerY + rangeV_Up; y++) {
                    const key = `${x},${y},${z}`;
                    const block = this.collisionMap.get(key);
                    if (block) {
                        if (typeof block === 'object' && block.boundingBox) {
                            candidates.push({ type: 'block', boundingBox: block.boundingBox });
                        } else {
                            const box = new THREE.Box3().setFromCenterAndSize(
                                new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                                new THREE.Vector3(1, 1, 1)
                            );
                            candidates.push({ type: 'block', boundingBox: box });
                        }
                    }
                }
            }
        }
    }

    let landedOnBlock = false;

    // Y Axis
    const verticalMovement = this.velocity.y * deltaTime;
    this.player.position.y += verticalMovement;
    this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

    for (const candidate of candidates) {
        let box;
        if (candidate.type === 'object') {
            this.objectBox.setFromObject(candidate.object);
            box = this.objectBox;
        } else {
            box = candidate.boundingBox;
        }

        if (this.playerBox.intersectsBox(box)) {
            if (verticalMovement < 0) { 
                this.player.position.y = box.max.y + halfHeight;
                this.velocity.y = 0;
                this.isOnGround = true;
                this.jumpsRemaining = this.maxJumps;
                this.canJump = true;
                landedOnBlock = true;
            } else if (verticalMovement > 0) { 
                this.player.position.y = box.min.y - halfHeight - epsilon;
                this.velocity.y = 0;
            }
        }
    }
    
    this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

    // X Axis
    const horizontalMovementX = this.velocity.x * deltaTime;
    this.player.position.x += horizontalMovementX;
    this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

    for (const candidate of candidates) {
        let box;
        if (candidate.type === 'object') {
            this.objectBox.setFromObject(candidate.object);
            box = this.objectBox;
        } else {
            box = candidate.boundingBox;
        }
        
        if (box.max.y < this.playerBox.min.y + epsilon) continue;

        if (this.playerBox.intersectsBox(box)) {
            const obstacleHeight = box.max.y - this.playerBox.min.y;
            if (obstacleHeight > 0.01 && obstacleHeight <= this.maxStepHeight) {
                this.player.position.y += obstacleHeight;
                this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);
                continue; 
            }
            if (horizontalMovementX > 0) this.player.position.x = box.min.x - halfWidth - epsilon;
            else if (horizontalMovementX < 0) this.player.position.x = box.max.x + halfWidth + epsilon;
            this.velocity.x = 0;
            break; 
        }
    }

    // Z Axis
    const horizontalMovementZ = this.velocity.z * deltaTime;
    this.player.position.z += horizontalMovementZ;
    this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

    for (const candidate of candidates) {
        let box;
        if (candidate.type === 'object') {
            this.objectBox.setFromObject(candidate.object);
            box = this.objectBox;
        } else {
            box = candidate.boundingBox;
        }

        if (box.max.y < this.playerBox.min.y + epsilon) continue;

        if (this.playerBox.intersectsBox(box)) {
            const obstacleHeight = box.max.y - this.playerBox.min.y;
            if (obstacleHeight > 0.01 && obstacleHeight <= this.maxStepHeight) {
                this.player.position.y += obstacleHeight;
                this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);
                continue; 
            }
            if (horizontalMovementZ > 0) this.player.position.z = box.min.z - halfDepth - epsilon;
            else if (horizontalMovementZ < 0) this.player.position.z = box.max.z + halfDepth + epsilon;
            this.velocity.z = 0;
            break;
        }
    }

    // Sprawdź podłogę
    if (this.player.position.y <= this.groundRestingY + halfHeight) {
        if (!landedOnBlock) {
            this.player.position.y = this.groundRestingY + halfHeight;
            if (!this.isOnGround) {
                this.velocity.y = 0;
                this.isOnGround = true;
                this.jumpsRemaining = this.maxJumps;
                this.canJump = true;
            }
        }
    } else {
        if (!landedOnBlock) {
            this.isOnGround = false;
        }
    }
  }
  
  destroy() { this.cleanupInput(); }

  setupMobileControls() {
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
        this.handleMobileJumpStart = (e) => {
            e.preventDefault();
            if (this.enabled && this.canJump && this.mode === 'explore') { 
                this.jump();
                this.canJump = false;
            }
        };
        this.handleMobileJumpEnd = (e) => {
            e.preventDefault();
            this.canJump = true;
        };
        jumpButton.addEventListener('touchstart', this.handleMobileJumpStart, { passive: false });
        jumpButton.addEventListener('touchend', this.handleMobileJumpEnd, { passive: false });
    }

    const joystickZone = document.getElementById('joystick-zone');
    if (joystickZone) {
        if (this.joystick) {
            this.joystick.destroy();
            this.joystick = null;
        }

        const options = {
            zone: joystickZone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100,
            dynamicPage: true 
        };
        this.joystick = nipplejs.create(options);
        this.joystick.on('move', (evt, data) => {
            if (this.enabled && data.vector) { 
                this.joystickDirection.set(data.vector.x, data.vector.y);
            }
        });
        this.joystick.on('end', () => {
            this.joystickDirection.set(0, 0);
        });
    }
  }
}

export class ThirdPersonCameraController {
    constructor(camera, target, domElement, collidableObjects, options = {}) {
        this.camera = camera;
        this.target = target;
        this.domElement = domElement;
        
        this.collidableObjects = collidableObjects || [];
        this.raycaster = new THREE.Raycaster();

        this.distance = options.distance || 5;
        this.height = options.height || 2;
        this.rotationSpeed = options.rotationSpeed || 0.005;
        this.rotation = 0;
        this.isDragging = false;
        this.mousePosition = { x: 0, y: 0 };
        this.enabled = true;
        this.pitch = 0.5;
        this.minPitch = -Math.PI / 2 + 0.001;
        this.maxPitch = Math.PI / 2 - 0.001;
        this.floorY = options.floorY || 0;
        this.isMobile = false;
        this.cameraTouchId = null;
        this.targetPosition = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.cameraPosition = new THREE.Vector3();
        this.setupControls();
    }

    setIsMobile(isMobile) {
        this.isMobile = isMobile;
        this.cleanupControls();
        this.setupControls();
    }

    reset() {
        this.enabled = true;
        this.isDragging = false;
        this.cameraTouchId = null;
        this.rotation = 0;
        this.pitch = 0.5;
        this.update(); 
    }

    setupControls() {
        this.handleMouseDown = (e) => {
            if (!this.enabled || e.target.closest('.ui-element') || e.target.closest('.panel-modal') || e.target.closest('#victory-panel') || e.target.closest('#digging-ui-container')) return;
            this.isDragging = true;
            this.mousePosition = { x: e.clientX, y: e.clientY };
        };

        this.handleMouseMove = (e) => {
            if (!this.enabled || !this.isDragging) return;
            const clientX = e.clientX;
            const clientY = e.clientY;
            const deltaX = clientX - this.mousePosition.x;
            const deltaY = clientY - this.mousePosition.y;
            const sensitivity = this.rotationSpeed;
            this.rotation -= deltaX * sensitivity;
            this.pitch += deltaY * sensitivity;
            this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
            this.mousePosition = { x: clientX, y: clientY };
        };

        this.handleMouseUp = () => {
            this.isDragging = false;
        };

        this.handleTouchStart = (e) => {
            if (!this.enabled) return;
            for (const touch of e.changedTouches) {
                if (this.cameraTouchId === null && !touch.target.closest('#joystick-zone') && !touch.target.closest('#jump-button') && !touch.target.closest('.ui-element') && !touch.target.closest('#digging-ui-container')) {
                    this.cameraTouchId = touch.identifier;
                    this.isDragging = true;
                    this.mousePosition = { x: touch.clientX, y: touch.clientY };
                    break;
                }
            }
        };

        this.handleTouchMove = (e) => {
            if (!this.enabled || !this.isDragging) return;
            for (const touch of e.changedTouches) {
                if (touch.identifier === this.cameraTouchId) {
                    const clientX = touch.clientX;
                    const clientY = touch.clientY;
                    const deltaX = clientX - this.mousePosition.x;
                    const deltaY = clientY - this.mousePosition.y;
                    const sensitivity = this.rotationSpeed * 2.5;
                    this.rotation -= deltaX * sensitivity;
                    this.pitch += deltaY * sensitivity;
                    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
                    this.mousePosition = { x: clientX, y: clientY };
                    break;
                }
            }
        };

        this.handleTouchEnd = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === this.cameraTouchId) {
                    this.cameraTouchId = null;
                    this.isDragging = false;
                    break;
                }
            }
        };

        this.domElement.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        this.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    cleanupControls() {
        this.domElement.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        this.domElement.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    update() {
        if (!this.enabled || !this.target) return 0;
        
        let currentDistance = this.distance;
        
        const targetHeight = 1.0; 
        
        const targetPosition = this.targetPosition.set(
            this.target.position.x, 
            this.target.position.y + targetHeight, 
            this.target.position.z
        );
        
        const horizontalDistance = currentDistance * Math.cos(this.pitch);
        const verticalDistance = currentDistance * Math.sin(this.pitch);
        
        const offset = this.offset.set(
            Math.sin(this.rotation) * horizontalDistance, 
            verticalDistance, 
            Math.cos(this.rotation) * horizontalDistance
        );
        
        const idealCameraPosition = this.cameraPosition.copy(targetPosition).add(offset);

        // KOLIZJA KAMERY - pełna, z instancjami
        const direction = this.direction.subVectors(idealCameraPosition, targetPosition).normalize();
        this.raycaster.set(targetPosition, direction);
        this.raycaster.far = currentDistance;
        
        const intersects = this.raycaster.intersectObjects(this.collidableObjects, false);
        
        if (intersects.length > 0) {
            currentDistance = Math.max(0.5, intersects[0].distance - 0.2);
            
            const newH = currentDistance * Math.cos(this.pitch);
            const newV = currentDistance * Math.sin(this.pitch);
            
            offset.set(
                Math.sin(this.rotation) * newH,
                newV,
                Math.cos(this.rotation) * newH
            );
        }

        const cameraFloorClearance = 0.5;
        const finalCameraPos = this.cameraPosition.copy(targetPosition).add(offset);
        
        if (finalCameraPos.y < this.floorY + cameraFloorClearance) {
            const newVerticalDistance = this.floorY + cameraFloorClearance - targetPosition.y;
            if (Math.abs(Math.sin(this.pitch)) > 0.1) {
                 const distForFloor = newVerticalDistance / Math.sin(this.pitch);
                 const hForFloor = distForFloor * Math.cos(this.pitch);
                 
                 offset.set(
                    Math.sin(this.rotation) * hForFloor,
                    newVerticalDistance,
                    Math.cos(this.rotation) * hForFloor
                 );
            }
        }
        
        this.camera.position.copy(targetPosition).add(offset);
        this.camera.lookAt(targetPosition);
        
        return this.rotation;
    }

    destroy() {
        this.cleanupControls();
    }
}