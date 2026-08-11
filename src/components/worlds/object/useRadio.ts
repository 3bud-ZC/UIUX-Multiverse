"use client";

import { useEffect, useRef } from "react";
import type { StationMusic } from "./data";

/**
 * The set's voice — and it is a voice, not a drone.
 *
 * ## On rights
 *
 * The recordings this archive is about are not ours to play, so **nothing here
 * is streamed, sampled or downloaded.** Every sound the radio makes is generated
 * in the browser from the five numbers each band carries in `data.ts`: a tempo,
 * a tonic, a maqam in cents, an ensemble mix and a sixteen-step phrase. There is
 * no audio file in this repository and no third-party licence to honour, which
 * is the only way a page like this can honestly be *heard* rather than described.
 *
 * ## Why it sounds Arabic
 *
 * Because the intervals are. The maqamat are stored in cents rather than
 * semitones — Bayati's second sits around 150 and Rast's third around 350 — so
 * the plucked line genuinely lands between the piano's keys. The percussion is
 * the *wahda* pattern (a heavy dum, two light taks) rather than a backbeat, and
 * the 1970s and 1980s bands swap the riq for a drum box because that is what
 * happened.
 *
 * ## The static
 *
 * Tuning is not a cross-fade. While the dial is moving the music ducks away and
 * a real interference chain opens: band-passed noise whose centre frequency
 * tracks the dial, plus a heterodyne whistle that sweeps as you pass a carrier.
 * Land on a band and it clears. That is the whole reason a dial feels like a
 * dial.
 *
 * One scheduler, created on the first press and never before: a page that makes
 * a sound the visitor did not ask for is a page that gets closed.
 */

const LOOKAHEAD_MS = 25;
const WINDOW = 0.14;
const STEPS = 16;

/** The wahda: dum on 1 and 9, taks around them. */
const DUM = [0, 8];
const TAK = [3, 6, 11, 14];
/** The drum box the 1980s band used instead. */
const BOX_KICK = [0, 6, 8, 14];
const BOX_SNARE = [4, 12];
const BOX_HAT = [2, 6, 10, 14];

function hzOf(root: number, cents: readonly number[], degree: number): number {
  const span = cents.length;
  const octave = Math.floor(degree / span);
  const step = ((degree % span) + span) % span;
  const offset = (cents[step] ?? 0) + octave * 1200;
  return 440 * Math.pow(2, (root - 69) / 12) * Math.pow(2, offset / 1200);
}

export function useRadio({
  on,
  volume,
  music,
  /** True while the knob is moving. Ducks the band and opens the interference. */
  tuning,
  /** Dial position 0…1, which is what the whistle tracks. */
  position,
}: {
  on: boolean;
  volume: number;
  music: StationMusic;
  tuning: boolean;
  position: number;
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const bandRef = useRef<GainNode | null>(null);
  const staticRef = useRef<GainNode | null>(null);
  const carrierRef = useRef<OscillatorNode | null>(null);
  const noiseBandRef = useRef<BiquadFilterNode | null>(null);
  const noiseBufRef = useRef<AudioBuffer | null>(null);

  const musicRef = useRef(music);
  musicRef.current = music;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const tuningRef = useRef(tuning);
  tuningRef.current = tuning;

  /* Volume, live. Moving the knob must not restart the band. */
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.setTargetAtTime(on ? volume * 0.55 : 0, ctx.currentTime, 0.06);
  }, [volume, on]);

  /* The tuning cross-fade: band down, interference up, and back. */
  useEffect(() => {
    const ctx = ctxRef.current;
    const band = bandRef.current;
    const noise = staticRef.current;
    if (!ctx || !band || !noise) return;
    const now = ctx.currentTime;
    band.gain.setTargetAtTime(tuning ? 0.04 : 1, now, tuning ? 0.02 : 0.16);
    noise.gain.setTargetAtTime(tuning ? 0.55 : 0.012, now, tuning ? 0.015 : 0.2);
  }, [tuning]);

  /* The whistle and the interference band both track the dial, so sweeping the
     knob sounds like sweeping past carriers rather than like a fader. */
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    carrierRef.current?.frequency.setTargetAtTime(700 + position * 2600, now, 0.05);
    noiseBandRef.current?.frequency.setTargetAtTime(900 + position * 1800, now, 0.08);
  }, [position]);

  useEffect(() => {
    if (!on) {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        const id = window.setTimeout(() => void ctx.suspend().catch(() => {}), 400);
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
      // The cabinet: a small wooden box with a paper cone, so nothing above
      // ~2.4 kHz gets out, and a gentle push at 240 Hz where the box resonates.
      const cabinet = ctx.createBiquadFilter();
      cabinet.type = "lowpass";
      cabinet.frequency.value = 2400;
      cabinet.Q.value = 0.8;
      const boxNote = ctx.createBiquadFilter();
      boxNote.type = "peaking";
      boxNote.frequency.value = 240;
      boxNote.gain.value = 4;
      boxNote.Q.value = 0.9;
      cabinet.connect(boxNote).connect(master).connect(ctx.destination);
      masterRef.current = master;

      const band = ctx.createGain();
      band.gain.value = 1;
      band.connect(cabinet);
      bandRef.current = band;

      /* Interference: looped noise through a tracking band-pass, plus a
         heterodyne whistle. Both are always running and simply gated. */
      const frames = Math.floor(ctx.sampleRate * 2);
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < frames; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.03 * white) / 1.03;
        // Occasional pops, the way a worn groove and a loose valve behave.
        const pop = Math.random() > 0.9993 ? (Math.random() - 0.5) * 0.9 : 0;
        data[i] = last * 3 + white * 0.35 + pop;
      }
      noiseBufRef.current = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.012;
      noiseGain.connect(cabinet);
      staticRef.current = noiseGain;

      const noiseBand = ctx.createBiquadFilter();
      noiseBand.type = "bandpass";
      noiseBand.frequency.value = 1400;
      noiseBand.Q.value = 0.9;
      noiseBand.connect(noiseGain);
      noiseBandRef.current = noiseBand;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(noiseBand);
      noise.start();

      const carrier = ctx.createOscillator();
      carrier.type = "sine";
      carrier.frequency.value = 1600;
      const carrierGain = ctx.createGain();
      carrierGain.gain.value = 0.05;
      carrier.connect(carrierGain).connect(noiseGain);
      carrier.start();
      carrierRef.current = carrier;
    }

    const master = masterRef.current;
    const band = bandRef.current;
    if (!master || !band) return;
    void ctx.resume().catch(() => {});
    master.gain.setTargetAtTime(volumeRef.current * 0.55, ctx.currentTime, 0.2);

    let step = 0;
    let nextTime = ctx.currentTime + 0.08;

    /** A plucked string: oud and qanun differ in brightness and decay, not kind. */
    const pluck = (at: number, hz: number, level: number, bright: number, decay: number) => {
      if (level <= 0.01) return;
      for (const detune of [-5, 6]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(hz * 0.99, at);
        osc.frequency.exponentialRampToValueAtTime(hz, at + 0.03);
        osc.detune.value = detune;
        const body = ctx.createBiquadFilter();
        body.type = "bandpass";
        body.frequency.value = hz * bright;
        body.Q.value = 1.2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.14 * level, at + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        osc.connect(body).connect(gain).connect(band);
        osc.start(at);
        osc.stop(at + decay + 0.05);
      }
    };

    /** The ney: breath, and a pitch that never quite settles. */
    const ney = (at: number, hz: number, level: number, length: number) => {
      if (level <= 0.01) return;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = hz * 2;
      const vib = ctx.createOscillator();
      vib.frequency.value = 5.2;
      const depth = ctx.createGain();
      depth.gain.value = 9;
      vib.connect(depth).connect(osc.detune);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.075 * level, at + length * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(band);
      // The breath is what makes it a flute rather than a sine.
      const buffer = noiseBufRef.current;
      if (buffer) {
        const air = ctx.createBufferSource();
        air.buffer = buffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1800;
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.0001, at);
        airGain.gain.exponentialRampToValueAtTime(0.02 * level, at + length * 0.3);
        airGain.gain.exponentialRampToValueAtTime(0.0001, at + length);
        air.connect(hp).connect(airGain).connect(band);
        air.start(at);
        air.stop(at + length + 0.05);
      }
      osc.start(at);
      osc.stop(at + length + 0.1);
      vib.start(at);
      vib.stop(at + length + 0.1);
    };

    /** Strings: the broadcast orchestra, sustained under everything. */
    const strings = (at: number, hz: number, level: number, length: number) => {
      if (level <= 0.01) return;
      for (const detune of [-8, 9]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = hz;
        osc.detune.value = detune;
        const low = ctx.createBiquadFilter();
        low.type = "lowpass";
        low.frequency.value = 1300;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.035 * level, at + length * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
        osc.connect(low).connect(gain).connect(band);
        osc.start(at);
        osc.stop(at + length + 0.1);
      }
    };

    const skin = (at: number, hz: number, level: number, decay: number) => {
      if (level <= 0.01) return;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(hz * 1.6, at);
      osc.frequency.exponentialRampToValueAtTime(hz, at + decay * 0.6);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.3 * level, at + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      osc.connect(gain).connect(band);
      osc.start(at);
      osc.stop(at + decay + 0.05);
    };

    const rattle = (at: number, level: number, hzLow: number, decay: number) => {
      const buffer = noiseBufRef.current;
      if (!buffer || level <= 0.01) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = hzLow;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.12 * level, at + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      src.connect(hp).connect(gain).connect(band);
      src.start(at);
      src.stop(at + decay + 0.05);
    };

    const schedule = () => {
      const m = musicRef.current;
      const stepLength = 60 / Math.max(30, m.bpm) / 4;

      while (nextTime < ctx.currentTime + WINDOW) {
        const at = nextTime;
        const s = step % STEPS;
        const bar = Math.floor(step / STEPS);
        const degree = m.phrase[s] ?? -1;

        if (degree >= 0) {
          const hz = hzOf(m.root, m.cents, degree + (bar % 2 === 1 ? 7 : 0));
          // Oud and qanun answer each other rather than doubling: the oud takes
          // the strong steps, the qanun decorates the weak ones.
          if (s % 2 === 0) pluck(at, hz, m.ensemble.oud, 2.1, 0.62);
          else pluck(at, hz * 2, m.ensemble.qanun, 3.4, 0.34);
          if (s % 8 === 0) ney(at, hz, m.ensemble.ney, stepLength * 6);
        }

        if (s === 0) {
          const chord = [0, 2, 4];
          for (const d of chord) {
            strings(at, hzOf(m.root, m.cents, d) / 2, m.ensemble.strings * 0.8, stepLength * STEPS);
          }
        }

        if (m.ensemble.box > 0.05) {
          if (BOX_KICK.includes(s)) skin(at, 62, m.ensemble.box, 0.2);
          if (BOX_SNARE.includes(s)) rattle(at, m.ensemble.box * 0.9, 900, 0.14);
          if (BOX_HAT.includes(s)) rattle(at, m.ensemble.box * 0.35, 6200, 0.04);
        }
        if (m.ensemble.riq > 0.05) {
          if (DUM.includes(s)) skin(at, 86, m.ensemble.riq, 0.3);
          if (TAK.includes(s)) rattle(at, m.ensemble.riq * 0.5, 2400, 0.06);
        }

        nextTime += stepLength;
        step += 1;
      }
    };

    schedule();
    const timer = window.setInterval(schedule, LOOKAHEAD_MS);
    return () => window.clearInterval(timer);
  }, [on]);

  /* One context per mount, closed on the way out. */
  useEffect(
    () => () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      masterRef.current = null;
      bandRef.current = null;
      staticRef.current = null;
      carrierRef.current = null;
      noiseBandRef.current = null;
      noiseBufRef.current = null;
      void ctx?.close().catch(() => {});
    },
    [],
  );
}
