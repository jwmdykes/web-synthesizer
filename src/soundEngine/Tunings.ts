export const midiNoteToFrequency = (midiNoteNumber: number): number => {
    const f0 = 440; // A4
    const a = Math.pow(2, 1 / 12);

    return f0 * Math.pow(a, midiNoteNumber - 69);
}
