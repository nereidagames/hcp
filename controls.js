/* PLIK: controls.js */

import * as THREE from 'three';

// ============================================================================
// DYNAMICZNY JOYSTICK MOBILNY (Floating Touch Joystick w stylu BlockStarPlanet)
// ============================================================================
export class VirtualJoystick {
  constructor(zoneElement, options = {}) {
    this.zone = zoneElement;
    // Promień wychylenia dopasowany do zmniejszonej o 25% bazy
    this.maxRadius = options.maxRadius || 38;
    this.onMove = options.onMove || null;
    this.onEnd = options.onEnd || null;

    this.activeTouchId = null;
    this.originX = 0;
    this.originY = 0;

    // Usuń ewentualną poprzednią bazę
    const oldBase = this.zone.querySelector('.custom-joystick-base');
    if (oldBase) oldBase.remove();

    this.base = document.createElement('div');
    this.base.className = 'custom-joystick-base';
    this.base.style.display = 'none';

    this.thumb = document.createElement('div');
    this.thumb.className = 'custom-joystick-thumb';

    this.base.appendChild(this.thumb);
    this.zone.appendChild(this.base);

    this.handleTouchStart = this.onTouchStart.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.handleTouchEnd = this.onTouchEnd.bind(this);

    this.zone.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  onTouchStart(e) {
    if (this.activeTouchId !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    this.activeTouchId = touch.identifier;
    this.originX = touch.clientX;
    this.originY = touch.clientY;

    // Środek joysticka pojawia się dokładnie tam, gdzie gracz dotknie ekranu
    this.base.style.left = `${this.originX}px`;
    this.base.style.top = `${this.originY}px`;
    this.base.style.display = 'block';

    this.thumb.style.transform = 'translate(-50%, -50%) translate(0px, 0px)';

    if (e.cancelable) e.preventDefault();
  }

  onTouchMove(e) {
    if (this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        const deltaX = touch.clientX - this.originX;
        const deltaY = touch.clientY - this.originY;
        const distance = Math.hypot(deltaX, deltaY);

        let clampedX = deltaX;
        let clampedY = deltaY;

        if (distance > this.maxRadius && distance > 0) {
          clampedX = (deltaX / distance) * this.maxRadius;
          clampedY = (deltaY / distance) * this.maxRadius;
        }

        // Płynny ruch gałki wewnątrz bazy
        this.thumb.style.transform = `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px)`;

        if (this.onMove) {
          // Normalizacja: X w prawo = +, Y w górę = +
          this.onMove({
            x: clampedX / this.maxRadius,
            y: -clampedY / this.maxRadius
          });
        }

        if (e.cancelable) e.preventDefault();
        break;
      }
    }
  }

  onTouchEnd(e) {
    if (this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        this.activeTouchId = null;
        this.base.style.display = 'none';
        this.thumb.style.transform = 'translate(-50%, -50%) translate(0px, 0px)';

        if (this.onEnd) {
          this.onEnd();
        }
        break;
      }
    }
  }

  destroy() {
    this.zone.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchEnd);
    if (this.base && this.base.parentNode) {
      this.base.parentNode.removeChild(this.base);
    }
    this.activeTouchId = null;
  }
}

// ============================================================================
// KONTROLER POSTACI GRACZA (Player Controller)
// ============================================================================
export class PlayerController {
  constructor(player, collidableObjects, collisionMap, options = {}) {
    this.player = player;
    this.collidableObjects = collidableObjects; 
    this.collisionMap = collisionMap;           
    
    this.moveSpeed = options.moveSpeed || 8;
    this.jumpForce = options.jumpForce || 18;
    this.gravity = options.gravity || 50;
    this.groundRestingY = options.groundRestingY !== undefined ? options.groundRestingY : 0.1;
    this.defaultGroundRestingY = this.groundRestingY;

    // Maksymalna wysokość schodka: dokładnie 1 blok (1.0) z marginesem 0.05
    this.maxStepHeight = options.maxStepHeight || 1.05; 
    this.playerDimensions = options.playerDimensions || new THREE.Vector3(0.5, 1.0, 0.5);

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
    
    // Zoptymalizowana pula obiektów Box3 (Zero-Allocation)
    this.candidateBoxes = [];
    this.boxPool = Array.from({ length: 64 }, () => new THREE.Box3());
    this.boxPoolIndex = 0;
    this.boxUnitSize = new THREE.Vector3(1, 1, 1);

    // Zmienne do testowania schodków
    this.tempMatrix = new THREE.Matrix4();
    this.tempPosition = new THREE.Vector3();
    this.tempBox = new THREE.Box3();

    // Offset wizualny do płynnej animacji wejścia na schodek (Smooth Step-Up)
    this.stepVisualOffset = 0;
    
    this.setupInput();
  }

  getPooledBox() {
    if (this.boxPoolIndex >= this.boxPool.length) {
      this.boxPool.push(new THREE.Box3());
    }
    return this.boxPool[this.boxPoolIndex++];
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'digging') {
      this.velocity.y = 0;
      this.isOnGround = true;
      this.groundRestingY = -200;
      this.playerDimensions.set(0.48, 1.0, 0.48);
    } else {
      this.groundRestingY = this.defaultGroundRestingY;
      this.playerDimensions.set(0.5, 1.0, 0.5);
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
        jumpButton.removeEventListener('touchcancel', this.handleMobileJumpEnd);
        if (this.handleMouseJumpStart) {
            jumpButton.removeEventListener('mousedown', this.handleMouseJumpStart);
            jumpButton.removeEventListener('mouseup', this.handleMouseJumpEnd);
            jumpButton.removeEventListener('mouseleave', this.handleMouseJumpEnd);
        }
        jumpButton.style.backgroundImage = "url('icons/icon-jump.png')";
    }
    if (this.joystick) { 
        this.joystick.destroy(); 
        this.joystick = null; 
    }
  }
  
  jump() {
    if (this.jumpsRemaining > 0) {
        this.velocity.y = this.jumpForce;
        this.jumpsRemaining--;
        this.isOnGround = false;
    }
  }

  reset() {
      if (this.stepVisualOffset !== 0) {
          this.player.position.y -= this.stepVisualOffset;
          this.stepVisualOffset = 0;
      }
      this.keys = {};
      this.velocity.set(0, 0, 0);
      this.joystickDirection.set(0, 0);
      this.enabled = true;
      this.jumpsRemaining = this.maxJumps;
      this.isOnGround = true;
      this.mode = 'explore';
      this.candidateBoxes.length = 0;
      this.boxPoolIndex = 0;
      
      const jumpButton = document.getElementById('jump-button');
      if (jumpButton) {
          jumpButton.style.backgroundImage = "url('icons/icon-jump.png')";
      }

      if (this.joystick) {
          this.joystickDirection.set(0, 0);
      }
  }
  
  update(deltaTime, cameraRotation) {
    // 1. Zawsze przywróć fizyczną pozycję przed wykonaniem obliczeń fizyki
    if (this.stepVisualOffset !== 0) {
        this.player.position.y -= this.stepVisualOffset;
    }

    if (!this.enabled) {
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.stepVisualOffset = 0;
        return;
    }

    const timeStep = Math.min(deltaTime, 0.05);

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

    // 2. Obliczenia fizyki i kolizji
    this.applyMovementAndCollisions(timeStep);

    // 3. Płynna animacja podnoszenia postaci (Smooth Step-Up Decay)
    if (this.stepVisualOffset !== 0) {
        const decay = Math.exp(-18 * timeStep);
        this.stepVisualOffset *= decay;
        
        if (Math.abs(this.stepVisualOffset) < 0.005) {
            this.stepVisualOffset = 0;
        } else {
            this.player.position.y += this.stepVisualOffset;
        }
    }
  }

  getInstanceBoundingBox(mesh, instanceId) {
    mesh.getMatrixAt(instanceId, this.tempMatrix);
    this.tempPosition.setFromMatrixPosition(this.tempMatrix);
    
    return this.tempBox.setFromCenterAndSize(
      this.tempPosition,
      this.boxUnitSize
    );
  }

  applyMovementAndCollisions(deltaTime) {
    const halfHeight = this.playerDimensions.y / 2;
    const halfWidth = this.playerDimensions.x / 2;
    const halfDepth = this.playerDimensions.z / 2;
    const epsilon = 0.001;

    this.candidateBoxes.length = 0;
    this.boxPoolIndex = 0;
    
    for (let i = 0; i < this.collidableObjects.length; i++) {
      const obj = this.collidableObjects[i];
      if (obj.isInstancedMesh) continue;
      
      const box = this.getPooledBox();
      box.setFromObject(obj);
      this.candidateBoxes.push(box);
    }

    if (this.collisionMap && this.collisionMap.size > 0) {
        const playerX = Math.round(this.player.position.x);
        const playerY = Math.round(this.player.position.y);
        const playerZ = Math.round(this.player.position.z);
        
        const rangeH = 1;
        const rangeV_Down = 2;
        const rangeV_Up = 2;
        
        for (let x = playerX - rangeH; x <= playerX + rangeH; x++) {
            for (let z = playerZ - rangeH; z <= playerZ + rangeH; z++) {
                for (let y = playerY - rangeV_Down; y <= playerY + rangeV_Up; y++) {
                    const key = `${x},${y},${z}`;
                    const block = this.collisionMap.get(key);
                    if (block) {
                        if (typeof block === 'object' && block.boundingBox) {
                            this.candidateBoxes.push(block.boundingBox);
                        } else {
                            // Centrowanie bryły kolizji w punkcie (x, y, z)
                            const box = this.getPooledBox();
                            box.min.set(x - 0.5, y - 0.5, z - 0.5);
                            box.max.set(x + 0.5, y + 0.5, z + 0.5);
                            this.candidateBoxes.push(box);
                        }
                    }
                }
            }
        }
    }

    let landedOnBlock = false;
    const numCandidates = this.candidateBoxes.length;

    // ==========================================
    // --- OŚ Y (Ruch pionowy i lądowanie) ---
    // ==========================================
    const verticalMovement = this.velocity.y * deltaTime;
    this.player.position.y += verticalMovement;
    this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

    for (let i = 0; i < numCandidates; i++) {
        const box = this.candidateBoxes[i];

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

    // ==========================================
    // --- OŚ X (Ruch poziomy X + Płynny Autostep 1x1) ---
    // ==========================================
    const horizontalMovementX = this.velocity.x * deltaTime;
    if (Math.abs(horizontalMovementX) > 0.00001) {
        this.player.position.x += horizontalMovementX;
        this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

        let collidedX = false;
        let maxStepNeeded = 0;
        let canStepUp = this.isOnGround && this.velocity.y <= 0.05;
        const feetY = this.player.position.y - halfHeight;

        for (let i = 0; i < numCandidates; i++) {
            const box = this.candidateBoxes[i];
            if (box.max.y <= feetY + epsilon || box.min.y >= this.playerBox.max.y - epsilon) continue;

            if (this.playerBox.intersectsBox(box)) {
                collidedX = true;
                const step = box.max.y - feetY;
                if (step > maxStepNeeded) {
                    maxStepNeeded = step;
                }
            }
        }

        if (collidedX) {
            let stepped = false;

            if (canStepUp && maxStepNeeded > 0.01 && maxStepNeeded <= this.maxStepHeight) {
                const targetY = feetY + maxStepNeeded + halfHeight + epsilon;
                this.tempPosition.set(this.player.position.x, targetY, this.player.position.z);
                this.tempBox.setFromCenterAndSize(this.tempPosition, this.playerDimensions);

                // Sprawdź czy nad schodkiem jest wolna przestrzeń na głowę
                let blockedAbove = false;
                for (let i = 0; i < numCandidates; i++) {
                    if (this.tempBox.intersectsBox(this.candidateBoxes[i])) {
                        blockedAbove = true;
                        break;
                    }
                }

                if (!blockedAbove) {
                    const stepDiff = targetY - this.player.position.y;
                    this.player.position.y = targetY;
                    this.playerBox.copy(this.tempBox);
                    stepped = true;

                    // Płynne uniesienie offsetem wizualnym
                    this.stepVisualOffset -= stepDiff;
                }
            }

            if (!stepped) {
                for (let i = 0; i < numCandidates; i++) {
                    const box = this.candidateBoxes[i];
                    if (box.max.y <= feetY + epsilon || box.min.y >= this.playerBox.max.y - epsilon) continue;

                    if (this.playerBox.intersectsBox(box)) {
                        if (horizontalMovementX > 0) {
                            this.player.position.x = box.min.x - halfWidth - epsilon;
                        } else if (horizontalMovementX < 0) {
                            this.player.position.x = box.max.x + halfWidth + epsilon;
                        }
                        this.velocity.x = 0;
                        this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);
                        break;
                    }
                }
            }
        }
    }

    // ==========================================
    // --- OŚ Z (Ruch poziomy Z + Płynny Autostep 1x1) ---
    // ==========================================
    const horizontalMovementZ = this.velocity.z * deltaTime;
    if (Math.abs(horizontalMovementZ) > 0.00001) {
        this.player.position.z += horizontalMovementZ;
        this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);

        let collidedZ = false;
        let maxStepNeeded = 0;
        let canStepUp = this.isOnGround && this.velocity.y <= 0.05;
        const feetY = this.player.position.y - halfHeight;

        for (let i = 0; i < numCandidates; i++) {
            const box = this.candidateBoxes[i];
            if (box.max.y <= feetY + epsilon || box.min.y >= this.playerBox.max.y - epsilon) continue;

            if (this.playerBox.intersectsBox(box)) {
                collidedZ = true;
                const step = box.max.y - feetY;
                if (step > maxStepNeeded) {
                    maxStepNeeded = step;
                }
            }
        }

        if (collidedZ) {
            let stepped = false;

            if (canStepUp && maxStepNeeded > 0.01 && maxStepNeeded <= this.maxStepHeight) {
                const targetY = feetY + maxStepNeeded + halfHeight + epsilon;
                this.tempPosition.set(this.player.position.x, targetY, this.player.position.z);
                this.tempBox.setFromCenterAndSize(this.tempPosition, this.playerDimensions);

                let blockedAbove = false;
                for (let i = 0; i < numCandidates; i++) {
                    if (this.tempBox.intersectsBox(this.candidateBoxes[i])) {
                        blockedAbove = true;
                        break;
                    }
                }

                if (!blockedAbove) {
                    const stepDiff = targetY - this.player.position.y;
                    this.player.position.y = targetY;
                    this.playerBox.copy(this.tempBox);
                    stepped = true;

                    // Płynne uniesienie offsetem wizualnym
                    this.stepVisualOffset -= stepDiff;
                }
            }

            if (!stepped) {
                for (let i = 0; i < numCandidates; i++) {
                    const box = this.candidateBoxes[i];
                    if (box.max.y <= feetY + epsilon || box.min.y >= this.playerBox.max.y - epsilon) continue;

                    if (this.playerBox.intersectsBox(box)) {
                        if (horizontalMovementZ > 0) {
                            this.player.position.z = box.min.z - halfDepth - epsilon;
                        } else if (horizontalMovementZ < 0) {
                            this.player.position.z = box.max.z + halfDepth + epsilon;
                        }
                        this.velocity.z = 0;
                        this.playerBox.setFromCenterAndSize(this.player.position, this.playerDimensions);
                        break;
                    }
                }
            }
        }
    }

    // Podłoga świata
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
  
  destroy() { 
      if (this.stepVisualOffset !== 0) {
          this.player.position.y -= this.stepVisualOffset;
          this.stepVisualOffset = 0;
      }
      this.cleanupInput(); 
  }

  setupMobileControls() {
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
        this.handleMobileJumpStart = (e) => {
            e.preventDefault();
            jumpButton.style.backgroundImage = "url('icons/icon-jump2.png')";
            
            if (this.enabled && this.canJump && this.mode === 'explore') { 
                this.jump();
                this.canJump = false;
            }
        };

        this.handleMobileJumpEnd = (e) => {
            e.preventDefault();
            jumpButton.style.backgroundImage = "url('icons/icon-jump.png')";
            this.canJump = true;
        };

        jumpButton.addEventListener('touchstart', this.handleMobileJumpStart, { passive: false });
        jumpButton.addEventListener('touchend', this.handleMobileJumpEnd, { passive: false });
        jumpButton.addEventListener('touchcancel', this.handleMobileJumpEnd, { passive: false });

        this.handleMouseJumpStart = () => {
            jumpButton.style.backgroundImage = "url('icons/icon-jump2.png')";
        };
        this.handleMouseJumpEnd = () => {
            jumpButton.style.backgroundImage = "url('icons/icon-jump.png')";
        };

        jumpButton.addEventListener('mousedown', this.handleMouseJumpStart);
        jumpButton.addEventListener('mouseup', this.handleMouseJumpEnd);
        jumpButton.addEventListener('mouseleave', this.handleMouseJumpEnd);
    }

    // Dynamiczny joystick dotykowy (Floating Touch Joystick o promieniu 38px)
    const joystickZone = document.getElementById('joystick-zone');
    if (joystickZone) {
        if (this.joystick) {
            this.joystick.destroy();
            this.joystick = null;
        }

        this.joystick = new VirtualJoystick(joystickZone, {
            maxRadius: 38,
            onMove: (vector) => {
                if (this.enabled) {
                    this.joystickDirection.set(vector.x, vector.y);
                }
            },
            onEnd: () => {
                this.joystickDirection.set(0, 0);
            }
        });
    }
  }
}

// ============================================================================
// KONTROLER KAMERY TRZECIOOSOBOWEJ (Third Person Camera Controller)
// ============================================================================
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

        // Kolizja kamery
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