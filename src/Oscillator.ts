import { midiNoteToFrequency } from "./Tunings";

export type EnvelopeParams = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export type OscillatorTypes = 'sine' | 'square' | 'triangle' | 'sawtooth'


export const createADSRNode = (audioContext: AudioContext, { attack, decay, sustain, release }: EnvelopeParams, startAt = audioContext.currentTime) => {
  const gainNode = new GainNode(audioContext)

  const maxGain = 1;
  const sustainGain = maxGain * sustain;

  gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Start at 0
  gainNode.gain.linearRampToValueAtTime(maxGain, audioContext.currentTime + attack); // Attack
  gainNode.gain.linearRampToValueAtTime(sustainGain, audioContext.currentTime + attack + decay); // Decay

  return gainNode;
}

export const createOscillator = (audioContext: AudioContext, type: OscillatorTypes, noteNumber: number) => {
  const oscillator = new OscillatorNode(audioContext, {
    frequency: midiNoteToFrequency(noteNumber),
    type: type
  })
  return oscillator
}