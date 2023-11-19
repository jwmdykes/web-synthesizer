export type EnvelopeParams = {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    sustainLevel: number;
}

export class Envelope {
    public attack: number;
    public decay: number;
    public sustain: number;
    public release: number;
    public sustainLevel: number;
    public readonly node: GainNode;
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext, parentNode: AudioNode, {
        attack,
        decay,
        sustain,
        release,
        sustainLevel,
    }: EnvelopeParams) {
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;
        this.sustainLevel = sustainLevel;
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
        const sustainGain = maxGain * this.sustainLevel; // should be a parameter

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
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime);
        this.node.gain.cancelAndHoldAtTime(this.audioContext.currentTime + 0.001);
        this.node.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.release);
    }

}