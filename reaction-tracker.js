/**
 * Cockapoo Reaction Tracker
 * Records dog responses (Head-Tilt, Perked Ears, Barked Back, Howled Along, Ran Over)
 * to discover the top triggers for your specific dog.
 */
class ReactionTracker {
  constructor() {
    this.storageKey = 'cockapoo_reactions_data_v1';
    this.data = this.loadData();
    this.lastTriggeredSound = 'happy_bark';
    this.reactionTypes = [
      { id: 'tilt', label: 'Tilted Head!', icon: '🐶', color: '#ff9f43' },
      { id: 'ears', label: 'Perked Ears!', icon: '👂', color: '#10ac84' },
      { id: 'vocal', label: 'Barked Back!', icon: '🗣️', color: '#ee5253' },
      { id: 'howl', label: 'Howled Along!', icon: '🎶', color: '#5f27cd' },
      { id: 'ran', label: 'Ran Over to Me!', icon: '🐾', color: '#0abde3' },
      { id: 'ignored', label: 'No Reaction', icon: '😴', color: '#8395a7' }
    ];

    // Listen to sound triggers
    if (window.CockapooAudio) {
      const prevOnStart = window.CockapooAudio.onSoundStart;
      window.CockapooAudio.onSoundStart = (name, type, meta) => {
        if (prevOnStart) prevOnStart(name, type, meta);
        this.setLastSound(name);
      };
    }
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load reaction history", e);
    }
    return {
      history: [],
      soundScores: {},
      reactionCounts: { tilt: 0, ears: 0, vocal: 0, howl: 0, ran: 0, ignored: 0 }
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save reaction data", e);
    }
  }

  setLastSound(soundId) {
    this.lastTriggeredSound = soundId;
    const currentIndicator = document.getElementById('current-testing-sound');
    if (currentIndicator) {
      currentIndicator.textContent = this.formatSoundName(soundId);
    }
  }

  logReaction(reactionId) {
    const sound = this.lastTriggeredSound || 'unknown';
    const entry = {
      sound,
      reaction: reactionId,
      timestamp: new Date().toISOString()
    };

    this.data.history.unshift(entry);
    if (this.data.history.length > 100) this.data.history.pop();

    if (!this.data.soundScores[sound]) {
      this.data.soundScores[sound] = { total: 0, hits: 0 };
    }
    this.data.soundScores[sound].total++;
    if (reactionId !== 'ignored') {
      this.data.soundScores[sound].hits++;
    }

    this.data.reactionCounts[reactionId] = (this.data.reactionCounts[reactionId] || 0) + 1;
    this.saveData();
    this.render();
    this.triggerCheer(reactionId);
  }

  triggerCheer(reactionId) {
    const badge = document.getElementById('reaction-toast');
    if (!badge) return;
    const reaction = this.reactionTypes.find(r => r.id === reactionId);
    badge.textContent = `${reaction.icon} Recorded: ${reaction.label}!`;
    badge.classList.add('visible');
    setTimeout(() => {
      badge.classList.remove('visible');
    }, 2000);
  }

  getTopSound() {
    let topSound = null;
    let maxHits = 0;
    for (const [sound, score] of Object.entries(this.data.soundScores)) {
      if (score.hits > maxHits) {
        maxHits = score.hits;
        topSound = sound;
      }
    }
    return topSound ? { sound: topSound, hits: maxHits } : null;
  }

  formatSoundName(id) {
    if (!id) return "None yet";
    return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  clearHistory() {
    this.data = {
      history: [],
      soundScores: {},
      reactionCounts: { tilt: 0, ears: 0, vocal: 0, howl: 0, ran: 0, ignored: 0 }
    };
    this.saveData();
    this.render();
  }

  render() {
    // Update stats in UI
    const topSoundEl = document.getElementById('top-sound-name');
    const totalTiltsEl = document.getElementById('total-tilts-count');
    const totalVocalEl = document.getElementById('total-vocal-count');
    const historyListEl = document.getElementById('reaction-history-list');

    const top = this.getTopSound();
    if (topSoundEl) {
      topSoundEl.textContent = top ? `${this.formatSoundName(top.sound)} (${top.hits} responses)` : "Play sounds to find out!";
    }
    if (totalTiltsEl) {
      totalTiltsEl.textContent = this.data.reactionCounts.tilt || 0;
    }
    if (totalVocalEl) {
      totalVocalEl.textContent = (this.data.reactionCounts.vocal || 0) + (this.data.reactionCounts.howl || 0);
    }

    if (historyListEl) {
      if (this.data.history.length === 0) {
        historyListEl.innerHTML = `<p class="empty-history">No reactions logged yet. Tap a sound, then log how your Cockapoo responded!</p>`;
      } else {
        historyListEl.innerHTML = this.data.history.slice(0, 6).map(item => {
          const rObj = this.reactionTypes.find(r => r.id === item.reaction) || { icon: '🐾', label: item.reaction };
          const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="history-item">
              <span class="history-icon">${rObj.icon}</span>
              <span class="history-desc"><strong>${this.formatSoundName(item.sound)}</strong> → ${rObj.label}</span>
              <span class="history-time">${time}</span>
            </div>
          `;
        }).join('');
      }
    }
  }
}

window.ReactionTracker = ReactionTracker;
