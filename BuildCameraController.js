import * as THREE from 'three';
import { VirtualJoystick } from './controls.js';

export class BuildCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.mode = 'orbital';
    this.target = new THREE.Vector3(0, 0, 0);

    this.distance = 40;
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.rotation.x = -Math.PI / 4; 
    this.rotation.y = Math.PI / 4;
    this.moveSpeed = 25; 
    this.keys = {};

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    
    this.isMobile = false;
    this.enableJoystick = true;
    this.cameraTouchId = null;
    this.joystick = null;
    this.joystickData = { x: 0, y: 0 };

    this._tempMoveDir = new THREE.Vector3();
    this._tempOffset = new THREE.Vector3();
    this._upVector = new THREE.Vector3(0, 1, 0);

    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);

    this.bindTimeout = setTimeout(() => this.bindEvents(), 100);
    this.updateCameraPosition();
  }

  setIsMobile(isMobile, enableJoystick = true) {
      this.isMobile = isMobile;
      this.enableJoystick = enableJoystick;
      
      if (this.isMobile && this.enableJoystick) {
          this.setupJoystick();
      } else {
          if (this.joystick) {
              this.joystick.destroy();
              this.joystick = null;
          }
      }
  }

  setupJoystick() {
      const zone = document.getElementById('build-joystick-zone') || document.getElementById('joystick-zone');
      if (!zone) return;

      if (this.joystick) {
          this.joystick.destroy();
          this.joystick = null;
      }

      this.joystick = new VirtualJoystick(zone, {
          maxRadius: 48,
          fixed: true,
          onMove: (vector) => {
              this.joystickData.x = vector.x;
              this.joystickData.y = vector.y;
          },
          onEnd: () => {
              this.joystickData.x = 0;
              this.joystickData.y = 0;
          }
      });
  }

  bindEvents() {
    this.handleMouseDown = (e) => {
        const isZone = e.target.closest('#build-rotate-zone');
        const isUI = e.target.closest('.build-ui-button') || 
                     e.target.closest('.panel-list') || 
                     e.target.closest('.build-sidebar-right') || 
                     e.target.closest('.build-top-left') || 
                     e.target.closest('.build-bottom-bar') ||
                     e.target.closest('#tools-modal') ||
                     e.target.closest('#joystick-zone');

        if (isZone) {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        } else if (!isUI) {
            if (e.button === 1 || e.button === 2) {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        }
    };

    this.handleMouseMove = (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        this.applyRotation(deltaX, deltaY, 1);
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    this.handleMouseUp = () => { this.isDragging = false; };

    this.handleTouchStart = (e) => {
        if (this.cameraTouchId !== null) return; 

        for (const touch of e.changedTouches) {
            const target = touch.target;
            if (target.closest('#build-rotate-zone')) {
                this.cameraTouchId = touch.identifier;
                this.isDragging = true;
                this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
                if (e.cancelable) e.preventDefault();
                break;
            }
        }
    };

    this.handleTouchMove = (e) => {
        if (!this.isDragging) return;
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.cameraTouchId) {
                const deltaX = touch.clientX - this.previousMousePosition.x;
                const deltaY = touch.clientY - this.previousMousePosition.y;
                this.applyRotation(deltaX, deltaY, 2.0); 
                this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
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

    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: false });

    window.addEventListener('keydown', this.boundOnKeyDown);
    window.addEventListener('keyup', this.boundOnKeyUp);
  }

  applyRotation(deltaX, deltaY, sensitivityMultiplier) {
      const sens = 0.003 * sensitivityMultiplier;
      this.rotation.y -= deltaX * sens;
      this.rotation.x -= deltaY * sens;
      const limit = Math.PI / 2 - 0.05;
      this.rotation.x = Math.max(-limit, Math.min(limit, this.rotation.x));
  }
  
  destroy() {
    if (this.bindTimeout) {
        clearTimeout(this.bindTimeout);
    }

    if (this.handleMouseDown) {
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    if (this.handleTouchStart) {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    window.removeEventListener('keydown', this.boundOnKeyDown);
    window.removeEventListener('keyup', this.boundOnKeyUp);
    
    if (this.joystick) {
        this.joystick.destroy();
        this.joystick = null;
    }
  }
  
  onKeyDown(event) { this.keys[event.code] = true; }
  onKeyUp(event) { this.keys[event.code] = false; }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode === 'free') this.rotation.x = 0; 
  }

  updateCameraPosition() {
    if (this.mode === 'orbital') {
      this._tempOffset.set(0, 0, this.distance);
      this._tempOffset.applyEuler(this.rotation);
      this.camera.position.copy(this.target).add(this._tempOffset);
      this.camera.lookAt(this.target);
    } else if (this.mode === 'free') {
      this.camera.quaternion.setFromEuler(this.rotation);
    }
  }

  update(deltaTime) {
    this._tempMoveDir.set(0, 0, 0);
    let hasInput = false;

    if (this.isMobile && (Math.abs(this.joystickData.x) > 0.01 || Math.abs(this.joystickData.y) > 0.01)) {
        this._tempMoveDir.z = -this.joystickData.y; 
        this._tempMoveDir.x = this.joystickData.x;
        hasInput = true;
    }

    if (!this.isMobile) {
        if (this.keys['KeyW']) { this._tempMoveDir.z = -1; hasInput = true; }
        if (this.keys['KeyS']) { this._tempMoveDir.z = 1; hasInput = true; }
        if (this.keys['KeyA']) { this._tempMoveDir.x = -1; hasInput = true; }
        if (this.keys['KeyD']) { this._tempMoveDir.x = 1; hasInput = true; }
        if (this.mode === 'free') {
            if (this.keys['Space']) this.camera.position.y += this.moveSpeed * deltaTime;
            if (this.keys['ShiftLeft']) this.camera.position.y -= this.moveSpeed * deltaTime;
        }
    }

    if (hasInput) {
        if (this._tempMoveDir.lengthSq() > 1) this._tempMoveDir.normalize();

        const yRotation = this.rotation.y;
        this._tempMoveDir.applyAxisAngle(this._upVector, yRotation);

        this._tempMoveDir.multiplyScalar(this.moveSpeed * deltaTime);

        if (this.mode === 'free') {
            this.camera.position.add(this._tempMoveDir);
        } else {
            this.target.add(this._tempMoveDir);
        }
    }
    
    this.updateCameraPosition();
  }
}