class PlayerController {
    constructor(camera, input, scene) {
        this.camera = camera;
        this.input = input;
        this.scene = scene;

        this.walkSpeed = 0.1;
        this.sprintSpeed = 0.16;  
        this.crouchSpeed = 0.04; 
        this.mouseSensitivity = 0.002;
        this.pitch = 0; 
        this.yaw = 0;   

        this.velocityY = 0;       
        this.gravity = 0.024;      
        this.jumpForce = 0.285;    
        this.isGrounded = false;   
        this.jumpRequestProcessed = false; 

        this.position = new THREE.Vector3(0, 0, 0); 
        this.normalHeight = 1.62; 
        this.crouchHeight = 1.25;  
        this.currentHeight = this.normalHeight; 
        this.crouchFactor = 0; 

        this.cameraMode = 0;
        this.viewPressed = false; 
        this.animTime = 0;

        this.health = 20; 
        this.hunger = 20; 
        this.activeSlot = 0;

        this.createCharacterBody();
        this.initHUD();
        this.setupMouseWheel();

        window.addEventListener('click', () => {
            if (!this.input.keys.inventory) {
                document.body.requestPointerLock();
            }
        });
    }

    createCharacterBody() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0080ff'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#ffffff'; ctx.font = 'Bold 40px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('BASUR', 128, 128);

        const bodyTexture = new THREE.CanvasTexture(canvas);
        const bodyMat = new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.9 });

        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 256; faceCanvas.height = 256;
        const faceCtx = faceCanvas.getContext('2d');
        faceCtx.fillStyle = '#d2a679'; faceCtx.fillRect(0, 0, 256, 256);
        faceCtx.fillStyle = '#1a1a1a'; faceCtx.strokeStyle = '#1a1a1a'; faceCtx.lineWidth = 6; faceCtx.lineCap = 'round';
        faceCtx.beginPath(); faceCtx.moveTo(45, 85); faceCtx.lineTo(95, 75); faceCtx.stroke();
        faceCtx.beginPath(); faceCtx.moveTo(155, 75); faceCtx.quadraticCurveTo(185, 70, 210, 85); faceCtx.stroke();
        faceCtx.fillRect(55, 100, 30, 25);
        faceCtx.fillStyle = '#ffffff'; faceCtx.fillRect(70, 103, 10, 10); faceCtx.fillStyle = '#1a1a1a';
        faceCtx.beginPath(); faceCtx.moveTo(155, 110); faceCtx.quadraticCurveTo(185, 95, 215, 110); faceCtx.quadraticCurveTo(185, 120, 155, 110); faceCtx.fill();
        faceCtx.beginPath(); faceCtx.moveTo(85, 175); faceCtx.quadraticCurveTo(145, 205, 195, 160); faceCtx.stroke();
        faceCtx.beginPath(); faceCtx.moveTo(190, 163); faceCtx.lineTo(198, 170); faceCtx.stroke();

        const faceTexture = new THREE.CanvasTexture(faceCanvas);
        const faceMat = new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 0.9 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd2a679, roughness: 0.9 });
        const headMaterials = [skinMat, skinMat, skinMat, skinMat, skinMat, faceMat];
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2e4f4f, roughness: 0.9 }); 

        this.bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.35), bodyMat);
        this.scene.add(this.bodyMesh);

        this.headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), headMaterials);
        this.scene.add(this.headMesh);

        const limbGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);

        this.rightArmPivot = new THREE.Group();
        const rArm = new THREE.Mesh(limbGeo, skinMat); rArm.position.set(0, -0.3, 0);
        this.rightArmPivot.add(rArm); this.scene.add(this.rightArmPivot);

        this.leftArmPivot = new THREE.Group();
        const lArm = new THREE.Mesh(limbGeo, skinMat); lArm.position.set(0, -0.3, 0);
        this.leftArmPivot.add(lArm); this.scene.add(this.leftArmPivot);

        this.rightLegPivot = new THREE.Group();
        const rLeg = new THREE.Mesh(limbGeo, pantsMat); rLeg.position.set(0, -0.3, 0);
        this.rightLegPivot.add(rLeg); this.scene.add(this.rightLegPivot);

        this.leftLegPivot = new THREE.Group();
        const lLeg = new THREE.Mesh(limbGeo, pantsMat); lLeg.position.set(0, -0.3, 0);
        this.leftLegPivot.add(lLeg); this.scene.add(this.leftLegPivot);

        this.fpHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.4), skinMat);
        this.fpHand.position.set(0.18, -0.15, -0.3); this.fpHand.rotation.set(0.1, -0.2, 0);
        
        // Orijinal kütüphanede el kameraya sorunsuzca eklenebilir
        this.camera.add(this.fpHand); 
    }

    initHUD() {
        const heartContainer = document.getElementById('heart-container');
        if (heartContainer) {
            heartContainer.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const heart = document.createElement('div'); heart.className = 'heart';
                heartContainer.appendChild(heart);
            }
        }

        const foodContainer = document.getElementById('food-container');
        if (foodContainer) {
            foodContainer.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const food = document.createElement('div'); food.className = 'food';
                foodContainer.appendChild(food);
            }
        }

        const invGrid = document.querySelector('.inventory-grid');
        if (invGrid && invGrid.children.length === 0) {
            for (let i = 0; i < 27; i++) {
                const slot = document.createElement('div'); slot.className = 'inv-slot';
                invGrid.appendChild(slot);
            }
        }
    }

    setupMouseWheel() {
        window.addEventListener('wheel', (e) => {
            if (this.input.keys.inventory) return; 
            if (e.deltaY > 0) this.activeSlot = (this.activeSlot + 1) % 9;
            else this.activeSlot = (this.activeSlot - 1 + 9) % 9;

            document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
                if (index === this.activeSlot) slot.classList.add('active');
                else slot.classList.remove('active');
            });
        });
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.initHUD(); 
        const audio = document.getElementById('damage-sound');
        if (audio) { audio.currentTime = 0; audio.play(); }
    }

    update() {
        if (this.input.keys.inventory) { this.input.clearMouse(); return; }

        if (this.input.keys.changeView) {
            if (!this.viewPressed) { this.cameraMode = (this.cameraMode + 1) % 3; this.viewPressed = true; }
        } else { this.viewPressed = false; }

        this.yaw -= this.input.mouse.x * this.mouseSensitivity;
        this.pitch -= this.input.mouse.y * this.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));

        const cameraRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        const bodyRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.yaw, 0, 'YXZ'));

        let currentSpeed = this.walkSpeed;
        let targetHeight = this.normalHeight;
        let targetCrouchFactor = 0;

        if (this.input.keys.crouch) { currentSpeed = this.crouchSpeed; targetHeight = this.crouchHeight; targetCrouchFactor = 1; }
        else if (this.input.keys.sprint && this.input.keys.forward) { currentSpeed = this.sprintSpeed; }
        
        this.currentHeight += (targetHeight - this.currentHeight) * 0.2;
        this.crouchFactor += (targetCrouchFactor - this.crouchFactor) * 0.2; 

        const moveVector = new THREE.Vector3();
        let isMoving = false;
        if (this.input.keys.forward) { moveVector.z -= 1; isMoving = true; }
        if (this.input.keys.backward) { moveVector.z += 1; isMoving = true; }
        if (this.input.keys.left) { moveVector.x -= 1; isMoving = true; }
        if (this.input.keys.right) { moveVector.x += 1; isMoving = true; }
        moveVector.normalize();

        const direction = new THREE.Vector3(moveVector.x, 0, moveVector.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw).multiplyScalar(currentSpeed);
        this.position.x += direction.x; this.position.z += direction.z;

        if (!this.isGrounded) this.velocityY -= this.gravity; 
        this.position.y += this.velocityY;

        if (this.position.y <= 0) { this.position.y = 0; this.velocityY = 0; this.isGrounded = true; }
        else { this.isGrounded = false; }

        if (this.input.keys.jump) {
            if (this.isGrounded && !this.jumpRequestProcessed && !this.input.keys.crouch) { this.velocityY = this.jumpForce; this.isGrounded = false; this.jumpRequestProcessed = true; }
        } else { this.jumpRequestProcessed = false; }

        let armAngle = 0, legAngle = 0;
        if (isMoving && this.isGrounded) {
            let speedMultiplier = this.input.keys.crouch ? 0.08 : (this.input.keys.sprint ? 0.25 : 0.15);
            this.animTime += speedMultiplier;
            armAngle = Math.sin(this.animTime) * (this.input.keys.sprint ? 0.7 : 0.5);
            legAngle = Math.cos(this.animTime) * (this.input.keys.sprint ? 0.55 : 0.4); 
        } else { this.animTime = 0; }

        const crouchTilt = this.crouchFactor * 0.32; 
        this.bodyMesh.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(crouchTilt, this.yaw, 0, 'YXZ')));
        this.headMesh.quaternion.copy(bodyRotation);

        this.rightArmPivot.quaternion.setFromEuler(new THREE.Euler(armAngle + (this.crouchFactor * 0.2), this.yaw, 0, 'YXZ'));
        this.leftArmPivot.quaternion.setFromEuler(new THREE.Euler(-armAngle + (this.crouchFactor * 0.2), this.yaw, 0, 'YXZ'));
        this.rightLegPivot.quaternion.setFromEuler(new THREE.Euler(-legAngle, this.yaw, 0, 'YXZ'));
        this.leftLegPivot.quaternion.setFromEuler(new THREE.Euler(legAngle, this.yaw, 0, 'YXZ'));

        const heightDrop = this.crouchFactor * 0.25;
        const armZOffset = this.crouchFactor * 0.08;

        this.rightLegPivot.position.copy(this.position).add(new THREE.Vector3(0.15, 0.6, 0).applyQuaternion(bodyRotation));
        this.leftLegPivot.position.copy(this.position).add(new THREE.Vector3(-0.15, 0.6, 0).applyQuaternion(bodyRotation));
        this.bodyMesh.position.set(this.position.x, this.position.y + (0.9 - heightDrop), this.position.z);
        this.headMesh.position.set(this.position.x, this.position.y + (1.375 - heightDrop), this.position.z);
        this.rightArmPivot.position.copy(this.position).add(new THREE.Vector3(0.38, 1.2 - heightDrop, armZOffset).applyQuaternion(bodyRotation));
        this.leftArmPivot.position.copy(this.position).add(new THREE.Vector3(-0.38, 1.2 - heightDrop, armZOffset).applyQuaternion(bodyRotation));

        const eyePosition = new THREE.Vector3(this.position.x, this.position.y + this.currentHeight, this.position.z);
        const showThirdPerson = (this.cameraMode !== 0);
        this.bodyMesh.visible = showThirdPerson; this.headMesh.visible = showThirdPerson;
        this.rightArmPivot.visible = showThirdPerson; this.leftArmPivot.visible = showThirdPerson;
        this.rightLegPivot.visible = showThirdPerson; this.leftLegPivot.visible = showThirdPerson;
        this.fpHand.visible = !showThirdPerson;

        if (this.cameraMode === 0) { this.camera.position.copy(eyePosition); this.camera.quaternion.copy(cameraRotation); } 
        else if (this.cameraMode === 1) {
            const offset = new THREE.Vector3(0, 0.3, 2.5).applyQuaternion(cameraRotation);
            this.camera.position.copy(eyePosition).add(offset); this.camera.quaternion.copy(cameraRotation);
        } 
        else if (this.cameraMode === 2) {
            const offset = new THREE.Vector3(0, 0.3, -2.5).applyQuaternion(cameraRotation);
            this.camera.position.copy(eyePosition).add(offset); this.camera.quaternion.copy(cameraRotation); this.camera.rotateY(Math.PI); 
        }
        this.input.clearMouse();
    }
}