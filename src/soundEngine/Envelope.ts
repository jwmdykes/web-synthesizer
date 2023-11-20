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

    public play() {

        // Set initial value
        this.node.gain.cancelScheduledValues(this.audioContext.currentTime)
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime)

        // Attack
        this.node.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + this.attack);
        // Decay
        this.node.gain.linearRampToValueAtTime(this.sustainLevel, this.audioContext.currentTime + this.attack + this.decay);
    }


    // performs the usual release callback after stopping the note
    public stop() {
        console.log("STOPPING")
        console.log(`Value: ${this.node.gain.value}`)
        console.log(`RELEASE: ${this.release}`)
        // this.node.gain.cancelScheduledValues(this.audioContext.currentTime);
        // this.node.gain.setValueAtTime(this.sustainLevel, this.audioContext.currentTime)
        console.log(`sustain: ${this.sustainLevel}`)

        this.node.gain.cancelScheduledValues(this.audioContext.currentTime)
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime)
        this.node.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + this.release + 0.0001)
    }
}