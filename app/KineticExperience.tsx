"use client";

import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";

type AudioRig = { context: AudioContext; gain: GainNode; sources: AudioScheduledSourceNode[] };

const PARTICLE_COLORS = ["#f3f3f3"];

function createLofiLoop(context: AudioContext) {
  const bpm = 82;
  const beatDuration = 60 / bpm;
  const beatCount = 8;
  const duration = beatDuration * beatCount;
  const frameCount = Math.floor(context.sampleRate * duration);
  const loop = context.createBuffer(2, frameCount, context.sampleRate);
  const chords = [
    [73.42, 87.31, 110, 130.81, 164.81],
    [98, 123.47, 146.83, 164.81, 220],
    [65.41, 82.41, 98, 123.47, 146.83],
    [55, 69.3, 82.41, 103.83, 116.54],
  ];
  const roots = [73.42, 98, 65.41, 55];
  const tau = Math.PI * 2;

  for (let channel = 0; channel < loop.numberOfChannels; channel += 1) {
    const data = loop.getChannelData(channel);
    let tapeNoise = 0;
    for (let i = 0; i < frameCount; i += 1) {
      const time = i / context.sampleRate;
      const beatPosition = time / beatDuration;
      const chordIndex = Math.min(chords.length - 1, Math.floor(beatPosition / 2));
      const chord = chords[chordIndex];
      const chordTime = time - chordIndex * beatDuration * 2;
      const chordLength = beatDuration * 2;
      const attack = Math.min(1, chordTime / 0.11);
      const release = Math.min(1, (chordLength - chordTime) / 0.2);
      const chordEnvelope = Math.max(0, Math.min(attack, release));
      const warpedTime = time + 0.0024 * Math.sin(tau * 0.34 * time) + 0.0008 * Math.sin(tau * 0.81 * time);
      let sample = 0;

      chord.forEach((frequency, toneIndex) => {
        const stereoPhase = channel * (toneIndex % 2 === 0 ? 0.19 : -0.14);
        const mellow = Math.sin(tau * frequency * warpedTime + stereoPhase);
        const harmonic = Math.sin(tau * frequency * 2 * warpedTime + stereoPhase * 0.6) * 0.22;
        sample += (mellow + harmonic) * 0.036 * chordEnvelope;
        const keyDecay = Math.exp(-chordTime * (2.1 + toneIndex * 0.13));
        sample += Math.sin(tau * frequency * 2 * warpedTime + stereoPhase) * keyDecay * 0.026;
      });

      const beatInChord = chordTime % beatDuration;
      const bassEnvelope = Math.exp(-beatInChord * 2.5);
      sample += Math.sin(tau * roots[chordIndex] * 0.5 * warpedTime) * bassEnvelope * 0.11;

      const beatIndex = Math.floor(beatPosition);
      const beatTime = time - beatIndex * beatDuration;
      if (beatIndex % 2 === 0) {
        const kickPitch = 48 + 58 * Math.exp(-beatTime * 20);
        sample += Math.sin(tau * kickPitch * beatTime) * Math.exp(-beatTime * 12) * 0.2;
      } else {
        const snareNoise = Math.random() * 2 - 1;
        sample += snareNoise * Math.exp(-beatTime * 18) * 0.12;
        sample += Math.sin(tau * 178 * beatTime) * Math.exp(-beatTime * 16) * 0.045;
      }

      const halfBeatTime = time % (beatDuration / 2);
      sample += (Math.random() * 2 - 1) * Math.exp(-halfBeatTime * 54) * 0.028;
      tapeNoise = tapeNoise * 0.965 + (Math.random() * 2 - 1) * 0.035;
      const dustClick = Math.random() > 0.99945 ? (Math.random() * 2 - 1) * 0.12 : 0;
      sample += tapeNoise * 0.018 + dustClick;
      data[i] = Math.tanh(sample * 1.18);
    }
  }
  return loop;
}

export function KineticExperience() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioRig | null>(null);
  const [soundOn, setSoundOn] = useState(false);
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

  const toggleSound = async () => {
    if (audioRef.current) {
      const rig = audioRef.current; const now = rig.context.currentTime;
      rig.gain.gain.cancelScheduledValues(now); rig.gain.gain.setValueAtTime(rig.gain.gain.value, now);
      rig.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      rig.sources.forEach((source) => { try { source.stop(now + 0.85); } catch { /* already stopped */ } });
      audioRef.current = null; setSoundOn(false); window.setTimeout(() => void rig.context.close(), 900); return;
    }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context: AudioContext = new AudioContextClass(); await context.resume();
    const master = context.createGain(); const trackGain = context.createGain(); const filter = context.createBiquadFilter();
    const dry = context.createGain(); const wet = context.createGain(); const reverb = context.createConvolver(); const compressor = context.createDynamicsCompressor();
    master.gain.setValueAtTime(0.0001, context.currentTime); master.gain.exponentialRampToValueAtTime(0.68, context.currentTime + 1.4);
    trackGain.gain.value = 0.96; filter.type = "lowpass"; filter.frequency.value = 4100; filter.Q.value = 0.34;
    dry.gain.value = 0.9; wet.gain.value = 0.26;
    compressor.threshold.value = -16; compressor.knee.value = 20; compressor.ratio.value = 3.6; compressor.attack.value = 0.018; compressor.release.value = 0.55;
    const impulseLength = Math.floor(context.sampleRate * 2.8); const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const impulseData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i += 1) {
        const decay = Math.pow(1 - i / impulseLength, 3.8);
        impulseData[i] = (Math.random() * 2 - 1) * decay * (0.48 + channel * 0.05);
      }
    }
    reverb.buffer = impulse;
    trackGain.connect(filter); filter.connect(dry); filter.connect(reverb); reverb.connect(wet); dry.connect(master); wet.connect(master); master.connect(compressor); compressor.connect(context.destination);
    const lofiSource = context.createBufferSource();
    lofiSource.buffer = createLofiLoop(context); lofiSource.loop = true; lofiSource.connect(trackGain); lofiSource.start();
    const sources: AudioScheduledSourceNode[] = [lofiSource];
    audioRef.current = { context, gain: master, sources }; setSoundOn(true);
  };

  return (
    <div className="kinetic-experience">
      <div className="particles-background" aria-hidden="true">
        <Particles
          particleColors={PARTICLE_COLORS}
          particleCount={700}
          particleSpread={10}
          speed={0.2}
          particleBaseSize={200}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio="1"
        />
      </div>
      <div ref={cursorRef} className="kinetic-cursor" aria-hidden="true"><span /></div>
      <div className="renderer-badge" aria-label="Interactive particle field active"><span className="renderer-dot" />PARTICLES</div>
      <button className={`sound-toggle ${soundOn ? "is-on" : ""}`} type="button" aria-label={soundOn ? "Turn lo-fi soundtrack off" : "Turn lo-fi soundtrack on"} aria-pressed={soundOn} onClick={() => void toggleSound()} title="Lo-fi beats and vinyl atmosphere">
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>LO-FI: {soundOn ? "ON" : "OFF"}</span>
      </button>
      <div className="experience-progress" aria-hidden="true">
        <span>{String(scrollPercent).padStart(2, "0")}</span><span className="progress-rail"><i style={{ height: `${scrollPercent}%` }} /></span><strong>{chapter}</strong>
      </div>
      <div className="interaction-guide" aria-hidden="true">MOVE / SCROLL TO SHIFT THE PARTICLE FIELD</div>
    </div>
  );
}
