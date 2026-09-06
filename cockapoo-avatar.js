/**
 * Interactive Animated Cockapoo Canvas Avatar
 * Reacts dynamically to sounds with head-tilts, ear perking, howling, and barking expressions.
 */
class CockapooAvatar {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // High-DPI screen support
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Expression & Animation State
    this.headAngle = 0;          // Head tilt angle in radians
    this.targetHeadAngle = 0;
    this.earPerk = 0;            // 0 = relaxed, 1 = fully alert/perked
    this.targetEarPerk = 0;
    this.mouthOpen = 0;          // 0 = closed, 1 = wide
    this.targetMouthOpen = 0;
    this.mouthShape = 'normal';   // 'normal', 'bark', 'howl', 'pant'
    this.eyeSquint = 0;          // 0 = wide, 1 = squinting/happy
    this.eyeTarget = { x: 0, y: 0 }; // Gaze offset
    this.curiosityLevel = 0;     // 0 to 1

    // Mood text
    this.statusText = "Listening attentively...";
    this.statusEmoji = "🐶";

    // Timing & Idle motion
    this.lastTime = performance.now();
    this.idleTimer = 0;
    this.blinkTimer = 2.0;
    this.isBlinking = false;

    // Interactive pet response
    this.canvas.addEventListener('pointerdown', (e) => this.handlePet(e));

    // Connect to global audio engine
    if (window.CockapooAudio) {
      window.CockapooAudio.onSoundStart = (name, type, meta) => this.onSoundStart(name, type, meta);
      window.CockapooAudio.onSoundEnd = (name) => this.onSoundEnd(name);
    }

    // Start render loop
    requestAnimationFrame((t) => this.render(t));
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 320;
    this.height = rect.height || 260;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  handlePet(e) {
    this.targetMouthOpen = 0.6;
    this.mouthShape = 'pant';
    this.targetEarPerk = 0.4;
    this.targetHeadAngle = (Math.random() > 0.5 ? 1 : -1) * 0.15;
    this.statusText = "Aww! Good dog! *happy wiggles*";
    this.statusEmoji = "✨";

    // Play soft playful puppy chirp if audio active
    if (window.CockapooAudio) {
      window.CockapooAudio.playPuppyYip();
    }

    setTimeout(() => {
      this.resetExpression();
    }, 1200);
  }

  onSoundStart(name, type, meta) {
    // Determine dynamic behavior based on sound type
    if (type === 'squeak') {
      // Classic inquisitive Cockapoo head-tilt + perked ears!
      const tiltDirection = Math.random() > 0.5 ? 1 : -1;
      this.targetHeadAngle = tiltDirection * (0.24 + Math.random() * 0.12);
      this.targetEarPerk = 0.95;
      this.targetMouthOpen = 0.2;
      this.mouthShape = 'pant';
      this.eyeSquint = 0;
      this.statusText = "SQUEAKER DETECTED! Head tilted!";
      this.statusEmoji = "🧸";
    } else if (type === 'woo' && name === 'awoo_howl') {
      // Singing / Howling position: head lifts, snout forms 'O'
      this.targetHeadAngle = 0.05;
      this.targetEarPerk = 0.65;
      this.targetMouthOpen = 0.85;
      this.mouthShape = 'howl';
      this.eyeSquint = 0.5;
      this.statusText = "AWOOOOO! Singing along with pack!";
      this.statusEmoji = "🎶";
    } else if (type === 'woo') {
      // Whistle or lullaby: curious head tilt
      this.targetHeadAngle = (Math.random() > 0.5 ? 0.22 : -0.22);
      this.targetEarPerk = 0.8;
      this.targetMouthOpen = 0.15;
      this.mouthShape = 'normal';
      this.statusText = "Intrigued by the melody...";
      this.statusEmoji = "🎵";
    } else if (type === 'bark') {
      // Barking expression: rapid open/close mouth & ear bounce
      this.targetHeadAngle = (Math.random() - 0.5) * 0.1;
      this.targetEarPerk = 0.9;
      this.targetMouthOpen = 0.9;
      this.mouthShape = 'bark';
      this.statusText = `Vocalizing: ${name.replace('_', ' ').toUpperCase()}!`;
      this.statusEmoji = "🗣️";
    } else if (type === 'trigger') {
      // Alert triggers (doorbell, treat bag, meow)
      this.targetHeadAngle = (Math.random() > 0.5 ? 0.28 : -0.28);
      this.targetEarPerk = 1.0;
      this.targetMouthOpen = 0.3;
      this.mouthShape = 'pant';
      this.statusText = "WHAT WAS THAT?! Ears perked!";
      this.statusEmoji = "👀";
    }
  }

  onSoundEnd(name) {
    setTimeout(() => {
      this.resetExpression();
    }, 450);
  }

  resetExpression() {
    this.targetHeadAngle = 0;
    this.targetEarPerk = 0.1;
    this.targetMouthOpen = 0.15;
    this.mouthShape = 'pant';
    this.eyeSquint = 0;
    this.statusText = "Ready for the next sound!";
    this.statusEmoji = "🐶";
  }

  render(timestamp) {
    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.idleTimer += dt;

    // Smooth interpolation (spring-like easing)
    this.headAngle += (this.targetHeadAngle - this.headAngle) * Math.min(1, dt * 10);
    this.earPerk += (this.targetEarPerk - this.earPerk) * Math.min(1, dt * 12);
    this.mouthOpen += (this.targetMouthOpen - this.mouthOpen) * Math.min(1, dt * 15);

    // Audio energy reaction
    let audioBoost = 0;
    if (window.CockapooAudio) {
      audioBoost = window.CockapooAudio.getAudioEnergy();
    }

    // Blinking logic
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -0.15) {
        this.isBlinking = false;
        this.blinkTimer = 2.5 + Math.random() * 3.5;
      }
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Center coordinates
    const cx = this.width / 2;
    const cy = this.height / 2 + 10;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    // Gentle breathing bob + head tilt
    const breathe = Math.sin(this.idleTimer * 2.5) * 2;
    this.ctx.translate(0, breathe);
    this.ctx.rotate(this.headAngle);

    // Draw Cockapoo Face Elements
    this.drawBody();
    this.drawEars(audioBoost);
    this.drawHead();
    this.drawCurls();
    this.drawEyes();
    this.drawMuzzle();
    this.drawNose();
    this.drawMouth();

    this.ctx.restore();

    // Render cute HUD badge / Status pill
    this.drawStatusPill();

    requestAnimationFrame((t) => this.render(t));
  }

  drawBody() {
    const ctx = this.ctx;
    // Shoulders / Chest with fluffy golden-tan coat
    ctx.beginPath();
    ctx.ellipse(0, 85, 75, 50, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#E8A35C'; // Warm golden apricot
    ctx.fill();

    // Chest fluff
    ctx.beginPath();
    ctx.ellipse(0, 80, 42, 35, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FCE3BE'; // Lighter cream chest
    ctx.fill();
  }

  drawEars(audioBoost) {
    const ctx = this.ctx;
    const perk = this.earPerk + audioBoost * 0.4;

    // Left Floppy Curly Ear
    ctx.save();
    ctx.translate(-52, -28);
    // Ears raise and rotate when alert
    const leftAngle = -0.15 - perk * 0.35 + Math.sin(this.idleTimer * 3) * 0.03;
    ctx.rotate(leftAngle);

    ctx.beginPath();
    ctx.ellipse(-8, 38, 26, 48, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#D18742'; // Darker caramel tone for floppy ear
    ctx.fill();

    // Curly textures on left ear
    this.drawCurlCluster(-10, 20, 8, '#BF7532');
    this.drawCurlCluster(-8, 48, 9, '#BF7532');
    ctx.restore();

    // Right Floppy Curly Ear
    ctx.save();
    ctx.translate(52, -28);
    const rightAngle = 0.15 + perk * 0.35 - Math.sin(this.idleTimer * 3) * 0.03;
    ctx.rotate(rightAngle);

    ctx.beginPath();
    ctx.ellipse(8, 38, 26, 48, 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#D18742';
    ctx.fill();

    // Curly textures on right ear
    this.drawCurlCluster(10, 20, 8, '#BF7532');
    this.drawCurlCluster(8, 48, 9, '#BF7532');
    ctx.restore();
  }

  drawHead() {
    const ctx = this.ctx;
    // Main head shape (fluffy round ball)
    ctx.beginPath();
    ctx.ellipse(0, -10, 68, 62, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F3BA76'; // Golden Cockapoo fur
    ctx.fill();

    // Soft forehead shadow & top-knot fluff
    ctx.beginPath();
    ctx.ellipse(0, -56, 32, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FCE3BE'; // Cream highlights
    ctx.fill();
  }

  drawCurls() {
    // Signature Cockapoo teddy-bear curls around cheeks and forehead
    const curls = [
      { x: -48, y: -25, r: 12, c: '#E29E57' },
      { x: 48, y: -25, r: 12, c: '#E29E57' },
      { x: -35, y: -52, r: 10, c: '#F8C78B' },
      { x: 35, y: -52, r: 10, c: '#F8C78B' },
      { x: 0, y: -62, r: 13, c: '#FCE3BE' },
      { x: -52, y: 12, r: 11, c: '#E29E57' },
      { x: 52, y: 12, r: 11, c: '#E29E57' },
      { x: -28, y: -38, r: 9, c: '#F8C78B' },
      { x: 28, y: -38, r: 9, c: '#F8C78B' }
    ];

    curls.forEach(curl => {
      this.drawCurlCluster(curl.x, curl.y, curl.r, curl.c);
    });
  }

  drawCurlCluster(x, y, r, color) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawEyes() {
    const ctx = this.ctx;
    const eyeSpacing = 28;
    const eyeY = -15;

    [-eyeSpacing, eyeSpacing].forEach(ex => {
      ctx.save();
      ctx.translate(ex, eyeY);

      if (this.isBlinking) {
        // Closed / blinking eye
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.quadraticCurveTo(0, 5, 10, 0);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#2B170B';
        ctx.stroke();
      } else {
        // Big round soulful Cockapoo eyes
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#221108'; // Deep espresso brown
        ctx.fill();

        // Iris ring
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#3E1C0A';
        ctx.fill();

        // Pupil
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = '#110804';
        ctx.fill();

        // Sparkle / Gloss highlights (puppy dog eyes!)
        ctx.beginPath();
        ctx.arc(-3, -3, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3.5, 3, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      ctx.restore();
    });
  }

  drawMuzzle() {
    const ctx = this.ctx;
    // Fluffy cream muzzle (teddy bear snout)
    ctx.beginPath();
    ctx.ellipse(0, 12, 34, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FCE7C8';
    ctx.fill();

    // Whiskers dots
    ctx.fillStyle = '#D9A470';
    [-18, -12, -6, 6, 12, 18].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 15, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawNose() {
    const ctx = this.ctx;
    // Heart/oval glossy puppy nose
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1E130E';
    ctx.fill();

    // Nostrils
    ctx.beginPath();
    ctx.arc(-5, 3, 2, 0, Math.PI * 2);
    ctx.arc(5, 3, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#0B0604';
    ctx.fill();

    // Wet nose specular sheen
    ctx.beginPath();
    ctx.ellipse(-3, 0, 4, 2, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
  }

  drawMouth() {
    const ctx = this.ctx;
    const mouthY = 18;

    if (this.mouthShape === 'howl') {
      // Rounded "O" howl snout!
      ctx.beginPath();
      ctx.ellipse(0, mouthY + 6, 8, 12 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4A1212';
      ctx.fill();

      // Pink inside
      ctx.beginPath();
      ctx.ellipse(0, mouthY + 7, 5, 7 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FF7D88';
      ctx.fill();

      // Sound rings emanating from snout
      const ringPulse = (this.idleTimer * 4) % 1;
      ctx.beginPath();
      ctx.ellipse(0, mouthY + 8, 14 + ringPulse * 18, 10 + ringPulse * 14, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 165, 0, ${1 - ringPulse})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (this.mouthShape === 'bark') {
      // Wide open bark mouth
      ctx.beginPath();
      ctx.ellipse(0, mouthY + 8, 14, 15 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5A1515';
      ctx.fill();

      // Tongue
      ctx.beginPath();
      ctx.ellipse(0, mouthY + 14, 9, 8 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B7A';
      ctx.fill();
    } else if (this.mouthOpen > 0.3) {
      // Happy panting with pink tongue hanging out
      ctx.beginPath();
      ctx.moveTo(-12, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 5, 12, mouthY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2B170B';
      ctx.stroke();

      // Cute tongue
      const tongueWag = Math.sin(this.idleTimer * 6) * 1.5;
      ctx.beginPath();
      ctx.ellipse(tongueWag, mouthY + 10, 8, 11 * this.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FF7586';
      ctx.fill();

      // Tongue groove
      ctx.beginPath();
      ctx.moveTo(tongueWag, mouthY + 3);
      ctx.lineTo(tongueWag, mouthY + 12);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D94355';
      ctx.stroke();
    } else {
      // Calm, sweet Cockapoo smile
      ctx.beginPath();
      ctx.moveTo(0, 11);
      ctx.lineTo(0, mouthY);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2B170B';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-8, mouthY, 8, 0.1, Math.PI * 0.85);
      ctx.arc(8, mouthY, 8, Math.PI * 0.15, Math.PI * 0.9);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2B170B';
      ctx.stroke();
    }
  }

  drawStatusPill() {
    const ctx = this.ctx;
    const pillY = this.height - 24;
    const text = `${this.statusEmoji} ${this.statusText}`;

    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const pillWidth = Math.max(160, textWidth + 24);
    const pillX = (this.width - pillWidth) / 2;

    // Background pill
    ctx.beginPath();
    ctx.roundRect(pillX, pillY - 14, pillWidth, 26, 13);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(224, 153, 76, 0.4)';
    ctx.stroke();

    // Text
    ctx.fillStyle = '#4A2800';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.width / 2, pillY - 1);
  }
}

window.CockapooAvatar = CockapooAvatar;
