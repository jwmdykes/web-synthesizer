import {Voice, VoiceParams} from "./Voice";
import {EnvelopeParams} from "./Envelope";
import {FilterParams} from "./Filter";
import {EffectParams, TunaEffect} from "./TunaEffect";

export interface SoundEngineParams {
    midiVoices: number[],
    effectParams: EffectParams,
    voiceParams: VoiceParams,
    volume: number,
}

export class SoundEngine {
    private readonly voices: Map<number, Voice>;
    private readonly audioContext: AudioContext;
    private readonly masterVolume: GainNode;
    private readonly mixCompressor: DynamicsCompressorNode;
    private effect: TunaEffect

    public setVolume(volume: number)
    {
        this.masterVolume.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }

    public changeOscillatorParams(oscillatorParams: OscillatorType)
    {
        for (let [_, value] of this.voices)
        {
            value.changeOscillatorParams(oscillatorParams);
        }
    }

    public changeEnvelopeParams(envelopeParams: EnvelopeParams)
    {
        for (let [_, value] of this.voices)
        {
            value.changeEnvelopeParams(envelopeParams);
        }
    }

    public changeEffectParams(effectParams: EffectParams)
    {
        this.effect.changeEffectParams(effectParams);

        for (let [_, val] of this.voices)
        {
            val.connect(this.effect.node);
        }
    }

    public changeFilterParams(filterParams: FilterParams)
    {
        for (let [_, value] of this.voices)
        {
            value.changeFilterParams(filterParams);
        }
    }

    constructor(audioContext: AudioContext, params: SoundEngineParams) {

        this.mixCompressor = audioContext.createDynamicsCompressor();
        this.mixCompressor.ratio.setValueAtTime(1.5, audioContext.currentTime)
        this.mixCompressor.attack.setValueAtTime(0.05, audioContext.currentTime)
        this.mixCompressor.release.setValueAtTime(0.25, audioContext.currentTime)

        this.masterVolume = audioContext.createGain();

        this.effect = new TunaEffect(audioContext, this.mixCompressor, params.effectParams);

        this.mixCompressor.connect(this.masterVolume);
        this.masterVolume.connect(audioContext.destination);
        this.masterVolume.gain.value = params.volume;

        this.audioContext = audioContext;

        this.voices = new Map<number, Voice>();
        for (let i of params.midiVoices)
        {
            this.voices.set(i, new Voice(this.audioContext, this.effect.node, params.voiceParams));
        }
    }

    public play(noteNumber: number) {
        let voice = this.voices.get(noteNumber);
        if (voice)
        {
            voice.play(noteNumber);
        }
    }

    public stop(noteNumber: number) {
        let voice = this.voices.get(noteNumber);
        if (voice)
        {
            voice.stop();
        }
    }
}

