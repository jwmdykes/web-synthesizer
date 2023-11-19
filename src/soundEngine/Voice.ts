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
    private activeNote : number | null;
    private params: VoiceParams;

    public getActiveNote()
    {
        return this.activeNote
    }

    constructor(audioContext: AudioContext, parentNode: AudioNode, params: VoiceParams) {
        this.params = params;
        this.activeNote = null;
        this.audioContext = audioContext;

        this.envelope = new Envelope(audioContext, parentNode, params.envelopeParams);
        // this.filter = createFilterNode(audioContext, params.filterParams);
        this.envelope.node.connect(parentNode);
        // this.filter.connect(parentNode);
    }

    private createOscillator(noteNumber: number)
    {
        this.oscillator?.stop()
        this.oscillator?.disconnect();

        if (this.oscillator != null)
        {
            this.envelope.attach(this.oscillator);
        }
        this.oscillator = createOscillator(this.audioContext, this.params.oscillatorParams, noteNumber)
    }

    public play(noteNumber: number) {
        this.oscillator?.disconnect();
        this.oscillator = createOscillator(this.audioContext, this.params.oscillatorParams, noteNumber);
        this.oscillator.connect(this.envelope.node);
        this.oscillator.start();

        // this.createOscillator(noteNumber);
        // this.oscillator?.start();
        this.activeNote = noteNumber;
        this.envelope.play();
    }

    public stop() {
        this.envelope.stop();
        this.activeNote = null;
    }
}