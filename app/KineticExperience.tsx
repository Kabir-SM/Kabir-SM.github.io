"use client";

import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";

type AudioRig = { context: AudioContext; gain: GainNode; sources: AudioScheduledSourceNode[] };

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
  oscillator.frequency.setValueAtTime(112, start);
  oscillator.frequency.exponentialRampToValueAtTime(43, start + 0.16);
  envelope.gain.setValueAtTime(volume, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
  oscillator.connect(envelope); envelope.connect(destination);
  oscillator.start(start); oscillator.stop(start + 0.34);
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

async function createAnimeLofiLoop(context: AudioContext) {
  const bpm = 78;
  const beat = 60 / bpm;
  const bars = 16;
  const barDuration = beat * 4;
  const duration = bars * barDuration;
  const offline = new OfflineAudioContext(2, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const random = seededRandom();
  const mix = offline.createGain();
  const warmth = offline.createBiquadFilter();
  const dry = offline.createGain();
  const wet = offline.createGain();
  const reverb = offline.createConvolver();
  const compressor = offline.createDynamicsCompressor();

  mix.gain.value = 0.82;
  warmth.type = "lowpass"; warmth.frequency.value = 5200; warmth.Q.value = 0.35;
  dry.gain.value = 0.92; wet.gain.value = 0.18;
  compressor.threshold.value = -17; compressor.knee.value = 22; compressor.ratio.value = 3.2;
  compressor.attack.value = 0.018; compressor.release.value = 0.48;

  const impulse = offline.createBuffer(2, Math.ceil(offline.sampleRate * 2.4), offline.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (random() * 2 - 1) * (1 - i / data.length) ** 3.3;
    }
  }
  reverb.buffer = impulse;
  mix.connect(warmth); warmth.connect(dry); warmth.connect(reverb); reverb.connect(wet);
  dry.connect(compressor); wet.connect(compressor); compressor.connect(offline.destination);

  const progressions = [
    { root: 48, chord: [60, 64, 67, 71, 74] },
    { root: 40, chord: [59, 62, 64, 67, 71] },
    { root: 45, chord: [57, 60, 64, 67, 71] },
    { root: 41, chord: [57, 60, 64, 67, 69] },
    { root: 50, chord: [57, 60, 64, 65, 69] },
    { root: 43, chord: [59, 62, 65, 69, 71] },
    { root: 48, chord: [60, 64, 67, 71, 74] },
    { root: 40, chord: [56, 59, 62, 64, 69] },
    { root: 45, chord: [57, 60, 64, 67, 71] },
    { root: 50, chord: [57, 60, 64, 66, 71] },
    { root: 43, chord: [59, 62, 66, 69, 74] },
    { root: 48, chord: [60, 64, 67, 71, 74] },
    { root: 41, chord: [57, 60, 64, 67, 69] },
    { root: 40, chord: [55, 59, 62, 67, 71] },
    { root: 50, chord: [57, 60, 64, 65, 69] },
    { root: 43, chord: [59, 62, 65, 69, 74] },
  ];
  const melodies: Array<Array<number | null>> = [
    [76, null, 79, 81, 83, null, 79, 76], [74, 76, 79, null, 76, 74, null, 71],
    [72, 76, 79, 83, null, 81, 79, 76], [76, 74, 72, null, 69, 72, 74, null],
    [69, 72, 76, null, 77, 76, 72, 69], [71, 74, 77, 81, null, 79, 77, 74],
    [76, null, 79, 83, 86, 83, 81, null], [80, 83, 86, null, 83, 80, 76, null],
    [76, 79, 83, null, 84, 83, 79, 76], [78, 81, 83, 86, null, 83, 81, 78],
    [74, 78, 81, null, 86, 83, 81, 78], [76, null, 79, 81, 83, 86, 83, null],
    [81, 79, 76, null, 72, 76, 79, 81], [79, 74, 71, null, 74, 79, 83, null],
    [76, 77, 81, null, 84, 81, 77, 76], [74, 77, 81, 83, 86, null, 81, 74],
  ];
  const noise = createNoiseBuffer(offline, 0.5, random);
  const vinyl = offline.createBufferSource();
  const vinylFilter = offline.createBiquadFilter();
  const vinylGain = offline.createGain();
  vinyl.buffer = createNoiseBuffer(offline, 2, random); vinyl.loop = true;
  vinylFilter.type = "bandpass"; vinylFilter.frequency.value = 1900; vinylFilter.Q.value = 0.22;
  vinylGain.gain.value = 0.012;
  vinyl.connect(vinylFilter); vinylFilter.connect(vinylGain); vinylGain.connect(mix);
  vinyl.start(0); vinyl.stop(duration);

  progressions.forEach(({ root, chord }, barIndex) => {
    const barStart = barIndex * barDuration;
    chord.forEach((midi, noteIndex) => {
      const strum = noteIndex * 0.018;
      scheduleTone(offline, mix, NOTE(midi), barStart + strum, barDuration * 0.94, 0.032, "sine", (noteIndex - 2) * 0.16);
      scheduleTone(offline, mix, NOTE(midi) * 2, barStart + strum, beat * 1.15, 0.008, "triangle", (2 - noteIndex) * 0.12);
    });
    [0, 2, 3.5].forEach((offset, index) => {
      if (index === 2 && barIndex % 4 !== 3) return;
      scheduleTone(offline, mix, NOTE(root), barStart + offset * beat, beat * (index === 2 ? 0.42 : 0.82), 0.085, "sine", -0.04);
    });
    melodies[barIndex].forEach((midi, step) => {
      if (midi === null) return;
      const start = barStart + step * beat * 0.5 + (step % 3 === 0 ? 0.018 : 0);
      const emphasis = step === 0 || step === 4 ? 1 : 0.76;
      scheduleTone(offline, mix, NOTE(midi), start, beat * 0.43, 0.035 * emphasis, "triangle", step % 2 === 0 ? -0.22 : 0.22);
      scheduleTone(offline, mix, NOTE(midi) * 2, start, beat * 0.3, 0.006 * emphasis, "sine", step % 2 === 0 ? 0.28 : -0.28);
    });
    [0, 2.5].forEach((offset) => scheduleKick(offline, mix, barStart + offset * beat, 0.23));
    if (barIndex % 4 === 3) scheduleKick(offline, mix, barStart + 3.5 * beat, 0.14);
    [1, 3].forEach((offset) => {
      scheduleNoiseHit(offline, mix, noise, barStart + offset * beat, 0.24, 1700, 0.085);
      scheduleTone(offline, mix, 184, barStart + offset * beat, 0.14, 0.018, "triangle", 0.08);
    });
    for (let step = 0; step < 8; step += 1) {
      if ((barIndex + step) % 7 === 0) continue;
      scheduleNoiseHit(offline, mix, noise, barStart + step * beat * 0.5 + (step % 2 ? 0.012 : 0), 0.055, 7600, step % 2 ? 0.022 : 0.015);
    }
  });

  const rendered = await offline.startRendering();
  let peak = 0.0001;
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    const data = rendered.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
  }
  const scale = Math.min(1.45, 0.78 / peak);
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    const data = rendered.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) data[i] *= scale;
  }
  return rendered;
}

function playInterfaceSound(context: AudioContext, destination: AudioNode, interactive: boolean) {
  if (context.state !== "running") return;
  const now = context.currentTime;
  const base = interactive ? 620 : 430;
  scheduleTone(context, destination, base, now, 0.075, interactive ? 0.038 : 0.022, "sine", -0.08);
  scheduleTone(context, destination, base * 1.5, now + 0.018, 0.11, interactive ? 0.026 : 0.014, "triangle", 0.08);
}

export function KineticExperience() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioRig | null>(null);
  const startingAudioRef = useRef(false);
  const [soundState, setSoundState] = useState<"off" | "loading" | "on">("off");
  const [scrollPercent, setScrollPercent] = useState(0);
  const [chapter, setChapter] = useState("ORIGIN");

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      const pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--pointer-x", pointerX.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", pointerY.toFixed(3));
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onScroll = () => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maximum));
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
      setScrollPercent(Math.round(progress * 100));
      const labels = ["ORIGIN", "WORK", "EXPERIENCE", "ABOUT", "CONTACT"];
      setChapter(labels[Math.min(labels.length - 1, Math.floor(progress * labels.length))]);
    };
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".section, .contact-section").forEach((node) => revealObserver.observe(node));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      revealObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--pointer-x");
      document.documentElement.style.removeProperty("--pointer-y");
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);

  useEffect(() => () => { if (audioRef.current) void audioRef.current.context.close(); }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rig = audioRef.current;
      if (!rig) return;
      const target = event.target instanceof Element ? event.target : null;
      const interactive = Boolean(target?.closest("a, button, input, select, textarea, summary, [role='button']"));
      playInterfaceSound(rig.context, rig.gain, interactive);
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const toggleSound = async () => {
    if (startingAudioRef.current) return;
    if (audioRef.current) {
      const rig = audioRef.current; const now = rig.context.currentTime;
      rig.gain.gain.cancelScheduledValues(now); rig.gain.gain.setValueAtTime(rig.gain.gain.value, now);
      rig.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      rig.sources.forEach((source) => { try { source.stop(now + 0.85); } catch { /* already stopped */ } });
      audioRef.current = null; setSoundState("off"); window.setTimeout(() => void rig.context.close(), 900); return;
    }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    startingAudioRef.current = true;
    setSoundState("loading");
    const context: AudioContext = new AudioContextClass();
    try {
      await context.resume();
      const soundtrack = await createAnimeLofiLoop(context);
      const master = context.createGain();
      const trackGain = context.createGain();
      const compressor = context.createDynamicsCompressor();
      master.gain.setValueAtTime(0.0001, context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.76, context.currentTime + 1.5);
      trackGain.gain.value = 0.92;
      compressor.threshold.value = -14; compressor.knee.value = 18; compressor.ratio.value = 3;
      compressor.attack.value = 0.015; compressor.release.value = 0.5;
      trackGain.connect(master); master.connect(compressor); compressor.connect(context.destination);
      const lofiSource = context.createBufferSource();
      lofiSource.buffer = soundtrack; lofiSource.loop = true; lofiSource.connect(trackGain); lofiSource.start();
      const sources: AudioScheduledSourceNode[] = [lofiSource];
      audioRef.current = { context, gain: master, sources };
      setSoundState("on");
      playInterfaceSound(context, master, true);
    } catch {
      await context.close();
      setSoundState("off");
    } finally {
      startingAudioRef.current = false;
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
      <button className={`sound-toggle ${soundState === "on" ? "is-on" : ""}`} type="button" aria-label={soundState === "on" ? "Turn lo-fi soundtrack off" : "Turn lo-fi soundtrack on"} aria-pressed={soundState === "on"} disabled={soundState === "loading"} onClick={() => void toggleSound()} title="Evolving lo-fi soundtrack and interface sounds">
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>LO-FI: {soundState === "loading" ? "···" : soundState.toUpperCase()}</span>
      </button>
      <div className="experience-progress" aria-hidden="true">
        <span>{String(scrollPercent).padStart(2, "0")}</span><span className="progress-rail"><i style={{ height: `${scrollPercent}%` }} /></span><strong>{chapter}</strong>
      </div>
      <div className="interaction-guide" aria-hidden="true">MOVE / SCROLL TO SHIFT THE PARTICLE FIELD</div>
    </div>
  );
}
