import Tuna, {TunaAudioNode} from "tunajs";

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
    public LFO: Tuna.TunaAudioNode;

    private tuna: Tuna
    private audioContext: AudioContext;
    private parentNode: AudioNode | TunaAudioNode;

    public setParent(node: AudioNode | TunaAudioNode)
    {
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
        this.parentNode = parentNode;
        this.audioContext = audioContext

        this.type = type
        this.Q = Q;
        this.frequency = frequency;

        this.node = this.createFilterNode();

        this.tuna = new Tuna(audioContext)
        this.LFO = new this.tuna.LFO({
            target: this.node.frequency,
            oscillation: LFOOscillation,
            bypass: LFOBypass,
            frequency: LFOFrequency
        })

        this.node.connect(this.parentNode)
    }

    public changeFilterParams(filterParams: FilterParams)
    {
        this.type = filterParams.type;
        this.Q = filterParams.Q;
        this.frequency = filterParams.frequency;

        this.node.type = this.type;
        this.node.Q.value = this.Q;
        this.node.frequency.value = this.frequency;
    }

    private createFilterNode() {
        let node = this.audioContext.createBiquadFilter()
        node.type = this.type;
        node.Q.value = this.Q;
        node.frequency.value = this.frequency;
        return node;
    }
}