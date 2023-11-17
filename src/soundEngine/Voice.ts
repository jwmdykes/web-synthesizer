import {createFilterNode, FilterParams} from "./Filter";
import {createADSRNode, EnvelopeParams} from "./Envelope";
import {createOscillator} from "./Oscillator";
import {midiNoteToFrequency} from "./Tunings";

export interface VoiceParams {
    filterParams: FilterParams,
    envelopeParams: EnvelopeParams,
    oscillatorParams: OscillatorType,
}

export class Voice {
    private readonly audioContext: AudioContext;
    private readonly oscillator: OscillatorNode;
    private readonly envelope: GainNode;
    private readonly filter: BiquadFilterNode;

    public headNode: AudioNode;

    constructor(audioContext: AudioContext, params: VoiceParams) {
        this.audioContext = audioContext;
        this.oscillator = createOscillator(audioContext, params.oscillatorParams, 0);
        this.envelope = createADSRNode(audioContext, params.envelopeParams);
        this.headNode = this.filter = createFilterNode(audioContext, params.filterParams);

        this.oscillator.connect(this.envelope);
        this.envelope.connect(this.filter);
    }

    play(noteNumber: number) {
        this.oscillator.frequency.setValueAtTime(midiNoteToFrequency(noteNumber), this.audioContext.currentTime);
        this.oscillator.start();
    }

    stop() {

    }
}