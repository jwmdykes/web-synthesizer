import {createFilterNode, FilterParams} from "./Filter";
import {Envelope, EnvelopeParams} from "./Envelope";
import {createOscillator} from "./Oscillator";

export interface VoiceParams {
    filterParams: FilterParams,
    envelopeParams: EnvelopeParams,
    oscillatorParams: OscillatorType,
}

export class Voice {

    private readonly audioContext: AudioContext;
    private oscillator?: OscillatorNode;
    private readonly envelope: Envelope;
    // private readonly filter: BiquadFilterNode;
    private params: VoiceParams;

    constructor(audioContext: AudioContext, parentNode: AudioNode, params: VoiceParams) {
        this.params = params;
        this.audioContext = audioContext;

        this.envelope = new Envelope(audioContext, parentNode, params.envelopeParams);
        // this.filter = createFilterNode(audioContext, params.filterParams);
        this.envelope.node.connect(parentNode);
        // this.filter.connect(parentNode);
    }

    private createOscillator(noteNumber: number) {
        this.oscillator?.disconnect();

        this.oscillator = createOscillator(this.audioContext, this.params.oscillatorParams, noteNumber)
        this.envelope.attach(this.oscillator);
    }

    public play(noteNumber: number) {
        this.createOscillator(noteNumber);
        this.oscillator?.start();

        this.envelope.play();
    }

    public stop() {
        this.envelope.stop();
    }
}