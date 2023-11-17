import {Voice, VoiceParams} from "./Voice";

export interface SoundEngineParams
{
    voices: number,
    voiceParams: VoiceParams,
}

export class SoundEngine
{
    private voiceParams: VoiceParams;
    private voices: Voice[];
    private activeVoices: number[];
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext, params: SoundEngineParams)
    {
        this.audioContext = audioContext;
        this.activeVoices = [];
        this.voiceParams = params.voiceParams;
        this.voices = [];
        for (let i=0; i < params.voices; i++)
        {
            this.voices.push(this.createVoice());
        }
    }

    createVoice() : Voice
    {
       return new Voice(this.audioContext, this.voiceParams);
    }
}

