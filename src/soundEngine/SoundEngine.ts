import {Voice, VoiceParams} from "./Voice";
import {EnvelopeParams} from "./Envelope";
import {FilterParams} from "./Filter";

export interface SoundEngineParams {
    midiVoices: number[],
    voiceParams: VoiceParams,
}

export class SoundEngine {
    private readonly voices: Map<number, Voice>;
    private readonly audioContext: AudioContext;
    private readonly masterVolume: GainNode;

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
        this.masterVolume = audioContext.createGain();
        this.masterVolume.connect(audioContext.destination);
        this.masterVolume.gain.value = 1;

        this.audioContext = audioContext;

        this.voices = new Map<number, Voice>;
        for (let i of params.midiVoices)
        {
            this.voices.set(i, new Voice(this.audioContext, this.masterVolume, params.voiceParams));
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

