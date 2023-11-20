import {Voice, VoiceParams} from "./Voice";
import {EnvelopeParams} from "./Envelope";
import {FilterParams} from "./Filter";

export interface SoundEngineParams {
    midiVoices: number[],
    voiceParams: VoiceParams,
    volume: number,
}

export class SoundEngine {
    private readonly voices: Map<number, Voice>;
    private readonly audioContext: AudioContext;
    private readonly masterVolume: GainNode;
    private readonly mixCompressor: DynamicsCompressorNode;

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

    public changeFilterParams(filterParams: FilterParams)
    {
        console.log("MODIFYING FILTER PARAMS:")
        console.log(filterParams)
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
        this.mixCompressor.connect(this.masterVolume);
        this.masterVolume.connect(audioContext.destination);
        this.masterVolume.gain.value = params.volume;

        this.audioContext = audioContext;

        this.voices = new Map<number, Voice>;
        for (let i of params.midiVoices)
        {
            this.voices.set(i, new Voice(this.audioContext, this.mixCompressor, params.voiceParams));
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

