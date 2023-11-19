import {createFilterNode, FilterParams} from "./Filter";
import {Envelope, EnvelopeParams} from "./Envelope";
import {createOscillator} from "./Oscillator";
import {midiNoteToFrequency} from "./Tunings";

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
    private crossfadeGain?: GainNode;
    private params: VoiceParams;

    public changeEnvelopeParams(envelopeParams: EnvelopeParams)
    {
        this.envelope.attack = envelopeParams.attack;
        this.envelope.sustain = envelopeParams.sustain;
        this.envelope.sustainLevel = envelopeParams.sustainLevel;
        this.envelope.decay = envelopeParams.decay;
        this.envelope.release = envelopeParams.release;
    }

    public changeOscillatorParams(oscillatorParams: OscillatorType)
    {
        this.params = {
            ...this.params,
            oscillatorParams: oscillatorParams,
        }
    }

    constructor(audioContext: AudioContext, parentNode: AudioNode, params: VoiceParams) {
        this.params = params;
        this.audioContext = audioContext;

        this.envelope = new Envelope(audioContext, parentNode, params.envelopeParams);
        // this.filter = createFilterNode(audioContext, params.filterParams);
        // this.filter.connect(parentNode);
    }

    private createOscillator(noteNumber: number)
    {
        const newOscillator = createOscillator(this.audioContext, this.params.oscillatorParams, noteNumber);
        // gain used for avoiding clipping when replacing oscillators.
        const crossfadeGain : GainNode = new GainNode(this.audioContext, {
            gain: 0,
        });

        newOscillator.connect(crossfadeGain);
        crossfadeGain.connect(this.envelope.node);
        newOscillator.start();

        return {
            oscillator: newOscillator,
            crossfadeGain: crossfadeGain,
        };
    }

    private performCrossfade(noteNumber: number) {
        const crossfadeTime = 0.001; // Adjust as needed

        let newOscillator = this.createOscillator(noteNumber);

        if (this.oscillator == null)
        {
            this.oscillator = newOscillator.oscillator;
            this.crossfadeGain = newOscillator.crossfadeGain;

            this.crossfadeGain.gain.exponentialRampToValueAtTime(1, this.audioContext.currentTime + crossfadeTime);
        }
        else
        {
            // crossfade between new and old oscillator
            console.log("DISCONNECTING OLD OSCILLATOR!")
            this.crossfadeGain?.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
            this.crossfadeGain?.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + crossfadeTime);
            newOscillator.crossfadeGain.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
            newOscillator.crossfadeGain.gain.exponentialRampToValueAtTime(1, this.audioContext.currentTime + crossfadeTime);
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