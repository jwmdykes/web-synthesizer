import {EnvelopeParams} from "../soundEngine/Envelope";
import {FilterParams} from "../soundEngine/Filter";
import {
    ChorusEffectParams,
    ChorusParams,
    PingPongDelayProperties,
    PingPongEffectParams
} from "../soundEngine/TunaEffect";

const envelopeParams: EnvelopeParams = {
    attack: 0.5,
    decay: 0.8,
    sustain: 1,
    release: 2,
}

const filterParams: FilterParams = {
    type: 'lowpass',
    frequency: 1500,
    Q: 4,
    LFOFrequency: 2,
    LFOBypass: false,
    LFOOscillation: 300,
}

const chorusParams: ChorusParams = {
    rate: 1.5,
    feedback: 0.8,
    delay: 0.05,
    bypass: false,
}

const pingPongParams: PingPongDelayProperties = {
    wetLevel: 0.5,       //0 to 1
    feedback: 0.3,       //0 to 1
    delayTimeLeft: 200,  //1 to 10000 (milliseconds)
    delayTimeRight: 400  //1 to 10000 (milliseconds)
}

const oscillatorParams: OscillatorType = "sine"

const chorusEffectParams: ChorusEffectParams = {
    activeEffect: null,
    effectParams: chorusParams,
}

const pingPongEffectParams: PingPongEffectParams = {
    activeEffect: "ping-pong",
    effectParams: pingPongParams
}

export default {
    envelopeParams: envelopeParams,
    filterParams: filterParams,
    oscillatorParams: oscillatorParams,
    volume: 50,
    chorusEffectParams: chorusEffectParams,
    pingPongEffectParams: pingPongEffectParams,
}

