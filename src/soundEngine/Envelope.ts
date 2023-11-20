export type EnvelopeParams = {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    sustainLevel: number;
}

export class Envelope {
    static maxVolume = 0.5;

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
        console.log(`playing note. CURRENT GAIN: ${this.node.gain.value}`)
        // Set initial value
        this.node.gain.cancelScheduledValues(this.audioContext.currentTime)
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime)

        // Attack
        this.node.gain.linearRampToValueAtTime(Envelope.maxVolume, this.audioContext.currentTime + this.attack + 0.0002);
        // Decay
        this.node.gain.linearRampToValueAtTime(this.sustainLevel * Envelope.maxVolume, this.audioContext.currentTime + this.attack + this.decay + 0.0002);
    }


    // performs the usual release callback after stopping the note
    public stop() {
        console.log("STOPPING")
        console.log(`Value: ${this.node.gain.value}`)
        console.log(`RELEASE: ${this.release}`)
        console.log(`sustain: ${this.sustainLevel}`)
        this.node.gain.cancelScheduledValues(this.audioContext.currentTime)
        this.node.gain.setValueAtTime(this.node.gain.value, this.audioContext.currentTime)
        this.node.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.release + 0.0001)
    }
}