import Tuna from 'tunajs'

export interface PingPongDelayProperties {
    wetLevel: number,
    feedback: number,
    delayTimeLeft: number,
    delayTimeRight: number,
}

export interface PingPongEffectParams {
    activeEffect: null | "ping-pong",
    effectParams: PingPongDelayProperties,
}


export class PingPongEffect {
    private readonly parent: AudioNode | Tuna.TunaAudioNode
    private tuna
    public node: Tuna.TunaAudioNode


    public changeEffectParams(effectParams: PingPongEffectParams) {
        this.node.disconnect(this.parent)

        switch (effectParams.activeEffect) {
            case "ping-pong":
                this.node = new this.tuna.PingPongDelay(effectParams.effectParams)
                break;
            default:
                this.node = new this.tuna.Gain({
                    bypass: true,
                });
                break;
        }

        this.node.connect(this.parent)
    }

    constructor(audioContext: AudioContext, parent: AudioNode | Tuna.TunaAudioNode, effectParams: PingPongEffectParams) {
        this.parent = parent;
        this.tuna = new Tuna(audioContext);

        switch (effectParams.activeEffect) {
            case "ping-pong":
                this.node = new this.tuna.PingPongDelay(effectParams.effectParams)
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


export interface ChorusParams {
    rate: number,
    feedback: number,
    delay: number,
    bypass: boolean,
}

export interface ChorusEffectParams {
    activeEffect: null | 'chorus',
    effectParams: ChorusParams
}

export class ChorusEffect {
    private readonly parent: AudioNode | Tuna.TunaAudioNode;
    private tuna;
    public node: Tuna.TunaAudioNode;

    public changeEffectParams(effectParams: ChorusEffectParams) {
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

    constructor(audioContext: AudioContext, parent: AudioNode | Tuna.TunaAudioNode, effectParams: ChorusEffectParams) {
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