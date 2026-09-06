/**
 * Cockapoo Soundboard Application Controller (Simple & Focused)
 */

document.addEventListener('DOMContentLoaded', () => {
  const audio = window.CockapooAudio;
  const photoEl = document.getElementById('cockapoo-photo');
  const ringEl = document.getElementById('reaction-ring');
  const pillEl = document.getElementById('status-pill');
  const statusEmoji = document.getElementById('status-emoji');
  const statusText = document.getElementById('status-text');
  const pictureWrapper = document.getElementById('picture-wrapper');

  function setStatus(emoji, text, highlight = true) {
    if (statusEmoji) statusEmoji.textContent = emoji;
    if (statusText) statusText.textContent = text;
    if (pillEl) {
      if (highlight) pillEl.classList.add('highlight');
      else pillEl.classList.remove('highlight');
    }
  }

  // Reactive picture animations when sounds play
  audio.onSoundStart = (name, category, meta) => {
    if (ringEl) {
      ringEl.classList.remove('ring-active');
      void ringEl.offsetWidth; // re-trigger animation
      ringEl.classList.add('ring-active');
    }

    if (photoEl) {
      photoEl.classList.remove('tilt-left', 'tilt-right', 'head-up', 'bark-bounce');
      if (name === 'curious_boof') {
        photoEl.classList.add('tilt-left');
        setStatus('🧐', 'Curious Boof! Head tilted!');
      } else if (name === 'squeak') {
        photoEl.classList.add('tilt-right');
        setStatus('🧸', 'SQUEAKER! Head tilted!');
      } else if (name === 'howl') {
        photoEl.classList.add('head-up');
        setStatus('🎶', 'AWOOO! Singing along!');
      } else if (name === 'puppy_yip') {
        photoEl.classList.add('tilt-left');
        setStatus('🐾', 'Puppy Yip! Perked ears!');
      } else {
        photoEl.classList.add('bark-bounce');
        setStatus('🗣️', 'Woof! Barking back!');
      }
    }
  };

  audio.onSoundEnd = () => {
    setTimeout(() => {
      if (photoEl) photoEl.classList.remove('tilt-left', 'tilt-right', 'head-up', 'bark-bounce');
      setStatus('🐶', 'Listening attentively...', false);
    }, 450);
  };

  // Tap on photo to interact & play happy yip
  if (pictureWrapper) {
    pictureWrapper.addEventListener('click', () => {
      audio.playPuppyYip();
      highlightCard('puppy-yip');
      setStatus('✨', 'Good dog! *happy wiggles*');
    });
  }

  // Audio mappings
  const actions = {
    'classic-bark': () => audio.playClassicBark(),
    'double-bark': () => audio.playDoubleBark(),
    'puppy-yip': () => audio.playPuppyYip(),
    'curious-boof': () => audio.playCuriousBoof(),
    'deep-woof': () => audio.playDeepWoof(),
    'alert-bark': () => audio.playAlertBark(),
    'squeak': () => audio.playSqueak(),
    'howl': () => audio.playHowl()
  };

  // Sound buttons click handler
  document.querySelectorAll('[data-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      const soundKey = btn.getAttribute('data-sound');
      if (actions[soundKey]) {
        actions[soundKey]();
        flashButton(btn);
      }
    });
  });

  // Head-Tilt Quick Combo sequence
  const comboBtn = document.getElementById('combo-btn');
  let comboRunning = false;

  if (comboBtn) {
    comboBtn.addEventListener('click', async () => {
      if (comboRunning) return;
      comboRunning = true;
      comboBtn.classList.add('running');
      comboBtn.textContent = '⏳ Playing...';

      // 1. Curious Boof
      audio.playCuriousBoof();
      highlightCard('curious-boof');

      // 2. Squeaky Toy after 850ms
      setTimeout(() => {
        audio.playSqueak();
        highlightCard('squeak');
      }, 850);

      // 3. Double Bark after 1550ms
      setTimeout(() => {
        audio.playDoubleBark();
        highlightCard('double-bark');
      }, 1550);

      // Reset button after 2800ms
      setTimeout(() => {
        comboRunning = false;
        comboBtn.classList.remove('running');
        comboBtn.textContent = '▶️ Play Combo';
      }, 2800);
    });
  }

  function highlightCard(soundKey) {
    const card = document.querySelector(`[data-sound="${soundKey}"]`);
    if (card) flashButton(card);
  }

  function flashButton(el) {
    el.classList.add('card-active');
    setTimeout(() => el.classList.remove('card-active'), 250);
  }

  // Pitch Slider (Dog size adjustment)
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchDisplay = document.getElementById('pitch-display');

  if (pitchSlider && pitchDisplay) {
    pitchSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.setPitchMultiplier(val);
      if (val < 0.88) {
        pitchDisplay.textContent = `${val.toFixed(2)}x (Big Dog)`;
      } else if (val > 1.12) {
        pitchDisplay.textContent = `${val.toFixed(2)}x (Puppy)`;
      } else {
        pitchDisplay.textContent = 'Cockapoo (Normal)';
      }
    });
  }

  // Volume Slider
  const volumeSlider = document.getElementById('volume-slider');
  const volumeDisplay = document.getElementById('volume-display');

  if (volumeSlider && volumeDisplay) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.setMasterVolume(val);
      volumeDisplay.textContent = `${Math.round(val * 100)}%`;
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      audio.playSqueak();
      highlightCard('squeak');
    } else if (e.key === '1') {
      audio.playClassicBark();
      highlightCard('classic-bark');
    } else if (e.key === '2') {
      audio.playDoubleBark();
      highlightCard('double-bark');
    } else if (e.key === '3') {
      audio.playPuppyYip();
      highlightCard('puppy-yip');
    } else if (e.key === '4') {
      audio.playCuriousBoof();
      highlightCard('curious-boof');
    } else if (e.key === '5') {
      audio.playDeepWoof();
      highlightCard('deep-woof');
    } else if (e.key === '6') {
      audio.playAlertBark();
      highlightCard('alert-bark');
    } else if (e.key.toLowerCase() === 'h') {
      audio.playHowl();
      highlightCard('howl');
    }
  });
});
