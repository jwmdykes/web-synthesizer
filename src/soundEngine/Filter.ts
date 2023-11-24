import {TunaAudioNode} from "tunajs";

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export interface FilterParams {
    type: FilterType,
    Q: number,
    frequency: number,
    LFOBypass: boolean,
    LFOFrequency: number,
    LFOOscillation: number,
}

export class Filter {
    public type: FilterType;
    public Q: number;
    public frequency: number;
    public node: BiquadFilterNode;
    public LFO: OscillatorNode;

    private audioContext: AudioContext;
    private parentNode: AudioNode | TunaAudioNode;
    private constantSourceNode: ConstantSourceNode;
    private lfoGain: GainNode;

    public setParent(node: AudioNode | TunaAudioNode) {
        this.parentNode = node;
    }

    constructor(audioContext: AudioContext, parentNode: AudioNode | TunaAudioNode, {
        type,
        Q,
        frequency,
        LFOBypass,
        LFOOscillation,
        LFOFrequency
    }: FilterParams) {
        console.log(`Oscillation: ${LFOOscillation}`)
        console.log(`Frequency: ${LFOFrequency}`)

        this.parentNode = parentNode;
        this.audioContext = audioContext

        this.type = type
        this.Q = Q;
        this.frequency = frequency;

        this.node = this.createFilterNode();

        // set up lfo
        this.LFO = new OscillatorNode(audioContext, {
            frequency: LFOFrequency,
            type: "sine",
        })
        this.lfoGain = audioContext.createGain();
        this.lfoGain.gain.value = LFOOscillation / 2;

        this.constantSourceNode = new ConstantSourceNode(audioContext);
        this.constantSourceNode.offset.value = this.frequency;
        this.constantSourceNode.start();
        this.constantSourceNode.connect(this.node.frequency);

        this.LFO.start();
        this.LFO.connect(this.lfoGain);
        this.lfoGain.connect(this.node.frequency);

        this.node.connect(this.parentNode)
    }

    public changeFilterParams(filterParams: FilterParams) {
        console.log("CHANGING FILTER PARAMS");
        console.log(filterParams);

        this.type = filterParams.type;
        this.Q = filterParams.Q;
        this.frequency = filterParams.frequency;

        this.lfoGain.gain.value = filterParams.LFOOscillation / 2;
        this.LFO.frequency.value = filterParams.LFOFrequency;

        this.node.type = this.type;
        this.node.Q.value = this.Q;
        this.constantSourceNode.offset.value = this.frequency
    }

    private createFilterNode() {
        let node = this.audioContext.createBiquadFilter()
        node.type = this.type;
        node.Q.value = this.Q;
        node.frequency.value = 0;
        return node;
    }
}