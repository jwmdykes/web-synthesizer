export type filterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export interface filterParams {
    type: filterType,
    Q: number,
    frequency: number,
}

export function createFilterNode(audioContext: AudioContext, { type, Q, frequency }: filterParams) {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = type;
    filterNode.frequency.value = frequency;
    filterNode.Q.value = Q;

    return filterNode;
}

