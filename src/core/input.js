class InputHandler {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            sprint: false,
            changeView: false,
            inventory: false
        };
        this.mouse = { x: 0, y: 0 };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onKeyDown(event) {
        if (event.code === 'KeyE') {
            this.keys.inventory = !this.keys.inventory;
            this.toggleInventoryUI();
            return;
        }

        if (this.keys.inventory) return; // Envanter açıkken hareket tuşları kilitlensin

        if (event.code === 'KeyC') { this.keys.changeView = true; return; }
        if (event.code === 'ControlLeft') { event.preventDefault(); this.keys.sprint = true; return; }

        switch (event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space': this.keys.jump = true; break;
            case 'ShiftLeft': this.keys.crouch = true; break;
        }
    }

    onKeyUp(event) {
        if (event.code === 'KeyC') { this.keys.changeView = false; return; }
        if (event.code === 'ControlLeft') { this.keys.sprint = false; return; }

        switch (event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'Space': this.keys.jump = false; break;
            case 'ShiftLeft': this.keys.crouch = false; break;
        }
    }

    toggleInventoryUI() {
        const invScreen = document.getElementById('inventory-screen');
        if (this.keys.inventory) {
            invScreen.style.display = 'flex';
            document.exitPointerLock();
            // Tüm hareketleri sıfırla ki envanter açılınca karakter sonsuza kadar koşmasın
            for (let key in this.keys) { if(key !== 'inventory') this.keys[key] = false; }
        } else {
            invScreen.style.display = 'none';
            document.body.requestPointerLock();
        }
    }

    onMouseMove(event) {
        if (document.pointerLockElement === document.body && !this.keys.inventory) {
            this.mouse.x = event.movementX || 0;
            this.mouse.y = event.movementY || 0;
        }
    }

    clearMouse() {
        this.mouse.x = 0;
        this.mouse.y = 0;
    }
}