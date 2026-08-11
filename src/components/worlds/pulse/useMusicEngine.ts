"use client";

import { useEffect, useRef } from "react";

/**
 * Pulse actually plays.
 *
 * A listening service whose play button only moves a progress bar is a mockup,
 * so this synthesises the preview in the browser instead: nothing is sampled,
 * downloaded or licensed, and every note is generated from the three facts the
 * catalogue already stores about a record — its tempo, its root, and its scale.
 *
 * That is also why the archive can be heard. Its recordings are written in the
 * idiom of mid-century Arabic broadcast music, and the maqamat that idiom uses
 * are not twelve-tone: Rast has a third around 350 cents and Bayati a second
 * around 150, neither of which exists on a piano. The scale is therefore stored
 * in cents rather than semitones, so `ARŠ-112` is genuinely in Rast rather than
 * in a rounded-off approximation of it — you can hear the difference between the
 * archive and the floor, not just see it.
 *
 * Three arrangements, one per house:
 *   0 floor    kick on the quarter, hats off it, eighth-note bass, held pad
 *   1 archive  a wahda — one heavy dum, light taks — under an oud phrase
 *   2 room     brushed, sparse, mostly the sound of the space
 *
 * The engine is driven, never authoritative: the page owns the transport, and
 * this follows it.
 */

export interface EnginePreset {
  bpm: number;
  /** MIDI note of the tonic. */
  root: number;
  /** Scale in cents from the tonic. */
  cents: readonly number[];
  /** Which house arrangement to play. */
  mode: 0 | 1 | 2;
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_WINDOW = 0.12;
const STEPS = 16;

/** Which 16th-notes each voice speaks on, and what it plays when it does. */
interface Voicing {
  kick: readonly number[];
  hat: readonly number[];
  bass: readonly number[];
  bassDegrees: readonly number[];
  pad: readonly number[];
  padDegrees: readonly number[];
  pluck: readonly number[];
  pluckDegrees: readonly number[];
}

const GRID: readonly Voicing[] = [
  {
    kick: [0, 4, 8, 12],
    hat: [2, 6, 10, 14, 7, 15],
    bass: [0, 3, 6, 8, 11, 14],
    bassDegrees: [0, 0, 4, 0, 2, 6],
    pad: [0],
    padDegrees: [0, 2, 4],
    pluck: [],
    pluckDegrees: [],
  },
  {
    kick: [0, 8],
    hat: [3, 6, 11, 13],
    bass: [0, 8],
    bassDegrees: [0, 4],
    pad: [0],
    padDegrees: [0, 4],
    pluck: [0, 2, 3, 5, 7, 8, 10, 11, 14],
    pluckDegrees: [0, 2, 3, 4, 3, 2, 1, 0, 6],
  },
  {
    kick: [0, 8],
    hat: [4, 12],
    bass: [0, 6, 8, 14],
    bassDegrees: [0, 2, 0, 6],
    pad: [0],
    padDegrees: [0, 4, 2],
    pluck: [],
    pluckDegrees: [],
  },
];

function hzOf(root: number, cents: readonly number[], degree: number): number {
  const span = cents.length;
  const octave = Math.floor(degree / span);
  const step = ((degree % span) + span) % span;
  const offset = (cents[step] ?? 0) + octave * 1200;
  return 440 * Math.pow(2, (root - 69) / 12) * Math.pow(2, offset / 1200);
}

export function useMusicEngine(playing: boolean, preset: EnginePreset, volume: number) {
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  // Read through a ref so moving the fader never restarts the sequencer, which
  // would drop the pattern back to the top of the bar on every pixel of drag.
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  /* Volume is applied to the live graph without restarting anything. */
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(volume * 0.5, ctx.currentTime, 0.05);
  }, [volume]);

  useEffect(() => {
    if (!playing) {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        // Fade out rather than cut: a hard stop on a sustained pad clicks.
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
        const id = window.setTimeout(() => void ctx.suspend().catch(() => {}), 260);
        return () => window.clearTimeout(id);
      }
      return;
    }

    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;

    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0;
      // A gentle shelf off the top so the synthesis reads as a room, not a test tone.
      const tame = ctx.createBiquadFilter();
      tame.type = "lowpass";
      tame.frequency.value = 6200;
      tame.Q.value = 0.4;
      master.connect(tame).connect(ctx.destination);
      masterRef.current = master;

      const length = Math.floor(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buffer;
    }

    const master = masterRef.current;
    if (!master) return;

    void ctx.resume().catch(() => {});
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(volumeRef.current * 0.5, ctx.currentTime, 0.08);

    let step = 0;
    let nextTime = ctx.currentTime + 0.06;

    const env = (
      node: AudioNode,
      at: number,
      peak: number,
      attack: number,
      release: number,
    ): GainNode => {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
      node.connect(gain).connect(master);
      return gain;
    };

    const kick = (at: number, mode: number) => {
      const osc = ctx.createOscillator();
      osc.type = mode === 1 ? "triangle" : "sine";
      const top = mode === 1 ? 150 : 130;
      osc.frequency.setValueAtTime(top, at);
      osc.frequency.exponentialRampToValueAtTime(mode === 1 ? 62 : 44, at + 0.14);
      env(osc, at, mode === 2 ? 0.34 : 0.7, 0.005, mode === 1 ? 0.3 : 0.2);
      osc.start(at);
      osc.stop(at + 0.42);
    };

    const hat = (at: number, mode: number) => {
      const buffer = noiseRef.current;
      if (!buffer) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = mode === 2 ? "bandpass" : "highpass";
      band.frequency.value = mode === 1 ? 3400 : mode === 2 ? 2100 : 7200;
      band.Q.value = mode === 2 ? 0.8 : 1.4;
      src.connect(band);
      env(band, at, mode === 2 ? 0.11 : 0.075, 0.002, mode === 2 ? 0.13 : 0.05);
      src.start(at);
      src.stop(at + 0.2);
    };

    const bass = (at: number, hz: number, mode: number, length: number) => {
      const osc = ctx.createOscillator();
      osc.type = mode === 1 ? "sine" : "sawtooth";
      osc.frequency.value = hz / 2;
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.setValueAtTime(mode === 0 ? 420 : 300, at);
      low.frequency.exponentialRampToValueAtTime(mode === 0 ? 180 : 140, at + length);
      low.Q.value = 3.5;
      osc.connect(low);
      env(low, at, mode === 2 ? 0.2 : 0.3, 0.008, length);
      osc.start(at);
      osc.stop(at + length + 0.08);
    };

    /** The oud. Two detuned triangles, a fast pluck, and a short bend into pitch. */
    const pluck = (at: number, hz: number) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(hz * 0.985, at);
        osc.frequency.exponentialRampToValueAtTime(hz, at + 0.035);
        osc.detune.value = detune;
        const body = ctx.createBiquadFilter();
        body.type = "bandpass";
        body.frequency.value = hz * 2.1;
        body.Q.value = 1.1;
        osc.connect(body);
        env(body, at, 0.16, 0.004, 0.52);
        osc.start(at);
        osc.stop(at + 0.7);
      }
    };

    const pad = (at: number, hz: number, length: number, mode: number) => {
      const osc = ctx.createOscillator();
      osc.type = mode === 1 ? "sawtooth" : "triangle";
      osc.frequency.value = hz;
      osc.detune.value = mode === 1 ? 7 : 0;
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = mode === 1 ? 1500 : 1100;
      low.Q.value = 0.7;
      osc.connect(low);
      // The takht's strings are not steady; a slow vibrato is the whole sound.
      if (mode === 1) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4.6;
        const depth = ctx.createGain();
        depth.gain.value = 5.5;
        lfo.connect(depth).connect(osc.detune);
        lfo.start(at);
        lfo.stop(at + length + 0.5);
      }
      env(low, at, mode === 2 ? 0.045 : 0.07, length * 0.35, length * 0.8);
      osc.start(at);
      osc.stop(at + length + 0.6);
    };

    const schedule = () => {
      const { bpm, root, cents, mode } = presetRef.current;
      const stepLength = 60 / Math.max(30, bpm) / 4;
      const grid = GRID[mode] ?? GRID[0];

      while (nextTime < ctx.currentTime + SCHEDULE_WINDOW) {
        const at = nextTime;
        const s = step % STEPS;

        if (grid.kick.includes(s)) kick(at, mode);
        if (grid.hat.includes(s)) hat(at, mode);

        const bi = grid.bass.indexOf(s);
        if (bi >= 0) {
          bass(at, hzOf(root, cents, grid.bassDegrees[bi] ?? 0), mode, stepLength * 2.4);
        }

        const pi = grid.pluck.indexOf(s);
        if (pi >= 0) {
          // Every other bar the phrase answers an octave up: a real taqsim
          // does not repeat itself at the same height.
          const up = Math.floor(step / STEPS) % 2 === 1 ? 7 : 0;
          pluck(at, hzOf(root, cents, (grid.pluckDegrees[pi] ?? 0) + up));
        }

        if (grid.pad.includes(s)) {
          const bar = stepLength * STEPS;
          const rotate = Math.floor(step / STEPS) % grid.padDegrees.length;
          for (let v = 0; v < grid.padDegrees.length; v++) {
            const degree = (grid.padDegrees[(v + rotate) % grid.padDegrees.length] ?? 0) + 7;
            pad(at, hzOf(root, cents, degree), bar, mode);
          }
        }

        nextTime += stepLength;
        step += 1;
      }
    };

    schedule();
    const timer = window.setInterval(schedule, LOOKAHEAD_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  /* One context per mount, closed on the way out. */
  useEffect(
    () => () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      masterRef.current = null;
      noiseRef.current = null;
      void ctx?.close().catch(() => {});
    },
    [],
  );
}
