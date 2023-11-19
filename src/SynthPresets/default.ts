import {EnvelopeParams} from "../soundEngine/Envelope";
import {FilterParams} from "../soundEngine/Filter";
import * as os from "os";

const envelopeParams: EnvelopeParams = {
    attack: 0.5,
    decay: 0.8,
    sustain: 1,
    release: 2,
    sustainLevel: 0.2,
}

const filterParams: FilterParams = {
    type: 'lowpass',
    frequency: 350,
    Q: 1,
}

const oscillatorParams: OscillatorType = "sine"


export default {
    envelopeParams: envelopeParams,
    filterParams: filterParams,
    oscillatorParams: oscillatorParams,

}

