const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

const originalCanvasWidth = 600;
const originalCanvasHeight = 200;
let scaleFactor;
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

function setupCanvas() {
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    scaleFactor = containerWidth / originalCanvasWidth;
    
    canvas.width = originalCanvasWidth;
    canvas.height = originalCanvasHeight;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = (originalCanvasHeight * scaleFactor) + 'px';
}

function drawDino() {
    ctx.fillStyle = '#4CAF50'; // Bright green
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'cactus') {
            ctx.fillStyle = '#228B22'; // Darker green
        } else if (obstacle.type === 'bird') {
            ctx.fillStyle = '#87CEEB'; // Light blue
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
    // 70% chance of a cactus, 30% chance of a bird
    if (Math.random() > 0.3) {
        let obstacleWidth = 10 + Math.random() * 10;
        let obstacleHeight = 10 + Math.random() * 20;
        let newObstacle = {
            x: canvas.width,
            y: groundY + dino.height - obstacleHeight, // Correct placement on the ground
            width: obstacleWidth,
            height: obstacleHeight,
            type: 'cactus'
        };
        obstacles.push(newObstacle);
    } else {
        let birdWidth = 25;
        let birdHeight = 15;
        let newBird = {
            x: canvas.width,
            y: groundY - 30 - Math.random() * 30, // Random vertical position above the ground
            width: birdWidth,
            height: birdHeight,
            type: 'bird'
        };
        obstacles.push(newBird);
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
    
    drawDino();
    updateDino();
    
    drawObstacles();
    updateObstacles();
    
    checkCollision();
}

function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    obstacleInterval = setInterval(generateObstacle, 2000);
    scoreInterval = setInterval(updateScore, 100);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    jump();
});

restartBtn.addEventListener('click', resetGame);

// Initial game setup and event listener for resizing
highScoreDisplay.textContent = highScore;
setupCanvas();
startGame();
window.addEventListener('resize', setupCanvas);
