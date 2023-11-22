import Tuna from 'tunajs'

export interface ChorusParams {
    rate: number,
    feedback: number,
    delay: number,
    bypass: boolean,
}

export interface EffectParams {
    activeEffect: null | "chorus",
    effectParams: ChorusParams,
}

export class TunaEffect {
    private readonly parent: AudioNode | Tuna.TunaAudioNode
    private tuna
    public node: Tuna.TunaAudioNode


    public changeEffectParams(effectParams: EffectParams) {
        this.node.disconnect(this.parent)

        switch (effectParams.activeEffect) {
            case "chorus":
                this.node = new this.tuna.Chorus(effectParams.effectParams)
                break;
            default:
                this.node = new this.tuna.Gain({
                    bypass: true,
                });
                break;
        }

        this.node.connect(this.parent)
    }

    constructor(audioContext: AudioContext, parent: AudioNode | Tuna.TunaAudioNode, effectParams: EffectParams) {
        this.parent = parent;
        this.tuna = new Tuna(audioContext);

        switch (effectParams.activeEffect) {
            case "chorus":
                this.node = new this.tuna.Chorus(effectParams.effectParams)
                break;
            default:
                this.node = new this.tuna.Gain({
                    bypass: true,
                });
                break;
        }
        this.node.connect(this.parent)
    }
}