import Tuna from 'tunajs'

export interface EffectParams
{

}

export class TunaEffect
{
    private tuna
    public node : Tuna.TunaAudioNode

    constructor(audioContext: AudioContext) {
        this.tuna = new Tuna(audioContext);
        this.node = new this.tuna.Chorus({
            rate: 1.5,
            feedback: 0.8,
            delay: 0.05,
            bypass: false
        });
    }
}