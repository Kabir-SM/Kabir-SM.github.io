"use client";

import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";

type AudioRig = { context: AudioContext; gain: GainNode; sources: AudioScheduledSourceNode[]; stopVisuals: () => void };

const PARTICLE_COLORS = ["#f3f3f3"];
const NOTE = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

function seededRandom(seed = 2026) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function scheduleTone(
  context: BaseAudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  pan = 0,
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const panner = context.createStereoPanner();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(Math.sin(start * 0.71) * 3.5, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.08, duration * 0.18));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  panner.pan.value = pan;
  oscillator.connect(envelope); envelope.connect(panner); panner.connect(destination);
  oscillator.start(start); oscillator.stop(start + duration + 0.04);
}

function schedulePad(
  context: BaseAudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  pan = 0,
) {
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const envelope = context.createGain();
  const overtoneGain = context.createGain();
  const panner = context.createStereoPanner();
  oscillator.type = "sine"; overtone.type = "triangle";
  oscillator.frequency.value = frequency; overtone.frequency.value = frequency * 2;
  oscillator.detune.value = -3.5; overtone.detune.value = 4.5;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + Math.min(1.15, duration * 0.28));
  envelope.gain.setValueAtTime(volume * 0.9, start + Math.max(1.16, duration - 1.35));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  overtoneGain.gain.value = 0.14;
  panner.pan.value = pan;
  oscillator.connect(envelope); overtone.connect(overtoneGain); overtoneGain.connect(envelope);
  envelope.connect(panner); panner.connect(destination);
  oscillator.start(start); overtone.start(start);
  oscillator.stop(start + duration + 0.05); overtone.stop(start + duration + 0.05);
}

function createNoiseBuffer(context: BaseAudioContext, duration: number, random: () => number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  let smoothed = 0;
  for (let i = 0; i < data.length; i += 1) {
    smoothed = smoothed * 0.84 + (random() * 2 - 1) * 0.16;
    data[i] = smoothed;
  }
  return buffer;
}

function scheduleKick(context: BaseAudioContext, destination: AudioNode, start: number, volume: number) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(86, start);
  oscillator.frequency.exponentialRampToValueAtTime(34, start + 0.32);
  envelope.gain.setValueAtTime(volume, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.72);
  oscillator.connect(envelope); envelope.connect(destination);
  oscillator.start(start); oscillator.stop(start + 0.75);
}

function scheduleNoiseHit(
  context: BaseAudioContext,
  destination: AudioNode,
  noise: AudioBuffer,
  start: number,
  duration: number,
  frequency: number,
  volume: number,
) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = noise;
  filter.type = frequency > 5000 ? "highpass" : "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = frequency > 5000 ? 0.72 : 0.9;
  envelope.gain.setValueAtTime(volume, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter); filter.connect(envelope); envelope.connect(destination);
  source.start(start, 0, duration); source.stop(start + duration + 0.02);
}

async function createCosmicLofiLoop(sampleRate = 44100) {
  const bpm = 68;
  const beat = 60 / bpm;
  const bars = 16;
  const barDuration = beat * 4;
  const duration = bars * barDuration;
  const offline = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);
  const random = seededRandom(241019);
  const mix = offline.createGain();
  const warmth = offline.createBiquadFilter();
  const dry = offline.createGain();
  const wet = offline.createGain();
  const reverb = offline.createConvolver();
  const compressor = offline.createDynamicsCompressor();

  mix.gain.value = 0.78;
  warmth.type = "lowpass"; warmth.frequency.value = 7200; warmth.Q.value = 0.28;
  dry.gain.value = 0.88; wet.gain.value = 0.34;
  compressor.threshold.value = -19; compressor.knee.value = 26; compressor.ratio.value = 2.6;
  compressor.attack.value = 0.025; compressor.release.value = 0.72;

  const impulse = offline.createBuffer(2, Math.ceil(offline.sampleRate * 4.2), offline.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (random() * 2 - 1) * (1 - i / data.length) ** 2.7;
    }
  }
  reverb.buffer = impulse;
  mix.connect(warmth); warmth.connect(dry); warmth.connect(reverb); reverb.connect(wet);
  dry.connect(compressor); wet.connect(compressor); compressor.connect(offline.destination);

  const progressions = [
    { root: 36, chord: [48, 55, 60, 64, 71] },
    { root: 43, chord: [50, 55, 59, 62, 67] },
    { root: 45, chord: [52, 57, 60, 64, 71] },
    { root: 41, chord: [48, 53, 57, 60, 64] },
    { root: 38, chord: [45, 50, 53, 57, 64] },
    { root: 45, chord: [48, 52, 57, 60, 64] },
    { root: 41, chord: [48, 53, 57, 60, 64] },
    { root: 43, chord: [50, 55, 60, 62, 67] },
    { root: 36, chord: [48, 55, 60, 64, 71] },
    { root: 40, chord: [47, 52, 55, 59, 64] },
    { root: 45, chord: [52, 57, 60, 64, 71] },
    { root: 41, chord: [48, 53, 57, 60, 67] },
    { root: 38, chord: [45, 50, 53, 57, 64] },
    { root: 41, chord: [48, 53, 57, 60, 69] },
    { root: 43, chord: [50, 55, 59, 62, 69] },
    { root: 36, chord: [48, 55, 60, 64, 71] },
  ];
  const melodies: Array<Array<number | null>> = [
    [null, null, 72, null, null, 76, null, 79], [null, 74, null, 79, null, null, 74, null],
    [76, null, null, 79, null, 83, null, null], [72, null, 76, null, 79, null, null, 76],
    [69, null, 72, 76, null, null, 81, null], [72, 76, null, 79, null, 84, null, 81],
    [76, null, 79, 84, null, 88, 84, null], [79, null, 83, null, 86, 83, 79, null],
    [84, null, 79, null, 76, null, 79, 83], [83, 79, null, 76, null, 71, 74, null],
    [76, 79, 84, null, 83, 79, 76, null], [81, null, 84, 88, null, 84, 81, 79],
    [77, 81, null, 84, 81, 77, 72, null], [81, null, 84, 88, 89, 88, 84, null],
    [79, 83, 86, null, 91, 86, 83, 79], [84, null, 83, 79, 76, 72, null, 67],
  ];
  const noise = createNoiseBuffer(offline, 0.5, random);
  const vinyl = offline.createBufferSource();
  const vinylFilter = offline.createBiquadFilter();
  const vinylGain = offline.createGain();
  vinyl.buffer = createNoiseBuffer(offline, 2, random); vinyl.loop = true;
  vinylFilter.type = "bandpass"; vinylFilter.frequency.value = 1600; vinylFilter.Q.value = 0.18;
  vinylGain.gain.value = 0.006;
  vinyl.connect(vinylFilter); vinylFilter.connect(vinylGain); vinylGain.connect(mix);
  vinyl.start(0); vinyl.stop(duration);

  progressions.forEach(({ root, chord }, barIndex) => {
    const barStart = barIndex * barDuration;
    const rise = 0.72 + barIndex / (bars * 3.2);
    chord.forEach((midi, noteIndex) => {
      const strum = noteIndex * 0.032;
      schedulePad(offline, mix, NOTE(midi), barStart + strum, barDuration * 1.08, 0.027 * rise, (noteIndex - 2) * 0.19);
      if (barIndex >= 8 && noteIndex > 1) {
        schedulePad(offline, mix, NOTE(midi) * 2, barStart + strum + 0.08, barDuration, 0.0075 * rise, (2 - noteIndex) * 0.22);
      }
    });
    schedulePad(offline, mix, NOTE(root), barStart, barDuration * 1.06, 0.075 * rise, -0.05);
    for (let step = 0; step < 8; step += 1) {
      const arp = chord[[0, 2, 1, 3, 2, 4, 3, 1][step]] + 12;
      scheduleTone(offline, mix, NOTE(arp), barStart + step * beat * 0.5, beat * 0.42, 0.019 * rise, "triangle", step % 2 === 0 ? -0.28 : 0.28);
    }
    [0, 2].forEach((offset) => {
      scheduleTone(offline, mix, NOTE(root + 12), barStart + offset * beat, beat * 1.45, 0.052 * rise, "sine", -0.06);
    });
    melodies[barIndex].forEach((midi, step) => {
      if (midi === null) return;
      const start = barStart + step * beat * 0.5;
      const emphasis = step === 0 || step === 4 ? 1 : 0.82;
      scheduleTone(offline, mix, NOTE(midi), start, beat * 0.82, 0.029 * emphasis * rise, "sine", step % 2 === 0 ? -0.24 : 0.24);
      scheduleTone(offline, mix, NOTE(midi) * 2, start + 0.018, beat * 0.55, 0.0065 * emphasis, "triangle", step % 2 === 0 ? 0.32 : -0.32);
    });
    scheduleKick(offline, mix, barStart, 0.22 * rise);
    if (barIndex >= 4) scheduleKick(offline, mix, barStart + 2 * beat, 0.13 * rise);
    scheduleNoiseHit(offline, mix, noise, barStart + 0.04, beat * 0.78, 1150, 0.028 * rise);
    [1.5, 3.5].forEach((offset) => scheduleNoiseHit(offline, mix, noise, barStart + offset * beat, 0.11, 6800, 0.014 * rise));
  });

  const rendered = await offline.startRendering();
  let peak = 0.0001;
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    const data = rendered.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
  }
  const scale = Math.min(1.6, 0.82 / peak);
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    const data = rendered.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) data[i] *= scale;
  }
  return rendered;
}

function playInterfaceSound(context: AudioContext, destination: AudioNode, interactive: boolean) {
  if (context.state !== "running") return;
  const now = context.currentTime;
  const base = interactive ? 660 : 470;
  scheduleTone(context, destination, base, now, 0.085, interactive ? 0.09 : 0.06, "sine", -0.08);
  scheduleTone(context, destination, base * 1.5, now + 0.016, 0.14, interactive ? 0.06 : 0.04, "triangle", 0.08);
}

function startAudioVisuals(analyser: AnalyserNode) {
  const frequencies = new Uint8Array(analyser.frequencyBinCount);
  let frame = 0;
  let smoothed = 0;
  const draw = () => {
    analyser.getByteFrequencyData(frequencies);
    let energy = 0;
    const bins = Math.min(42, frequencies.length);
    for (let index = 0; index < bins; index += 1) energy += frequencies[index];
    const level = Math.min(1, energy / Math.max(1, bins * 150));
    smoothed += (level - smoothed) * 0.16;
    document.documentElement.style.setProperty("--audio-level", smoothed.toFixed(3));
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    document.documentElement.style.setProperty("--audio-level", "0");
  };
}

function startImmediateCosmicSwell(context: AudioContext, destination: AudioNode) {
  const bus = context.createGain();
  const filter = context.createBiquadFilter();
  const now = context.currentTime;
  bus.gain.setValueAtTime(0.0001, now);
  bus.gain.exponentialRampToValueAtTime(0.58, now + 0.12);
  filter.type = "lowpass"; filter.frequency.value = 2400; filter.Q.value = 0.35;
  bus.connect(filter); filter.connect(destination);
  const sources = [36, 48, 55, 60, 64].map((midi, index) => {
    const oscillator = context.createOscillator();
    const voice = context.createGain();
    const panner = context.createStereoPanner();
    oscillator.type = index < 2 ? "sine" : "triangle";
    oscillator.frequency.value = NOTE(midi);
    oscillator.detune.value = (index - 2) * 2.7;
    voice.gain.value = index < 2 ? 0.07 : 0.022;
    panner.pan.value = (index - 2) * 0.18;
    oscillator.connect(voice); voice.connect(panner); panner.connect(bus);
    oscillator.start(now);
    return oscillator;
  });
  return { bus, sources };
}

export function KineticExperience() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioRig | null>(null);
  const soundtrackRef = useRef<Promise<AudioBuffer | null> | null>(null);
  const soundtrackBufferRef = useRef<AudioBuffer | null>(null);
  const audioGenerationRef = useRef(0);
  const [soundState, setSoundState] = useState<"off" | "on">("off");
  const [scrollPercent, setScrollPercent] = useState(0);
  const [chapter, setChapter] = useState("ORIGIN");

  useEffect(() => {
    let pointerFrame = 0;
    let scrollFrame = 0;
    let pointerClientX = 0;
    let pointerClientY = 0;
    const commitPointer = () => {
      pointerFrame = 0;
      const pointerX = (pointerClientX / window.innerWidth) * 2 - 1;
      const pointerY = (pointerClientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--pointer-x", pointerX.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", pointerY.toFixed(3));
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${pointerClientX}px, ${pointerClientY}px, 0)`;
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(commitPointer);
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      const label = target?.dataset.cursor ?? "";
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.classList.toggle("is-context", Boolean(label));
      const cursorText = cursor.querySelector("span");
      if (cursorText) cursorText.textContent = label;
    };
    const commitScroll = () => {
      scrollFrame = 0;
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maximum));
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
      setScrollPercent(Math.round(progress * 100));
      const labels = ["ORIGIN", "WORK", "EXPERIENCE", "ABOUT", "CONTACT"];
      setChapter(labels[Math.min(labels.length - 1, Math.floor(progress * labels.length))]);
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(commitScroll); };
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".section, .contact-section").forEach((node) => revealObserver.observe(node));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    commitScroll();
    return () => {
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      revealObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--pointer-x");
      document.documentElement.style.removeProperty("--pointer-y");
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);

  useEffect(() => {
    const prepareSoundtrack = () => {
      if (soundtrackRef.current) return;
      soundtrackRef.current = createCosmicLofiLoop(44100)
        .then((buffer) => { soundtrackBufferRef.current = buffer; return buffer; })
        .catch(() => null);
    };
    const prepareTimer = window.setTimeout(prepareSoundtrack, 250);
    return () => {
      window.clearTimeout(prepareTimer);
      audioGenerationRef.current += 1;
      if (audioRef.current) {
        audioRef.current.stopVisuals();
        void audioRef.current.context.close();
      }
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rig = audioRef.current;
      if (!rig) return;
      const target = event.target instanceof Element ? event.target : null;
      const interactive = Boolean(target?.closest("a, button, input, select, textarea, summary, [role='button']"));
      if (rig.context.state === "suspended") {
        void rig.context.resume().then(() => playInterfaceSound(rig.context, rig.gain, interactive)).catch(() => undefined);
      } else {
        playInterfaceSound(rig.context, rig.gain, interactive);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (soundState !== "on") return;
    const onVisibilityChange = () => {
      const context = audioRef.current?.context;
      if (!context || context.state === "closed") return;
      if (document.hidden) void context.suspend();
      else void context.resume();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [soundState]);

  const toggleSound = async () => {
    if (audioRef.current) {
      audioGenerationRef.current += 1;
      const rig = audioRef.current; const now = rig.context.currentTime;
      rig.stopVisuals();
      rig.gain.gain.cancelScheduledValues(now); rig.gain.gain.setValueAtTime(rig.gain.gain.value, now);
      rig.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      rig.sources.forEach((source) => { try { source.stop(now + 0.85); } catch { /* already stopped */ } });
      audioRef.current = null; setSoundState("off"); window.setTimeout(() => void rig.context.close(), 900); return;
    }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const generation = audioGenerationRef.current + 1;
    audioGenerationRef.current = generation;
    const context: AudioContext = new AudioContextClass();
    try {
      await context.resume();
      const master = context.createGain();
      const trackGain = context.createGain();
      const analyser = context.createAnalyser();
      const compressor = context.createDynamicsCompressor();
      master.gain.value = 0.84;
      trackGain.gain.value = 0.0001;
      compressor.threshold.value = -13; compressor.knee.value = 20; compressor.ratio.value = 3.2;
      compressor.attack.value = 0.015; compressor.release.value = 0.5;
      analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.86;
      trackGain.connect(master); master.connect(analyser); analyser.connect(compressor); compressor.connect(context.destination);
      const intro = startImmediateCosmicSwell(context, master);
      const rig: AudioRig = { context, gain: master, sources: [...intro.sources], stopVisuals: startAudioVisuals(analyser) };
      audioRef.current = rig;
      setSoundState("on");
      playInterfaceSound(context, master, true);

      const soundtrackPromise = soundtrackRef.current ?? createCosmicLofiLoop(context.sampleRate);
      soundtrackRef.current = soundtrackPromise;
      const soundtrack = soundtrackBufferRef.current ?? await soundtrackPromise;
      if (!soundtrack || audioRef.current !== rig || audioGenerationRef.current !== generation) return;
      const lofiSource = context.createBufferSource();
      lofiSource.buffer = soundtrack; lofiSource.loop = true; lofiSource.connect(trackGain);
      const now = context.currentTime;
      trackGain.gain.cancelScheduledValues(now);
      trackGain.gain.setValueAtTime(0.18, now);
      trackGain.gain.exponentialRampToValueAtTime(0.96, now + 1.2);
      intro.bus.gain.cancelScheduledValues(now);
      intro.bus.gain.setValueAtTime(intro.bus.gain.value, now);
      intro.bus.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
      lofiSource.start(now);
      rig.sources.push(lofiSource);
      intro.sources.forEach((source) => { try { source.stop(now + 1.3); } catch { /* already stopped */ } });
    } catch {
      if (audioRef.current?.context === context) audioRef.current.stopVisuals();
      await context.close();
      document.documentElement.style.setProperty("--audio-level", "0");
      audioRef.current = null;
      setSoundState("off");
    }
  };

  return (
    <div className="kinetic-experience">
      <div className="particles-background" aria-hidden="true">
        <Particles
          particleColors={PARTICLE_COLORS}
          particleCount={700}
          particleSpread={10}
          speed={0.32}
          particleBaseSize={200}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio="1"
        />
      </div>
      <div ref={cursorRef} className="kinetic-cursor" aria-hidden="true"><span /></div>
      <div className="renderer-badge" aria-label="Interactive particle field active"><span className="renderer-dot" />PARTICLES</div>
      <button className={`sound-toggle ${soundState === "on" ? "is-on" : ""}`} type="button" aria-label={soundState === "on" ? "Turn cinematic soundtrack off" : "Turn cinematic soundtrack on"} aria-pressed={soundState === "on"} onClick={() => void toggleSound()} title="Warm cosmic soundtrack and interface sounds">
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>COSMIC: {soundState.toUpperCase()}</span>
      </button>
      <div className="experience-progress" aria-hidden="true">
        <span>{String(scrollPercent).padStart(2, "0")}</span><span className="progress-rail"><i style={{ height: `${scrollPercent}%` }} /></span><strong>{chapter}</strong>
      </div>
      <div className="interaction-guide" aria-hidden="true">MOVE / SCROLL TO SHIFT THE PARTICLE FIELD</div>
    </div>
  );
}
