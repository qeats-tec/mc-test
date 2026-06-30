// Local düzende import kelimeleri kaldırıldı
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee); // Gökyüzü Mavisi

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5); // Kamerayı karakter göz hizasına kaldırıyoruz

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Işıklandırmalar
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// FİXLENDİ: 'DirectionLight' yerine 'DirectionalLight' constructor'ı kullanıldı
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

// Basit Bir Zemin Ekleyelim (Yeşil Çimen)
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x557a46, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Sınıfları Tetikleme (HTML sırasına göre hafızadalar)
const input = new InputHandler();
const player = new PlayerController(camera, input, scene);

// Pencere Boyutu Değişimi Fixi
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ana Döngü
function animate() {
    requestAnimationFrame(animate);
    player.update();
    renderer.render(scene, camera);
}

// Oyunu Başlat
animate();