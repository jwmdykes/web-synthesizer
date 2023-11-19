import {Voice, VoiceParams} from "./Voice";

export interface SoundEngineParams {
    numVoices: number,
    voiceParams: VoiceParams,
}

export class SoundEngine {
    private voiceParams: VoiceParams;
    private readonly voices: Voice[];
    private readonly audioContext: AudioContext;
    private readonly masterVolume: GainNode;


    constructor(audioContext: AudioContext, params: SoundEngineParams) {
        this.masterVolume = audioContext.createGain();
        this.masterVolume.connect(audioContext.destination);
        this.masterVolume.gain.value = 1;

        this.audioContext = audioContext;
        this.voiceParams = params.voiceParams;

        this.voices = [];
        for (let i = 0; i < params.numVoices; i++) {
            this.voices.push(new Voice(this.audioContext, this.masterVolume, this.voiceParams));
        }
    }

    public play(noteNumber: number) {
        let found = false;

        // disable all voices playing this note
        for (let i = 0; i < this.voices.length; i++) {
            let voice = this.voices[i]
            if (voice.getActiveNote() == noteNumber) {
                if (!found) // if this is the first one found, reuse it.
                {
                    console.log(`CASE 1 Playing existing voice ${i}. Note ${noteNumber}`)
                    voice.play(noteNumber)
                    found = true;
                } else {
                    voice.stop();
                }
            }
        }

        if (found) return;

        // find an available voice and play the note
        for (let i = 0; i < this.voices.length; i++) {
            let voice = this.voices[i]
            if (voice.getActiveNote() == null) {
                console.log(`CASE 2Playing voice ${i}. Note: ${noteNumber}`)
                voice.play(noteNumber);
                break;
            }
        }

        // todo handle the case where there is no available voice
    }

    public stop(noteNumber: number) {
        for (let i = 0; i < this.voices.length; i++) {
            let voice = this.voices[i]
            if (voice.getActiveNote() === noteNumber) {
                voice.stop();
            }
        }
    }
}

