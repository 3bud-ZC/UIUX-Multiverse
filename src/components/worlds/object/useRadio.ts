"use client";

import { useEffect, useRef } from "react";

/**
 * The set's voice.
 *
 * ## The static
 *
 * Tuning is not a cross-fade. While the dial is moving the music ducks away and
 * a real interference chain opens: band-passed noise whose centre frequency
 * tracks the dial, plus a heterodyne whistle that sweeps as you pass a carrier.
 * Land on a band and it clears.
 *
 * One scheduler, created on the first press and never before.
 */

export function useRadio({
  on,
  volume,
  audioUrl,
  /** True while the knob is moving. Ducks the band and opens the interference. */
  tuning,
  /** Dial position 0…1, which is what the whistle tracks. */
  position,
}: {
  on: boolean;
  volume: number;
  audioUrl: string;
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
  
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const audioUrlRef = useRef(audioUrl);
  
  // Track audio URL changes to swap tracks
  useEffect(() => {
    if (audioUrlRef.current !== audioUrl) {
      audioUrlRef.current = audioUrl;
      const el = audioElRef.current;
      if (el) {
        el.src = audioUrl;
        if (on && !tuning) {
          el.play().catch(() => {});
        }
      }
    }
  }, [audioUrl, on, tuning]);

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
    
    // Pause audio while tuning to avoid streaming audio we aren't listening to
    const el = audioElRef.current;
    if (el) {
      if (tuning) {
        el.pause();
      } else if (on) {
        el.play().catch(() => {});
      }
    }
  }, [tuning, on]);

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
      const el = audioElRef.current;
      if (el) el.pause();
      
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

      // Audio Element Setup
      const audioEl = new Audio();
      audioEl.crossOrigin = "anonymous";
      audioEl.loop = true;
      audioEl.src = audioUrlRef.current;
      audioElRef.current = audioEl;
      
      const sourceNode = ctx.createMediaElementSource(audioEl);
      sourceNode.connect(band);
      sourceNodeRef.current = sourceNode;

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
    
    const el = audioElRef.current;
    if (el && !tuningRef.current) {
      el.play().catch(() => {});
    }

  }, [on]);

  /* One context per mount, closed on the way out. */
  useEffect(
    () => () => {
      const ctx = ctxRef.current;
      
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.src = "";
        audioElRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

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
