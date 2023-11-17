export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export interface FilterParams {
    type: FilterType,
    Q: number,
    frequency: number,
}

export function createFilterNode(audioContext: AudioContext, { type, Q, frequency }: FilterParams) {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = type;
    filterNode.frequency.value = frequency;
    filterNode.Q.value = Q;

    return filterNode;
}

