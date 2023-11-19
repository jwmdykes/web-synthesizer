import {createOscillator} from "./Oscillator";

export type EnvelopeParams = {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}

export class Envelope {
    static readonly minimumStopTime = 0.01;

    public attack: number;
    public decay: number;
    public sustain: number;
    public release: number;
    public readonly node: GainNode;
    private audioContext: AudioContext;
    private oscillator?: OscillatorNode;

    constructor(audioContext: AudioContext, parentNode: AudioNode, {
        attack,
        decay,
        sustain,
        release
    }: EnvelopeParams) {
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;

        this.audioContext = audioContext;
        this.node = new GainNode(audioContext, {
            gain: 0,
        });
        this.node.connect(parentNode);
    }

    public attach(node: AudioNode) {
        node.connect(this.node);
    }

    public play() {
        const maxGain = 1;
        const sustainGain = maxGain * 0.5; // should be a parameter

        // Set initial value
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime);
        this.node.gain.cancelAndHoldAtTime(this.audioContext.currentTime + 0.001);

        // Attack
        this.node.gain.linearRampToValueAtTime(maxGain, this.audioContext.currentTime + this.attack + 0.001);
        // Decay
        this.node.gain.linearRampToValueAtTime(sustainGain, this.audioContext.currentTime + this.attack + this.decay + 0.001);
    }


    // performs the usual release callback after stopping the note
    public stop() {
        console.log(`STOPPING! Releasing with time: ${this.release}`);
        console.log(`current gain: ${this.node.gain.value}`);
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime);
        this.node.gain.cancelAndHoldAtTime(this.audioContext.currentTime + 0.001);
        this.node.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.release);
    }

}