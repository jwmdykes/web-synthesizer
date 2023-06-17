export type EnvelopeParams = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export type OscillatorTypes = 'sine' | 'square' | 'triangle'


export const createADSRNode = (audioContext: AudioContext, { attack, decay, sustain, release }: EnvelopeParams, startAt = audioContext.currentTime) => {
  const gainNode = audioContext.createGain();

  const maxGain = 1;
  const sustainGain = maxGain * sustain;

  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(maxGain, startAt + attack);
  gainNode.gain.linearRampToValueAtTime(sustainGain, startAt + attack + decay);
  gainNode.gain.setTargetAtTime(0, startAt + attack + decay + sustain, release);

  return gainNode;
}

export const createOscillator = (audioContext: AudioContext, type: OscillatorTypes) => {
  const oscillator = new OscillatorNode(audioContext, {
    frequency: 440,
    type: type
  })
  return oscillator
}