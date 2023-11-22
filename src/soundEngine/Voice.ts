import {Filter, FilterParams} from "./Filter";
import {Envelope, EnvelopeParams} from "./Envelope";
import {createOscillator} from "./Oscillator";
import {TunaAudioNode} from "tunajs";

export interface VoiceParams {
    filterParams: FilterParams,
    envelopeParams: EnvelopeParams,
    oscillatorParams: OscillatorType,
}

export class Voice {
    static maxVolume = 0.5;

    private parent: AudioNode | TunaAudioNode;
    private readonly audioContext: AudioContext;
    private readonly oscillatorOutput: AudioNode | TunaAudioNode;
    private readonly envelope: Envelope;
    private readonly filter: Filter;
    private oscillator?: OscillatorNode;
    private crossfadeGain?: GainNode;
    private params: VoiceParams;

    public changeEnvelopeParams(envelopeParams: EnvelopeParams) {
        this.envelope.attack = envelopeParams.attack;
        this.envelope.sustain = envelopeParams.sustain;
        this.envelope.decay = envelopeParams.decay;
        this.envelope.release = envelopeParams.release;
    }

    public connect(destination: AudioNode | TunaAudioNode) {
        this.filter.node.disconnect();
        this.parent = destination
        this.filter.node.connect(this.parent);
        this.filter.setParent(this.parent);
    }

    public changeOscillatorParams(oscillatorParams: OscillatorType) {
        this.params = {
            ...this.params,
            oscillatorParams: oscillatorParams,
        }
    }

    public changeFilterParams(filterParams: FilterParams) {
        this.filter.changeFilterParams(filterParams);
    }

    constructor(audioContext: AudioContext, parentNode: AudioNode | TunaAudioNode, params: VoiceParams) {
        this.params = params;
        this.audioContext = audioContext;
        this.parent = parentNode;

        this.filter = new Filter(this.audioContext, parentNode, this.params.filterParams);
        this.envelope = new Envelope(audioContext, this.filter.node, params.envelopeParams);
        this.oscillatorOutput = this.envelope.node;
    }

    private createOscillator(noteNumber: number) {
        const newOscillator = createOscillator(this.audioContext, this.params.oscillatorParams, noteNumber);
        // gain used for avoiding clipping when replacing oscillators.
        const crossfadeGain: GainNode = new GainNode(this.audioContext, {
            gain: 0,
        });

        newOscillator.connect(crossfadeGain);
        crossfadeGain.connect(this.oscillatorOutput);
        newOscillator.start();

        return {
            oscillator: newOscillator,
            crossfadeGain: crossfadeGain,
        };
    }

    private performCrossfade(noteNumber: number) {
        const crossfadeTime = 0.001; // Adjust as needed

        let newOscillator = this.createOscillator(noteNumber);

        if (this.oscillator == null) {
            this.oscillator = newOscillator.oscillator;
            this.crossfadeGain = newOscillator.crossfadeGain;

            // first do a linear ramp to a very small value, or else firefox gives an error.
            this.crossfadeGain.gain.linearRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.00001)
            this.crossfadeGain.gain.exponentialRampToValueAtTime(Voice.maxVolume, this.audioContext.currentTime + crossfadeTime + 0.00001);
        } else {
            this.crossfadeGain?.gain.cancelScheduledValues(this.audioContext.currentTime)
            this.crossfadeGain?.gain.setValueAtTime(this.crossfadeGain?.gain.value, this.audioContext.currentTime
            );
            if (this.crossfadeGain != null && this.crossfadeGain?.gain.value > 0) {
                this.crossfadeGain?.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + crossfadeTime);
            }

            // first do a linear ramp to a very small value, or else firefox gives an error.
            newOscillator.crossfadeGain.gain.linearRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.00001)
            newOscillator.crossfadeGain.gain.exponentialRampToValueAtTime(Voice.maxVolume, this.audioContext.currentTime + crossfadeTime + 0.00001);
            this.oscillator.stop(this.audioContext.currentTime + crossfadeTime);

            this.oscillator = newOscillator.oscillator;
            this.crossfadeGain = newOscillator.crossfadeGain;
        }
    }

    public play(noteNumber: number) {
        this.performCrossfade(noteNumber); // create new oscillator and crossfade between old and new one.
        this.envelope.play();
    }

    public stop() {
        this.envelope.stop();
    }
}