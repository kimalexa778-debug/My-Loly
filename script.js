Enter/* ==========================================================================
   MAGICAL INTERACTIVE EXPERIENCE FOR LIA
   Disney / Pixar Romantic Story Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- AUDIO SYNTHESIZER (No external audio assets needed!) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    playNote(freq, type = 'sine', duration = 0.5, delay = 0) {
      if (!this.ctx) return;
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      }, delay * 1000);
    }

    playUnlockSound() {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, i) => this.playNote(f, 'triangle', 0.6, i * 0.12));
    }

    playErrorSound() {
      this.init();
      this.playNote(180, 'sawtooth', 0.3, 0);
      this.playNote(140, 'sawtooth', 0.4, 0.15);
    }

    playMagicChime() {
      this.init();
      const arpeggio = [587.33, 739.99, 880, 1174.66, 1479.98];
      arpeggio.forEach((f, i) => this.playNote(f, 'sine', 0.8, i * 0.08));
    }
  }

  const soundEngine = new SoundEngine();

  // --- CANVAS PARTICLE ENGINE ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let fireworks = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, type = 'star') {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.type = type;
      this.size = Math.random() * (type === 'heart' ? 12 : 3) + 2;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = type === 'heart' ? -Math.random() * 2 - 0.5 : (Math.random() - 0.5) * 1;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.color = type === 'heart' ? '#ff69b4' : (Math.random() > 0.5 ? '#ffd700' : '#ffffff');
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.type === 'heart' && this.y < -20) this.y = canvas.height + 20;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size * 1.5}px serif`;
        ctx.fillText('❤️', this.x, this.y);
      } else {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Initialize background stars
  for (let i = 0; i < 70; i++) particles.push(new Particle());

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Fireworks update
    fireworks.forEach((fw, idx) => {
      fw.update();
      fw.draw();
      if (fw.alpha <= 0) fireworks.splice(idx, 1);
    });

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  function triggerFireworksBurst(originX, originY) {
    const colors = ['#ff69b4', '#ffd700', '#ff2a6d', '#ffffff', '#70e0ff'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      fireworks.push({
        x: originX || canvas.width / 2,
        y: originY || canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.05; // gravity
          this.alpha -= 0.015;
        },
        draw() {
          ctx.save();
          ctx.globalAlpha = Math.max(0, this.alpha);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    }
  }

  // --- WEB SPEECH API HELPER ---
  function speakText(text, voiceGender = 'female', onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel(); // stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.pitch = voiceGender === 'female' ? 1.3 : 0.9;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));

    if (frenchVoices.length > 0) {
      if (voiceGender === 'female') {
        utterance.voice = frenchVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Amelie') || v.name.includes('Marie') || v.name.includes('Aurelie')) || frenchVoices[0];
      } else {
        utterance.voice = frenchVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Thomas') || v.name.includes('Nicolas')) || frenchVoices[0];
      }
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Ensure voices are loaded
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // --- DOM ELEMENTS ---
  const startOverlay = document.getElementById('start-overlay');
  const btnStart = document.getElementById('btn-start');
  const appContainer = document.getElementById('app-container');

  const kittenWrapper = document.getElementById('kitten-wrapper');
  const kittenSvg = document.getElementById('kitten-svg');
  const kittenSadEyes = document.getElementById('kitten-sad-eyes');
  const kittenSmile = document.getElementById('kitten-smile');

  const noahWrapper = document.getElementById('noah-wrapper');
  const noahSvg = document.getElementById('noah-svg');

  const dialogBox = document.getElementById('dialog-box');
  const speakerName = document.getElementById('speaker-name');
  const dialogText = document.getElementById('dialog-text');
  const btnNext = document.getElementById('btn-next');

  const keypadContainer = document.getElementById('keypad-container');
  const passwordDisplay = document.getElementById('password-display');
  const pawPrintsContainer = document.getElementById('paw-prints-container');

  const letterModal = document.getElementById('letter-modal');
  const btnCloseLetter = document.getElementById('btn-close-letter');

  const galleryContainer = document.getElementById('gallery-container');
  const btnToHeart = document.getElementById('btn-to-heart');

  const heartContainer = document.getElementById('heart-container');
  const interactiveHeart = document.getElementById('interactive-heart');
  const btnToFinal = document.getElementById('btn-to-final');

  const finalContainer = document.getElementById('final-container');
  const btnRestart = document.getElementById('btn-restart');

  // --- STORY ENGINE STATE & SCENE MANAGEMENT ---
  let currentScene = 1;
  let enteredPassword = "";
  const SECRET_CODE = "25/12";

  function typeWriter(text, element, speed = 40, callback = null, speakerSvg = null) {
    element.innerHTML = "";
    let index = 0;

    if (speakerSvg) speakerSvg.classList.add('talking');

    function type() {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        if (speakerSvg) speakerSvg.classList.remove('talking');
        if (callback) callback();
      }
    }
    type();
  }

  function createPawPrint(x, y) {
    const paw = document.createElement('div');
    paw.className = 'paw-print';
    paw.innerHTML = '🐾';
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    pawPrintsContainer.appendChild(paw);
  }

  // Interactive Kitten Clicks
  kittenWrapper.addEventListener('click', () => {
    soundEngine.playMagicChime();
    kittenWrapper.style.transform = 'scale(1.1) rotate(5deg)';
    setTimeout(() => kittenWrapper.style.transform = 'scale(1) rotate(0deg)', 300);
    triggerFireworksBurst(window.innerWidth / 2, window.innerHeight / 2 - 100);
  });

  // --- SCENE SEQUENCER ---
  function nextScene() {
    btnNext.classList.add('hidden');

    if (currentScene === 1) {
      // SCENE 2
      currentScene = 2;
      // Kitten walks slightly
      kittenWrapper.style.transform = 'translateX(40px)';
      // Paw prints appear
      createPawPrint(window.innerWidth / 2 - 80, window.innerHeight / 2);
      createPawPrint(window.innerWidth / 2 - 30, window.innerHeight / 2 - 20);

      const text = "Quelqu'un t'attend avec tout son cœur... Mais avant cela, tu dois découvrir le mot de passe secret.";
      speakerName.textContent = "La Petite Chatte";
      speakText(text, 'female');
      typeWriter(text, dialogText, 45, () => {
        btnNext.textContent = "Découvrir le Code 🔑";
        btnNext.classList.remove('hidden');
      }, kittenSvg);

    } else if (currentScene === 2) {
      // SCENE 3: KEYPAD SCREEN
      currentScene = 3;
      dialogBox.classList.add('hidden');
      keypadContainer.classList.remove('hidden');

    } else if (currentScene === 4) {
      // TRANSITION FROM PASSWORD UNLOCKED TO NOAH (SCENE 5)
      currentScene = 5;
      keypadContainer.classList.add('hidden');
      kittenWrapper.classList.add('hidden');

      // Noah Slowly Appears
      noahWrapper.classList.remove('hidden');
      noahWrapper.style.opacity = '0';
      setTimeout(() => {
        noahWrapper.style.opacity = '1';
        soundEngine.playMagicChime();
      }, 100);

      dialogBox.classList.remove('hidden');
      speakerName.textContent = "Noah";
      const text = "Bonjour Lia... Cette lettre est écrite uniquement pour toi.";
      speakText(text, 'male');
      typeWriter(text, dialogText, 45, () => {
        btnNext.textContent = "Ouvrir la Lettre ✉️";
        btnNext.classList.remove('hidden');
      }, noahSvg);

    } else if (currentScene === 5) {
      // SCENE 6: ENVELOPE & HANDWRITTEN LETTER
      currentScene = 6;
      dialogBox.classList.add('hidden');
      letterModal.classList.remove('hidden');
      soundEngine.playUnlockSound();

      // Reveal Letter lines progressively
      const lines = document.querySelectorAll('.letter-line');
      lines.forEach((line, idx) => {
        setTimeout(() => line.classList.add('visible'), idx * 800 + 400);
      });

      // Read Letter Aloud
      const fullLetterText = "Ma chère Lia, Depuis que tu es entrée dans ma vie, chaque journée est devenue plus belle. Ton sourire illumine mes pensées, ta voix apaise mon cœur, et ta présence rend chaque instant précieux. Merci d'être celle que tu es. Je promets de toujours prendre soin de toi, de te soutenir, de te faire sourire, et de t'aimer un peu plus chaque jour. Je t'aime aujourd'hui, demain, et pour toujours. Avec tout mon amour, Noah.";
      
      speakText(fullLetterText, 'male', () => {
        btnCloseLetter.classList.remove('hidden');
      });
    }
  }

  btnNext.addEventListener('click', nextScene);

  // START BUTTON
  btnStart.addEventListener('click', () => {
    soundEngine.init();
    soundEngine.playMagicChime();
    startOverlay.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // SCENE 1
    const text1 = "Bonjour Lia... Bienvenue dans notre petit monde magique. J'ai une surprise très spéciale pour toi aujourd'hui...";
    speakerName.textContent = "La Petite Chatte";
    speakText(text1, 'female');
    typeWriter(text1, dialogText, 45, () => {
      btnNext.classList.remove('hidden');
    }, kittenSvg);
  });

  // --- KEYPAD LOGIC (SCENE 3) ---
  function updatePasswordDisplay() {
    const placeholders = passwordDisplay.querySelectorAll('.digit-placeholder');
    placeholders[0].textContent = enteredPassword[0] || '•';
    placeholders[1].textContent = enteredPassword[1] || '•';
    placeholders[2].textContent = enteredPassword[3] || '•'; // index 2 is slash
    placeholders[3].textContent = enteredPassword[4] || '•';
  }

  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      soundEngine.playNote(400, 'sine', 0.1);

      if (key === 'C') {
        enteredPassword = "";
        updatePasswordDisplay();
      } else if (key === 'OK') {
        validatePassword();
      } else {
        if (enteredPassword.length === 2) enteredPassword += '/';
        if (enteredPassword.length < 5) {
          enteredPassword += key;
          updatePasswordDisplay();
        }
      }
    });
  });

  function validatePassword() {
    if (enteredPassword === SECRET_CODE || enteredPassword === "2512") {
      // CORRECT PASSWORD!
      soundEngine.playUnlockSound();
      passwordDisplay.classList.add('success');
      
      // Heart Explosion & Magic Particles
      for (let i = 0; i < 25; i++) particles.push(new Particle(null, null, 'heart'));
      triggerFireworksBurst();

      // SCENE 4: Kitten Excited
      keypadContainer.classList.add('hidden');
      dialogBox.classList.remove('hidden');
      kittenSmile.classList.remove('hidden');

      speakerName.textContent = "La Petite Chatte";
      const text = "Bravo Lia ! Tu l'as trouvé ! Viens... Quelqu'un veut te voir...";
      speakText(text, 'female');
      currentScene = 4;
      typeWriter(text, dialogText, 40, () => {
        btnNext.textContent = "Rencontrer Noah ✨";
        btnNext.classList.remove('hidden');
      }, kittenSvg);

    } else {
      // WRONG PASSWORD
      soundEngine.playErrorSound();
      keypadContainer.classList.add('shake');
      passwordDisplay.classList.add('error');
      
      // Sad Kitten Reaction
      kittenSadEyes.classList.remove('hidden');

      setTimeout(() => {
        keypadContainer.classList.remove('shake');
        passwordDisplay.classList.remove('error');
        kittenSadEyes.classList.add('hidden');
        enteredPassword = "";
        updatePasswordDisplay();
      }, 1000);
    }
  }

  // --- LETTER CLOSE & GALLERY (SCENE 7) ---
  btnCloseLetter.addEventListener('click', () => {
    letterModal.classList.add('hidden');
    noahWrapper.classList.add('hidden');
    galleryContainer.classList.remove('hidden');
    soundEngine.playMagicChime();
  });

  btnToHeart.addEventListener('click', () => {
    galleryContainer.classList.add('hidden');
    heartContainer.classList.remove('hidden');
  });

  // --- INTERACTIVE HEART (SCENE 8) ---
  interactiveHeart.addEventListener('click', (e) => {
    soundEngine.playUnlockSound();
    triggerFireworksBurst(e.clientX, e.clientY);

    // Thousands of hearts
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(e.clientX, e.clientY, 'heart'));
    }

    btnToFinal.classList.remove('hidden');
  });

  btnToFinal.addEventListener('click', () => {
    heartContainer.classList.add('hidden');
    finalContainer.classList.remove('hidden');

    // SCENE 9: FINAL SCENE
    noahWrapper.classList.remove('hidden');
    noahWrapper.style.bottom = '120px';

    speakText("Je t'aimerai toujours, Lia.", 'male');
    triggerFireworksBurst();
  });

  // RESTART BUTTON
  btnRestart.addEventListener('click', () => {
    location.reload();
  });

});
