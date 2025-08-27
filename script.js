const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

const originalCanvasWidth = 600;
const originalCanvasHeight = 200;
const groundY = 150;

// --- Image Assets ---
let dinoImg = new Image();
dinoImg.src = 'images/dino.png';

let birdWingUpImg = new Image();
birdWingUpImg.src = 'images/bird_wing_up.png';
let birdWingDownImg = new Image();
birdWingDownImg.src = 'images/bird_wing_down.png';

const cactusImgs = [
    'images/cactus1.png',
    'images/cactus2.png',
    'images/cactus3.png',
    'images/cactus4.png',
    'images/cactus5.png',
    'images/cactus6.png',
    'images/cactus7.png',
    'images/cactus8.png'
].map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

// --- Game Objects and Variables ---
let dino = {
    x: 50,
    y: groundY,
    width: 20,
    height: 30,
    dy: 0,
    gravity: 0.9,
    isJumping: false,
};

let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let gameSpeed = 3;
let gameInterval;
let obstacleInterval;
let scoreInterval;

// --- Obstacle Generation Settings ---
const minObstacleInterval = 750;
const maxObstacleInterval = 1000;

const birdWidth = 25;
const birdHeight = 15;

const birdChance = 0.3;

// --- Game Logic ---

function setupCanvas() {
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = containerWidth * (originalCanvasHeight / originalCanvasWidth);

    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';

    canvas.width = originalCanvasWidth;
    canvas.height = originalCanvasHeight;
}

function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY + dino.height, canvas.width, canvas.height - (groundY + dino.height));
}

function drawDino() {
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Handle flapping animation for the bird
        if (obstacle.type === 'bird') {
            obstacle.frameCounter++;
            if (obstacle.frameCounter >= obstacle.frameSpeed) {
                obstacle.currentFrame = (obstacle.currentFrame + 1) % 2;
                obstacle.img = obstacle.currentFrame === 0 ? birdWingUpImg : birdWingDownImg;
                obstacle.frameCounter = 0;
            }
        }
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateDino() {
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y >= groundY) {
        dino.y = groundY;
        dino.isJumping = false;
        dino.dy = 0;
    }
}

function jump() {
    if (!dino.isJumping) {
        dino.isJumping = true;
        dino.dy = -15;
    }
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function generateObstacle() {
    const isBird = Math.random() < birdChance;

    if (isBird) {
        let newBird = {
            x: canvas.width,
            y: groundY - 30 - Math.random() * 50,
            width: birdWidth,
            height: birdHeight,
            type: 'bird',
            currentFrame: 0,
            frameCounter: 0,
            frameSpeed: 10,
            img: birdWingUpImg
        };
        obstacles.push(newBird);
    } else {
        const randomCactusImg = cactusImgs[Math.floor(Math.random() * cactusImgs.length)];
        const cactusWidth = randomCactusImg.width / (randomCactusImg.height / dino.height) * (0.8 + Math.random() * 0.4);
        const cactusHeight = dino.height * (0.8 + Math.random() * 0.4);

        let newObstacle = {
            x: canvas.width,
            y: groundY + dino.height - cactusHeight,
            width: cactusWidth,
            height: cactusHeight,
            type: 'cactus',
            img: randomCactusImg
        };
        obstacles.push(newObstacle);
    }
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            gameOver();
        }
    });
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
    if (score % 100 === 0) {
        gameSpeed += 0.5;
    }
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }

    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    dino.y = groundY;
    dino.isJumping = false;
    obstacles = [];
    score = 0;
    gameSpeed = 3;
    scoreDisplay.textContent = score;
    gameOverScreen.classList.add('hidden');

    startGame();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawDino();
    updateDino();

    drawObstacles();
    updateObstacles();

    checkCollision();
}

function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60);

    let randomObstacleTime = minObstacleInterval + Math.random() * (maxObstacleInterval - minObstacleInterval);
    obstacleInterval = setInterval(generateObstacle, randomObstacleTime);

    scoreInterval = setInterval(updateScore, 100);
}

// --- Initial Setup and Event Listeners ---
let imagesLoaded = 0;
const totalImages = 1 + 2 + cactusImgs.length; // 1 dino + 2 birds + 8 cacti

function imageLoadHandler() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        highScoreDisplay.textContent = highScore;
        setupCanvas();
        startGame();
        window.addEventListener('resize', setupCanvas);
    }
}

dinoImg.onload = imageLoadHandler;
birdWingUpImg.onload = imageLoadHandler;
birdWingDownImg.onload = imageLoadHandler;
cactusImgs.forEach(img => img.onload = imageLoadHandler);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

document.addEventListener('touchstart', (e) => {
    jump();
});

restartBtn.addEventListener('click', resetGame);
