/**
 * Doggie Soundboard Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const audio = window.CockapooAudio;
  const photoEl = document.getElementById('dog-photo');
  const ringEl = document.getElementById('reaction-ring');
  const pillEl = document.getElementById('status-pill');
  const statusEmoji = document.getElementById('status-emoji');
  const statusText = document.getElementById('status-text');
  const pictureWrapper = document.getElementById('picture-wrapper');
  const dogBreedSelect = document.getElementById('dog-breed-select');
  const breedDescription = document.getElementById('breed-description');
  const breedSoundBtn = document.getElementById('breed-sound-btn');
  const comboBtn = document.getElementById('combo-btn');
  const dogProfiles = window.DOG_PROFILES || [];
  let currentDogProfile = null;
  let comboRunning = false;
  let comboRunId = 0;
  let comboWait = null;

  function setStatus(emoji, text, highlight = true) {
    if (statusEmoji) statusEmoji.textContent = emoji;
    if (statusText) statusText.textContent = text;
    if (pillEl) {
      if (highlight) pillEl.classList.add('highlight');
      else pillEl.classList.remove('highlight');
    }
  }

  function stopPlayback() {
    audio.stopActivePlayback();
    comboRunId++;
    if (comboWait) {
      clearTimeout(comboWait.timer);
      comboWait.resolve();
      comboWait = null;
    }
    comboRunning = false;
    if (comboBtn) {
      comboBtn.classList.remove('running');
      comboBtn.textContent = '▶️ Play Random Combos';
    }
  }

  function waitForComboStep(duration) {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        comboWait = null;
        resolve();
      }, duration * 1000 + 150);
      comboWait = { timer, resolve };
    });
  }

    const allAnimClasses = [
      'tilt-left', 'tilt-right', 'head-up', 'bark-bounce',
      'double-bark-shake', 'deep-woof-shake', 'alert-perk',
      'happy-wiggle', 'puppy-scale', 'bigdog-scale'
    ];

    function clearPhotoAnims() {
      if (photoEl) photoEl.classList.remove(...allAnimClasses);
    }

    // Reactive picture animations when sounds play
    audio.onSoundStart = (name, category, meta) => {
      if (ringEl) {
        ringEl.classList.remove('ring-active');
        void ringEl.offsetWidth; // re-trigger animation
        ringEl.classList.add('ring-active');
      }

      if (photoEl) {
        clearPhotoAnims();
        void photoEl.offsetWidth; // force re-flow for animation reset

        if (name === 'breed_bark') {
          photoEl.classList.add('bark-bounce');
          setStatus('🐕', `${currentDogProfile?.name || 'Dog'} bark sample playing!`);
        } else if (name === 'curious_boof') {
          photoEl.classList.add('tilt-left');
          setStatus('🧐', 'Curious Boof! Head tilted left!');
        } else if (category === 'squeak') {
          photoEl.classList.add('tilt-right');
          const squeakStatus = {
            squeak: 'Classic squeak! Head tilted right!',
            double_squeak: 'Double squeak! Ears perked!',
            squeak_burst: 'Squeak burst! Ready to play!',
            rubber_duck: 'Rubber duck squeak!',
            wheezy_squeak: 'Wheezy squeak!'
          };
          setStatus('🧸', squeakStatus[name] || 'SQUEAKER! Head tilted right!');
        } else if (name === 'howl') {
          photoEl.classList.add('head-up');
          setStatus('🐕', 'Real dog howl playing!');
        } else if (name === 'puppy_yip') {
          photoEl.classList.add('happy-wiggle');
          setStatus('🐾', 'Puppy Yip! Perked & happy!');
        } else if (name === 'double_bark') {
          photoEl.classList.add('double-bark-shake');
          setStatus('🐶', 'Double Bark! Double bounce!');
        } else if (name === 'deep_woof') {
          photoEl.classList.add('deep-woof-shake');
          setStatus('🐕', 'Deep Woof! Big dog rumble!');
        } else if (name === 'alert_bark') {
          photoEl.classList.add('alert-perk');
          setStatus('🚨', 'Alert Bark! Ears up & alert!');
        } else {
          photoEl.classList.add('bark-bounce');
          setStatus('🗣️', 'Woof! Barking back!');
        }
      }
    };

    audio.onSoundEnd = () => {
      setTimeout(() => {
        clearPhotoAnims();
        setStatus('🐶', 'Listening attentively...', false);
      }, 450);
    };

    // Tap on photo to interact & play happy wiggle yip
    if (pictureWrapper) {
      pictureWrapper.addEventListener('click', () => {
        stopPlayback();
        audio.playPuppyYip();
        highlightCard('puppy-yip');
        clearPhotoAnims();
        if (photoEl) photoEl.classList.add('happy-wiggle');
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
    'double-squeak': () => audio.playDoubleSqueak(),
    'squeak-burst': () => audio.playSqueakBurst(),
    'rubber-duck': () => audio.playRubberDuck(),
    'wheezy-squeak': () => audio.playWheezySqueak(),
    'howl': () => audio.playHowl()
  };

  if (breedSoundBtn) {
    breedSoundBtn.addEventListener('click', () => {
      if (!currentDogProfile) return;
      stopPlayback();
      audio.playBreedBark(currentDogProfile.soundKey, currentDogProfile.soundOffset || 0);
      flashButton(breedSoundBtn);
    });
  }

  const shortcutButtons = new Map();

  // Sound buttons click handler
  document.querySelectorAll('[data-sound]').forEach(btn => {
    const shortcut = btn.dataset.shortcut?.toLowerCase();
    const badge = btn.querySelector('.key-badge');
    if (shortcut) shortcutButtons.set(shortcut, btn);
    if (badge && shortcut) badge.textContent = shortcut === 'space' ? 'Space' : shortcut.toUpperCase();

    btn.addEventListener('click', () => {
      const soundKey = btn.getAttribute('data-sound');
      if (actions[soundKey]) {
          stopPlayback();
        actions[soundKey]();
        flashButton(btn);
      }
    });
  });

  // Head-Tilt Quick Combo sequence
  if (comboBtn) {
    comboBtn.addEventListener('click', () => {
      if (comboRunning) {
        stopPlayback();
        return;
      }
      stopPlayback();
      const runId = comboRunId;
      comboRunning = true;
      comboBtn.classList.add('running');
      comboBtn.textContent = '⏳ Playing...';

      const sounds = Object.keys(actions);
      for (let index = sounds.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [sounds[index], sounds[swapIndex]] = [sounds[swapIndex], sounds[index]];
      }
      const combo = sounds.slice(0, 3 + Math.floor(Math.random() * 3));

      const playCombo = async () => {
        try {
          for (const soundKey of combo) {
            if (runId !== comboRunId) return;
            const duration = await actions[soundKey]();
            if (runId !== comboRunId) return;
            highlightCard(soundKey);
            await waitForComboStep(duration || 0.5);
          }
        } catch (error) {
          console.error('Could not play random sound combo:', error);
        } finally {
          if (runId === comboRunId) {
            comboRunning = false;
            comboBtn.classList.remove('running');
            comboBtn.textContent = '▶️ Play Random Combos';
          }
        }
      };

      playCombo();
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
      if (val < 1) {
        pitchDisplay.textContent = `${val.toFixed(2)}x (Lower)`;
      } else if (val > 1) {
        pitchDisplay.textContent = `${val.toFixed(2)}x (Higher)`;
      } else {
        pitchDisplay.textContent = 'Normal (1.00x)';
      }
    });
  }

  if (dogBreedSelect) {
    dogBreedSelect.addEventListener('change', () => {
      const profile = dogProfiles.find(item => item.id === dogBreedSelect.value);
      if (!profile) return;

      stopPlayback();
      currentDogProfile = profile;
      photoEl.src = window.createDogPortrait(profile);
      photoEl.alt = profile.name;
      if (breedDescription) breedDescription.textContent = profile.description;
      if (breedSoundBtn) breedSoundBtn.textContent = `Hear ${profile.soundLabel}`;
      pitchSlider.value = profile.pitch;
      pitchSlider.dispatchEvent(new Event('input', { bubbles: true }));
      setStatus('🐶', `${profile.name} selected. Choose a sound to play.` , false);
    });
  }

  if (dogBreedSelect && dogProfiles.length) {
    dogBreedSelect.dispatchEvent(new Event('change'));
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
    const key = e.code === 'Space' ? 'space' : e.key.toLowerCase();
    const btn = shortcutButtons.get(key);
    if (!btn) return;
    const soundKey = btn.dataset.sound;
    stopPlayback();
    if (key === 'space') e.preventDefault();
    actions[soundKey]();
    flashButton(btn);
  });
});
