<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS-Craft (Alfa)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="hud">
        <div id="crosshair">+</div>
        <div id="status-bars">
            <div id="heart-container"></div>
            <div id="food-container"></div>
        </div>
        <div id="hotbar">
            <div class="hotbar-slot active" data-slot="0"></div>
            <div class="hotbar-slot" data-slot="1"></div>
            <div class="hotbar-slot" data-slot="2"></div>
            <div class="hotbar-slot" data-slot="3"></div>
            <div class="hotbar-slot" data-slot="4"></div>
            <div class="hotbar-slot" data-slot="5"></div>
            <div class="hotbar-slot" data-slot="6"></div>
            <div class="hotbar-slot" data-slot="7"></div>
            <div class="hotbar-slot" data-slot="8"></div>
        </div>
    </div>

    <div id="inventory-screen" style="display: none;">
        <div id="inventory-box">
            <h3 class="inventory-title">Basur'un Envanteri</h3>
            <div class="inventory-grid"></div>
            <div class="inventory-separator"></div>
            <div class="hotbar-mirror-grid">
                <div class="inv-slot"></div><div class="inv-slot"></div><div class="inv-slot"></div>
                <div class="inv-slot"></div><div class="inv-slot"></div><div class="inv-slot"></div>
                <div class="inv-slot"></div><div class="inv-slot"></div><div class="inv-slot"></div>
            </div>
        </div>
    </div>

    <audio id="damage-sound" src="uh.mp4"></audio>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    
    <script src="src/core/input.js"></script>
    <script src="src/player/controller.js"></script>
    <script src="src/main.js"></script>
</body>
</html>
