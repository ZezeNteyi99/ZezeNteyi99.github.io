// ============================================
// SKY CANVAS (NIGHT & DAY)
// ============================================
(() => {
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0;
  let stars = [];
  let clouds = [];
  let isLightMode = false;
  const STAR_COUNT = Math.round(Math.max(120, (window.innerWidth * window.innerHeight) / 12000));
  const SHOOTING_INTERVAL = 2200;
  const CLOUD_COUNT = 6;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initStars();
    initClouds();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        baseAlpha: 0.25 + Math.random() * 0.7,
        twinkleSpeed: 0.002 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function initClouds() {
    clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        width: 80 + Math.random() * 120,
        height: 40 + Math.random() * 40,
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
  }

  let shootingStars = [];

  function spawnShootingStar() {
    const startX = Math.random() * w * 0.6;
    const startY = Math.random() * h * 0.4;
    const len = 150 + Math.random() * 220;
    const speed = 6 + Math.random() * 6;
    shootingStars.push({
      x: startX, y: startY, len, speed, life: 0,
      angle: Math.PI * 0.35 + (Math.random() - 0.5) * 0.2
    });
    if (shootingStars.length > 6) shootingStars.shift();
  }

  setInterval(() => {
    if (Math.random() < 0.7 && !isLightMode) spawnShootingStar();
  }, SHOOTING_INTERVAL);

  // Draw a fluffy cloud
  function drawCloud(cloud) {
    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = '#ffffff';
    
    const x = cloud.x;
    const y = cloud.y;
    const w = cloud.width;
    const h = cloud.height;
    
    // Cloud is made of overlapping circles
    ctx.beginPath();
    ctx.arc(x, y, h * 0.5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.25, y - h * 0.2, h * 0.6, 0, Math.PI * 2);
    ctx.arc(x + w * 0.5, y, h * 0.55, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, y - h * 0.1, h * 0.5, 0, Math.PI * 2);
    ctx.arc(x + w, y, h * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // Draw sun
  function drawSun() {
    const sunX = w * 0.85;
    const sunY = h * 0.15;
    const sunRadius = 60;
    
    // Sun glow
    const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
    gradient.addColorStop(0, 'rgba(255, 220, 100, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x1 = sunX + Math.cos(angle) * (sunRadius + 10);
      const y1 = sunY + Math.sin(angle) * (sunRadius + 10);
      const x2 = sunX + Math.cos(angle) * (sunRadius + 30);
      const y2 = sunY + Math.sin(angle) * (sunRadius + 30);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  let lastTime = performance.now();
  function draw(now) {
    const dt = now - lastTime;
    lastTime = now;

    ctx.clearRect(0, 0, w, h);

    if (isLightMode) {
      // DAY MODE - Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      skyGradient.addColorStop(0, 'rgba(135, 206, 250, 0.3)');
      skyGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);
      
      // Draw sun
      drawSun();
      
      // Draw and animate clouds
      for (let cloud of clouds) {
        drawCloud(cloud);
        cloud.x += cloud.speed;
        
        // Reset cloud position when it goes off screen
        if (cloud.x - cloud.width > w) {
          cloud.x = -cloud.width;
          cloud.y = Math.random() * h * 0.5;
        }
      }
    } else {
      // NIGHT MODE - Draw stars
      const g = ctx.createRadialGradient(w * 0.45, h * 0.5, 20, w * 0.45, h * 0.5, Math.max(w, h));
      g.addColorStop(0, 'rgba(118,185,224,0.06)');
      g.addColorStop(0.3, 'rgba(55,66,221,0.04)');
      g.addColorStop(1, 'rgba(0,0,0,0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let s of stars) {
        s.phase += s.twinkleSpeed * dt;
        const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.life += dt;
        st.x += Math.cos(st.angle) * st.speed;
        st.y += Math.sin(st.angle) * st.speed;

        ctx.beginPath();
        const grad = ctx.createLinearGradient(st.x, st.y, st.x - Math.cos(st.angle) * st.len, st.y - Math.sin(st.angle) * st.len);
        grad.addColorStop(0, 'rgba(180, 255, 255, 0.95)');
        grad.addColorStop(0.7, 'rgba(90, 200, 220, 0.6)');
        grad.addColorStop(1, 'rgba(40, 80, 100, 0.0)');
        ctx.fillStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x - Math.cos(st.angle) * st.len, st.y - Math.sin(st.angle) * st.len);
        ctx.strokeStyle = grad;
        ctx.stroke();

        if (st.x > w + 100 || st.y > h + 100) {
          shootingStars.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(draw);
  }

  // Check initial theme
  function updateTheme() {
    isLightMode = document.body.classList.contains('light-mode');
  }

  resize();
  updateTheme();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
  window.addEventListener('click', () => {
    if (!isLightMode) spawnShootingStar();
  });

  // Listen for theme changes
  const observer = new MutationObserver(() => {
    updateTheme();
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
})();

// ============================================
// TYPING ANIMATION
// ============================================
const text = "Khanyisa Zezethu Nteyi";
const typedTextElement = document.getElementById('typedText');
let charIndex = 0;

function typeText() {
  if (charIndex < text.length) {
    typedTextElement.textContent += text.charAt(charIndex);
    charIndex++;
    setTimeout(typeText, 100);
  }
}

setTimeout(typeText, 500);

// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
  body.classList.add('light-mode');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  } else {
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
const sections = document.querySelectorAll('.section');
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

sections.forEach(section => {
  sectionObserver.observe(section);
});

// ============================================
// SKILL BARS ANIMATION
// ============================================
const skillsSection = document.getElementById('skills');
let skillsAnimated = false;

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !skillsAnimated) {
      const skillBars = document.querySelectorAll('.skill-progress');
      skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        setTimeout(() => {
          bar.style.width = progress + '%';
        }, 200);
      });
      skillsAnimated = true;
    }
  });
}, { threshold: 0.3 });

skillObserver.observe(skillsSection);

// ============================================
// PROJECT CARD INTERACTIONS
// ============================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
  const details = card.querySelector('.project-details');
  
  if (details) {
    details.style.maxHeight = '0';
    details.style.overflow = 'hidden';
    details.style.transition = 'max-height 0.5s ease';
    
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        return;
      }
      
      if (details.style.maxHeight === '0px' || details.style.maxHeight === '') {
        details.style.maxHeight = details.scrollHeight + 'px';
        card.classList.add('expanded');
      } else {
        details.style.maxHeight = '0';
        card.classList.remove('expanded');
      }
    });
  }
});

// ============================================
// HAMBURGER MENU
// ============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// SKILL TAG HOVER EFFECTS
// ============================================
const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1) translateY(-2px)';
  });
  
  tag.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1) translateY(0)';
  });
});

