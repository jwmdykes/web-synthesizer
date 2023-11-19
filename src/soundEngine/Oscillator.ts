import {midiNoteToFrequency} from "./Tunings";

export const createOscillator = (audioContext: AudioContext, type: OscillatorType, noteNumber: number) => {
    return new OscillatorNode(audioContext, {
        frequency: midiNoteToFrequency(noteNumber),
        type: type,
    });
}