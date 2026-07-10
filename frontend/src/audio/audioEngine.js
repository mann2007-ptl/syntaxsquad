// ═══════════════════════════════════════════
// TALES BEYOND THE TOMB — Web Audio Engine
// All sounds generated procedurally, no MP3s
// ═══════════════════════════════════════════

let audioCtx = null;
let masterGain = null;
let ambienceNodes = [];
let isAmbientPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, master: masterGain };
}

// ─── UI Click Sound (tak) ───
export function playClickSound() {
  try {
    const { ctx, master } = getAudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
    
    filter.type = 'highpass';
    filter.frequency.value = 400;
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) { /* silent fail */ }
}

// ─── Hover Sound ───
export function playHoverSound() {
  try {
    const { ctx, master } = getAudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) { /* silent fail */ }
}

// ─── Menu Open Sound ───
export function playMenuSound() {
  try {
    const { ctx, master } = getAudioContext();
    
    // Low rumble
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);
    
    // Click
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(500, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.15);
  } catch (e) { /* silent fail */ }
}

// ─── Thunder Sound ───
export function playThunder() {
  try {
    const { ctx, master } = getAudioContext();
    
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.exp(-t * 1.5) * (1 + Math.random() * 0.3);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.4;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    
    source.start(ctx.currentTime);
  } catch (e) { /* silent fail */ }
}

// ─── Countdown Tick ───
export function playCountdownTick(count) {
  try {
    const { ctx, master } = getAudioContext();
    
    const freq = count <= 3 ? 600 : 400;
    const vol = count <= 3 ? 0.25 : 0.15;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    
    // Heartbeat on low counts
    if (count <= 5) {
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 50;
        gain2.gain.setValueAtTime(0.1 + (5 - count) * 0.04, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(master);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 150);
    }
  } catch (e) { /* silent fail */ }
}

// ─── Ambient Soundscape ───
export function startAmbience() {
  if (isAmbientPlaying) return;
  
  try {
    const { ctx, master } = getAudioContext();
    isAmbientPlaying = true;
    
    // Wind noise
    const windBufferSize = ctx.sampleRate * 4;
    const windBuffer = ctx.createBuffer(1, windBufferSize, ctx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    for (let i = 0; i < windBufferSize; i++) {
      windData[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;
    
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 0.5;
    
    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.15;
    windLfoGain.gain.value = 200;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();
    
    const windGain = ctx.createGain();
    windGain.gain.value = 0.06;
    
    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    windSource.start();
    
    ambienceNodes.push(windSource, windLfo);
    
    // Low drone
    const drone = ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 55;
    
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 100;
    
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.03;
    
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(master);
    drone.start();
    
    ambienceNodes.push(drone);
    
    // Sub bass pulse
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 30;
    
    const subGain = ctx.createGain();
    subGain.gain.value = 0.04;
    
    const subLfo = ctx.createOscillator();
    subLfo.type = 'sine';
    subLfo.frequency.value = 0.08;
    const subLfoGain = ctx.createGain();
    subLfoGain.gain.value = 0.03;
    subLfo.connect(subLfoGain);
    subLfoGain.connect(subGain.gain);
    subLfo.start();
    
    sub.connect(subGain);
    subGain.connect(master);
    sub.start();
    
    ambienceNodes.push(sub, subLfo);
    
    // Tape hiss
    const hissBufferSize = ctx.sampleRate * 2;
    const hissBuffer = ctx.createBuffer(1, hissBufferSize, ctx.sampleRate);
    const hissData = hissBuffer.getChannelData(0);
    for (let i = 0; i < hissBufferSize; i++) {
      hissData[i] = (Math.random() * 2 - 1);
    }
    
    const hissSource = ctx.createBufferSource();
    hissSource.buffer = hissBuffer;
    hissSource.loop = true;
    
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'highpass';
    hissFilter.frequency.value = 6000;
    
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.008;
    
    hissSource.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(master);
    hissSource.start();
    
    ambienceNodes.push(hissSource);
    
    // Random thunder
    function scheduleThunder() {
      if (!isAmbientPlaying) return;
      const delay = 15000 + Math.random() * 45000;
      setTimeout(() => {
        if (isAmbientPlaying) {
          playThunder();
          scheduleThunder();
        }
      }, delay);
    }
    scheduleThunder();
    
  } catch (e) { 
    console.error('Ambience failed:', e);
  }
}

export function stopAmbience() {
  isAmbientPlaying = false;
  ambienceNodes.forEach(node => {
    try { node.stop(); } catch (e) { /* silent */ }
  });
  ambienceNodes = [];
}

export function setMasterVolume(value) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, value));
  }
}

export function setMuted(muted) {
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.3;
  }
}

export function isAmbiencePlaying() {
  return isAmbientPlaying;
}
