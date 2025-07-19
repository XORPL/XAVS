const heartCanvas = document.getElementById("heartCanvas");
const bgCanvas = document.getElementById("bgCanvas");
const ctx = heartCanvas.getContext("2d");
const bgCtx = bgCanvas.getContext("2d");
const message = document.getElementById("message");

let particles = [];
let fallingDots = [];
let sparkles = [];
let animationId;

let MAX_PARTICLES = 60;
let MAX_FALLING_DOTS = 50;
let MAX_SPARKLES = 8;

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    heartCanvas.width = width;
    heartCanvas.height = height;
    bgCanvas.width = width;
    bgCanvas.height = height;
    createHeartParticles();
    createFallingDots();
}

function createHeartParticles() {
    particles = [];
    const centerX = heartCanvas.width / 2;
    const centerY = heartCanvas.height / 2;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 60;
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
        if (particles.length >= MAX_PARTICLES) break;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        particles.push({
            x: centerX + x * scale,
            y: centerY - y * scale,
            originalX: centerX + x * scale,
            originalY: centerY - y * scale,
            velocityX: 0,
            velocityY: 0,
            size: Math.random() * 2 + 1.5,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }
}

function createFallingDots() {
    fallingDots = [];
    for (let i = 0; i < MAX_FALLING_DOTS; i++) {
        fallingDots.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 1.5 + 0.8,
            speed: Math.random() * 1 + 0.3,
            opacity: Math.random() * 0.4 + 0.2
        });
    }
}

function drawBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    fallingDots.forEach(dot => {
        bgCtx.globalAlpha = dot.opacity;
        bgCtx.fillStyle = '#ffffff';
        bgCtx.beginPath();
        bgCtx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        bgCtx.fill();
        dot.y += dot.speed;
        if (dot.y > bgCanvas.height + 10) {
            dot.y = -10;
            dot.x = Math.random() * bgCanvas.width;
        }
    });
    bgCtx.globalAlpha = 1;
}

function drawHeart(mouseX, mouseY, time) {
    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    particles.forEach(particle => {
        if (mouseX !== null && mouseY !== null) {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared < 14400) {
                const distance = Math.sqrt(distanceSquared);
                const angle = Math.atan2(dy, dx);
                const force = (120 - distance) / 120 * 1.2;
                particle.velocityX += Math.cos(angle) * force;
                particle.velocityY += Math.sin(angle) * force;
            }
        }
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityX *= 0.97;
        particle.velocityY *= 0.97;
        const returnForceX = (particle.originalX - particle.x) * 0.025;
        const returnForceY = (particle.originalY - particle.y) * 0.025;
        particle.velocityX += returnForceX;
        particle.velocityY += returnForceY;
        const pulse = 1 + Math.sin(time * 0.002 + particle.pulseOffset) * 0.08;
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0;
    drawSparkles();
}

function drawSparkles() {
    sparkles.forEach((sparkle, index) => {
        ctx.save();
        ctx.globalAlpha = sparkle.opacity;
        ctx.font = `${sparkle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.translate(sparkle.x, sparkle.y);
        ctx.rotate(sparkle.rotation);
        ctx.fillText("✨", 0, 0);
        ctx.restore();
        sparkle.x += sparkle.velocityX;
        sparkle.y += sparkle.velocityY;
        sparkle.velocityY += 0.12;
        sparkle.velocityX *= 0.998;
        sparkle.rotation += sparkle.rotationSpeed;
        sparkle.opacity -= 0.015;
        if (sparkle.opacity <= 0 || sparkle.y > window.innerHeight + 50) {
            sparkles.splice(index, 1);
        }
    });
}

let mouseX = null;
let mouseY = null;

heartCanvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

heartCanvas.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
});

heartCanvas.addEventListener('click', (e) => {
    showMessage(e.clientX, e.clientY);
    createSparkles(e.clientX, e.clientY);
});

function showMessage(x, y) {
    message.style.left = x + 'px';
    message.style.top = y + 'px';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.display = "block";
    setTimeout(() => {
        message.style.display = "none";
    }, 1500);
}

function createSparkles(x, y) {
    const sparkleCount = Math.min(MAX_SPARKLES, 8);
    for (let i = 0; i < sparkleCount; i++) {
        if (sparkles.length >= MAX_SPARKLES) break;
        const angle = (Math.PI * 2 * i) / sparkleCount + Math.random() * 0.3;
        const velocity = 2 + Math.random() * 3;
        sparkles.push({
            x: x,
            y: y,
            size: 12 + Math.random() * 6,
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity - Math.random() * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            opacity: 1
        });
    }
}

let startTime = Date.now();
let lastFrame = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
    if (currentTime - lastFrame >= frameInterval) {
        drawBackground();
        drawHeart(mouseX, mouseY, currentTime - startTime);
        lastFrame = currentTime;
    }
    animationId = requestAnimationFrame(animate);
}

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    MAX_PARTICLES = 40;
    MAX_FALLING_DOTS = 30;
    MAX_SPARKLES = 5;
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        animate();
    }
});

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
animate();
