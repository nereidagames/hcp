import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const sharedLegGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
const sharedBootGeometry = new THREE.BoxGeometry(0.25, 0.2, 0.3);
const sharedLegMaterial = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
const sharedBootMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

export function createBaseCharacter(parentContainer) {
    const legSeparation = 0.15;
    const verticalOffset = -0.5; 
    const bootHeight = 0.2;
    const legHeight = 0.8;

    const bootCenterY = (bootHeight / 2) + verticalOffset;
    const legCenterY = (bootHeight + legHeight / 2) + verticalOffset;

    const leftLeg = new THREE.Mesh(sharedLegGeometry, sharedLegMaterial);
    leftLeg.position.set(-legSeparation, legCenterY, 0);
    parentContainer.add(leftLeg);

    const leftBoot = new THREE.Mesh(sharedBootGeometry, sharedBootMaterial);
    leftBoot.position.set(-legSeparation, bootCenterY, 0.025);
    parentContainer.add(leftBoot);

    const rightLeg = new THREE.Mesh(sharedLegGeometry, sharedLegMaterial);
    rightLeg.position.set(legSeparation, legCenterY, 0);
    parentContainer.add(rightLeg);

    const rightBoot = new THREE.Mesh(sharedBootGeometry, sharedBootMaterial);
    rightBoot.position.set(legSeparation, bootCenterY, 0.025);
    parentContainer.add(rightBoot);
}

export class CharacterManager {
  constructor(scene) {
    this.scene = scene;
    this.character = null;
    this.shadow = null;
    this.skinContainer = new THREE.Group();
    this.textureLoader = new THREE.TextureLoader();
    this.materialsCache = {};
    this.tempCenter = new THREE.Vector3();
    this.sharedBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.skinMeshCache = {};
    this.lastVisibilityState = true;
  }
  
  loadCharacter() {
    if (this.character) {
        if (this.character.chatBubble) {
            if (this.character.chatBubble.element && this.character.chatBubble.element.parentNode) {
                this.character.chatBubble.element.parentNode.removeChild(this.character.chatBubble.element);
            }
            this.character.chatBubble = null;
        }
        this.clearSkinContainer();
        this.scene.remove(this.character);
        this.character = null;
    }

    this.character = new THREE.Group();
    createBaseCharacter(this.character);
    
    this.skinContainer.scale.setScalar(0.125);
    this.skinContainer.position.y = 0.5; 
    
    this.character.add(this.skinContainer);
    
    this.character.position.set(0, 5, 0); 
    this.scene.add(this.character);
    this.setupShadow();
  }

  clearSkinContainer() {
    while (this.skinContainer.children.length > 0) {
        const child = this.skinContainer.children[0];
        if (child.geometry && child.geometry !== this.sharedBoxGeometry) {
            child.geometry.dispose();
        }
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => {
                    if (m !== this.materialsCache[m.userData?.texturePath]) {
                        m.dispose();
                    }
                });
            }
        }
        this.skinContainer.remove(child);
    }
  }
  
  applySkin(skinData) {
    this.clearSkinContainer();

    if (!skinData || !Array.isArray(skinData) || skinData.length === 0) {
        return;
    }
    
    const blocksByTexture = {};
    skinData.forEach(blockData => {
        if (!blockData.texturePath) return;
        if (!blocksByTexture[blockData.texturePath]) {
            blocksByTexture[blockData.texturePath] = [];
        }
        blocksByTexture[blockData.texturePath].push(blockData);
    });
    
    const dummy = new THREE.Object3D();
    
    for (const [texturePath, blocks] of Object.entries(blocksByTexture)) {
        let material = this.materialsCache[texturePath];
        
        if (!material) {
            const texture = this.textureLoader.load(texturePath);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            material = new THREE.MeshBasicMaterial({ map: texture });
            material.userData.texturePath = texturePath;
            this.materialsCache[texturePath] = material;
        }
        
        const instancedMesh = new THREE.InstancedMesh(this.sharedBoxGeometry, material, blocks.length);
        instancedMesh.castShadow = false;
        instancedMesh.receiveShadow = false;
        
        blocks.forEach((blockData, index) => {
            dummy.position.set(blockData.x, blockData.y, blockData.z);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        
        instancedMesh.instanceMatrix.needsUpdate = true;
        this.skinContainer.add(instancedMesh);
    }
  }

  updateTransparency(camera) {
      if (!this.character) return;

      const charCenter = this.tempCenter.set(this.character.position.x, this.character.position.y + 1.0, this.character.position.z);
      const dist = camera.position.distanceTo(charCenter);

      const fadeEndDist = 0.6;   
      const shouldBeVisible = dist >= fadeEndDist;

      if (this.lastVisibilityState !== shouldBeVisible) {
          this.skinContainer.visible = shouldBeVisible;
          if (this.shadow) {
              this.shadow.visible = shouldBeVisible;
          }
          this.lastVisibilityState = shouldBeVisible;
      }
  }

  setupShadow() {
      if (this.shadow) {
          if (this.shadow.geometry) this.shadow.geometry.dispose();
          if (this.shadow.material) this.shadow.material.dispose();
          this.scene.remove(this.shadow);
      }
      const shadowGeometry = new THREE.CircleGeometry(0.4, 32);
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
      this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.position.y = 0.01; 
      this.scene.add(this.shadow);
  }

  update(deltaTime) {
    if (this.character && this.shadow) {
      this.shadow.position.x = this.character.position.x;
      this.shadow.position.z = this.character.position.z;
      this.shadow.position.y = 0.11;
    }
  }
  
  displayChatBubble(message) {
    if (!this.character) return;
    
    if (this.character.chatBubble) {
        this.character.remove(this.character.chatBubble);
        if (this.character.chatBubble.element && this.character.chatBubble.element.parentNode) {
            this.character.chatBubble.element.parentNode.removeChild(this.character.chatBubble.element);
        }
        this.character.chatBubble = null;
    }
    
    const div = document.createElement('div');
    div.className = 'chat-bubble-styled'; 
    div.textContent = message;
    
    const chatBubble = new CSS2DObject(div);
    chatBubble.position.set(0, 1.9, 0); 
    
    this.character.add(chatBubble);
    this.character.chatBubble = chatBubble;

    setTimeout(() => {
      if (this.character && this.character.chatBubble === chatBubble) {
        this.character.remove(chatBubble);
        if (chatBubble.element && chatBubble.element.parentNode) {
            chatBubble.element.parentNode.removeChild(chatBubble.element);
        }
        this.character.chatBubble = null;
      }
    }, 6000);
  }
}