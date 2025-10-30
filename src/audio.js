// Lightweight shared audio helper for ticking and chimes
(function () {
  let audioCtx = null;
  let bg = {
    element: null,
    source: null,
    gain: null,
    currentKey: 'none'
  };

  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playTick() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, now); // ~1kHz click
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  function playChime() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    // two-note soft ding
    const notes = [880, 660];
    notes.forEach((freq, i) => {
      const start = now + i * 0.12;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  function isEnabled(key) {
    return localStorage.getItem(key) === 'true';
  }

  window.audio = {
    ensure: ensureAudio,
    tickIfEnabled: function () {
      if (isEnabled('tickSound')) {
        ensureAudio();
        playTick();
      }
    },
    chimeIfEnabled: function () {
      if (isEnabled('chimeSound')) {
        ensureAudio();
        playChime();
      }
    },
    background: {
      start: function () {
        const selected = (localStorage.getItem('backgroundMusic') || 'none');
        if (selected === 'none') { this.stop(); return; }
        const map = {
          forest: 'assets/audio/forest.mp3',
          rain: 'assets/audio/rain.mp3',
          ocean: 'assets/audio/ocean.mp3'
        };
        const src = map[selected];
        if (!src) { this.stop(); return; }

        ensureAudio();
        if (!audioCtx) return;

        // Recreate chain if key changed or missing
        if (!bg.element || bg.currentKey !== selected) {
          // Cleanup old
          try { if (bg.source) bg.source.disconnect(); } catch (e) {}
          try { if (bg.gain) bg.gain.disconnect(); } catch (e) {}

          const el = new Audio();
          el.src = src;
          el.loop = true;
          el.crossOrigin = 'anonymous';

          const source = audioCtx.createMediaElementSource(el);
          const gain = audioCtx.createGain();
          gain.gain.value = 0.0001; // start silent for fade-in
          source.connect(gain).connect(audioCtx.destination);

          bg.element = el;
          bg.source = source;
          bg.gain = gain;
          bg.currentKey = selected;
        }

        // Play and fade in
        const now = audioCtx.currentTime;
        try { bg.element.play().catch(() => {}); } catch (e) {}
        bg.gain.gain.cancelScheduledValues(now);
        bg.gain.gain.setValueAtTime(Math.max(0.0001, bg.gain.gain.value), now);
        bg.gain.gain.exponentialRampToValueAtTime(0.4, now + 0.6); // louder background level
      },
      stop: function () {
        if (!audioCtx || !bg.element || !bg.gain) return;
        const now = audioCtx.currentTime;
        bg.gain.gain.cancelScheduledValues(now);
        bg.gain.gain.setValueAtTime(Math.max(0.0001, bg.gain.gain.value), now);
        bg.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        // pause slightly after fade
        setTimeout(() => { try { bg.element.pause(); } catch (e) {} }, 450);
      },
      refreshSelection: function () {
        // If selection changed during run, restart with new track
        const selected = (localStorage.getItem('backgroundMusic') || 'none');
        if (selected !== bg.currentKey) {
          this.stop();
          this.start();
        }
      }
    }
  };
})();


