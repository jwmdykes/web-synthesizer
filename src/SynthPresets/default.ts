import {EnvelopeParams} from "../soundEngine/Envelope";
import {FilterParams} from "../soundEngine/Filter";
import {ChorusParams, EffectParams} from "../soundEngine/TunaEffect";

const envelopeParams: EnvelopeParams = {
    attack: 0.5,
    decay: 0.8,
    sustain: 1,
    release: 2,
}

const filterParams: FilterParams = {
    type: 'lowpass',
    frequency: 100,
    Q: 1,
    LFOFrequency: 1,
    LFOBypass: false,
    LFOOscillation: 400,
}

const delayParams: ChorusParams = {
    rate: 1.5,
    feedback: 0.8,
    delay: 0.05,
    bypass: false,
}

const oscillatorParams: OscillatorType = "sine"

const effectParams: EffectParams = {
    activeEffect: "chorus",
    effectParams: delayParams,
}

export default {
    envelopeParams: envelopeParams,
    filterParams: filterParams,
    oscillatorParams: oscillatorParams,
    volume: 50,
    effectParams: effectParams,
}

