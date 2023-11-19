import {Voice, VoiceParams} from "./Voice";

export interface SoundEngineParams {
    midiVoices: number[],
    voiceParams: VoiceParams,
}

export class SoundEngine {
    private voiceParams: VoiceParams;
    private readonly voices: Map<number, Voice>;
    private readonly audioContext: AudioContext;
    private readonly masterVolume: GainNode;


    constructor(audioContext: AudioContext, params: SoundEngineParams) {
        console.log(params.midiVoices);
        this.masterVolume = audioContext.createGain();
        this.masterVolume.connect(audioContext.destination);
        this.masterVolume.gain.value = 1;

        this.audioContext = audioContext;
        this.voiceParams = params.voiceParams;

        this.voices = new Map<number, Voice>;
        for (let i of params.midiVoices)
        {
            this.voices.set(i, new Voice(this.audioContext, this.masterVolume, this.voiceParams));
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

