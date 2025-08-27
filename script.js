let gameInterval;
let obstacleInterval;
let scoreInterval;
let score = 0;
let highScore = 0;
let obstacleSpeed = 5;
const MAX_OBSTACLE_SPEED = 15;
const minObstacleInterval = 1200;
const maxObstacleInterval = 3000;
let obstacles = [];
let dino = { x: 50, y: 150, width: 60, height: 60, dy: 0, gravity: 0.6, jumpPower: 12, isJumping: false };

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');

const dinoImg = new Image();
const birdWingUpImg = new Image();
const birdWingDownImg = new Image();
const cactusImgs = [new Image(), new Image(), new Image()];

const jumpSound = new Audio('jump.wav');
const pointSound = new Audio('point.wav');
const dieSound = new Audio('die.wav');

function updateDino() {
    dino.y += dino.dy;
    dino.dy += dino.gravity;

    if (dino.y >= 150) {
        dino.y = 150;
        dino.isJumping = false;
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });

    if (obstacleSpeed < MAX_OBSTACLE_SPEED) {
        obstacleSpeed += 0.001;
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            dieSound.play();
            resetGame();
        }
    });
}

function generateObstacle() {
    const obstacleType = Math.random() < 0.7 ? 'cactus' : 'bird';
    let newObstacle;

    if (obstacleType === 'cactus') {
        const cactusIndex = Math.floor(Math.random() * cactusImgs.length);
        newObstacle = {
            x: canvas.width,
            y: 150,
            width: 30,
            height: 60,
            img: cactusImgs[cactusIndex]
        };
    } else {
        const birdY = Math.random() > 0.5 ? 100 : 130;
        newObstacle = {
            x: canvas.width,
            y: birdY,
            width: 40,
            height: 30,
            img: birdWingUpImg
        };
    }
    obstacles.push(newObstacle);
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
    }
}

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);
    obstacles = [];
    score = 0;
    scoreDisplay.textContent = score;
    dino.y = 150;
    dino.dy = 0;
    dino.isJumping = false;
    obstacleSpeed = 5;
    startGame();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateDino();
    drawObstacles();
    updateObstacles();
    checkCollision();
}

function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60);

    const randomObstacleTime = minObstacleInterval + Math.random() * (maxObstacleInterval - minObstacleInterval);
    obstacleInterval = setInterval(generateObstacle, randomObstacleTime);

    scoreInterval = setInterval(updateScore, 100);
}

function setupCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = 200;
}

function jump() {
    if (!dino.isJumping) {
        dino.isJumping = true;
        dino.dy = -dino.jumpPower;
        jumpSound.play();
    }
}

let imagesLoaded = 0;
const totalImages = 1 + 2 + cactusImgs.length;

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

document.addEventListener('touchstart', () => {
    jump();
});

restartBtn.addEventListener('click', resetGame);
