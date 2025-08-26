const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score'); // Corrected typo here
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

const originalCanvasWidth = 600;
const originalCanvasHeight = 200;
const groundY = 150;

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
// Time between obstacles (in milliseconds)
const minObstacleInterval = 1000;
const maxObstacleInterval = 2000;

// Cactus size range
const minCactusWidth = dino.width;
const maxCactusWidth = 40;
const minCactusHeight = dino.height;
const maxCactusHeight = 40;

// Bird size (fixed)
const birdWidth = 25;
const birdHeight = 15;

// Obstacle type chance
const birdChance = 0.4;

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
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'cactus') {
            ctx.fillStyle = '#228B22';
        } else if (obstacle.type === 'bird') {
            ctx.fillStyle = '#87CEEB';
        }
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
            type: 'bird'
        };
        obstacles.push(newBird);
    } else {
        let obstacleWidth = minCactusWidth + Math.random() * (maxCactusWidth - minCactusWidth);
        let obstacleHeight = minCactusHeight + Math.random() * (maxCactusHeight - minCactusHeight);
        let newObstacle = {
            x: canvas.width,
            y: groundY + dino.height - obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight,
            type: 'cactus'
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

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

document.addEventListener('touchstart', (e) => {
    jump();
});

restartBtn.addEventListener('click', resetGame);

// Initial game setup and event listener for resizing
highScoreDisplay.textContent = highScore;
setupCanvas();
startGame();
window.addEventListener('resize', setupCanvas);
