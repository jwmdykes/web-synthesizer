import { Voice, VoiceParams } from './Voice';
import { EnvelopeParams } from './Envelope';
import { FilterParams } from './Filter';
import {
  ChorusEffect,
  ChorusEffectParams,
  PingPongEffect,
  PingPongEffectParams,
} from './TunaEffect';

export interface SoundEngineParams {
  midiVoices: number[];
  chorusEffectParams: ChorusEffectParams;
  pingPongEffectParams: PingPongEffectParams;
  voiceParams: VoiceParams;
  volume: number;
}

export class SoundEngine {
  private readonly voices: Map<number, Voice>;
  private readonly audioContext: AudioContext;
  private readonly masterVolume: GainNode;
  private readonly mixCompressor: DynamicsCompressorNode;
  private readonly effectBus: GainNode;
  private chorusEffect: ChorusEffect;
  private pingPongEffect: PingPongEffect;

  public setVolume(volume: number) {
    this.masterVolume.gain.setValueAtTime(
      volume,
      this.audioContext.currentTime
    );
  }

  public changeOscillatorParams(oscillatorParams: OscillatorType) {
    for (let value of this.voices.values()) {
      value.changeOscillatorParams(oscillatorParams);
    }
  }

  public changeEnvelopeParams(envelopeParams: EnvelopeParams) {
    for (let value of this.voices.values()) {
      value.changeEnvelopeParams(envelopeParams);
    }
  }

  public changeChorusEffectParams(effectParams: ChorusEffectParams) {
    this.chorusEffect.changeEffectParams(effectParams);
    this.effectBus.connect(this.chorusEffect.node);
  }

  public changePingPongEffectParams(effectParams: PingPongEffectParams) {
    this.pingPongEffect.changeEffectParams(effectParams);
    this.effectBus.connect(this.pingPongEffect.node);
  }

  public changeFilterParams(filterParams: FilterParams) {
    for (let value of this.voices.values()) {
      value.changeFilterParams(filterParams);
    }
  }

  constructor(audioContext: AudioContext, params: SoundEngineParams) {
    this.mixCompressor = audioContext.createDynamicsCompressor();
    this.mixCompressor.ratio.setValueAtTime(1.5, audioContext.currentTime);
    this.mixCompressor.attack.setValueAtTime(0.05, audioContext.currentTime);
    this.mixCompressor.release.setValueAtTime(0.25, audioContext.currentTime);

    this.masterVolume = audioContext.createGain();
    this.effectBus = audioContext.createGain();
    this.effectBus.gain.value = 0.25;

    this.chorusEffect = new ChorusEffect(
      audioContext,
      this.mixCompressor,
      params.chorusEffectParams
    );
    this.effectBus.connect(this.chorusEffect.node);
    this.pingPongEffect = new PingPongEffect(
      audioContext,
      this.mixCompressor,
      params.pingPongEffectParams
    );
    this.effectBus.connect(this.pingPongEffect.node);

    this.mixCompressor.connect(this.masterVolume);
    this.masterVolume.connect(audioContext.destination);
    this.masterVolume.gain.value = params.volume;

    this.audioContext = audioContext;

    this.voices = new Map<number, Voice>();
    for (let i of params.midiVoices) {
      this.voices.set(
        i,
        new Voice(this.audioContext, this.effectBus, params.voiceParams)
      );
    }
  }

  public play(noteNumber: number) {
    let voice = this.voices.get(noteNumber);
    if (voice) {
      voice.play(noteNumber);
    }
  }

  public stop(noteNumber: number) {
    let voice = this.voices.get(noteNumber);
    if (voice) {
      voice.stop();
    }
  }
}
