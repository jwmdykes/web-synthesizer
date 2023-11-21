import {MouseEventHandler, ReactNode} from 'react';

function WhiteKey(props: {
    letter: string;
    children: ReactNode;
    mouseDownCallback: MouseEventHandler;
    mouseUpCallback: MouseEventHandler;
}) {
    return (
        <>
            <div
                className='w-full relative'
                onPointerDown={props.mouseDownCallback}
                onPointerLeave={props.mouseUpCallback}
            >
                <div
                    className='font-semibold text-gray-700 bg-white rounded-b-md w-full h-full border border-gray-950 hover:cursor-pointer hover:bg-slate-200 flex items-end justify-center pb-6'>
                    {props.letter}
                </div>
                {props.children}
            </div>
        </>
    );
}

function BlackKey(props: {
    letter: string;
    mouseDownCallback: MouseEventHandler;
    mouseUpCallback: MouseEventHandler;
}) {
    return (
        <>
            <div
                className='tracking-widest text-gray-200 font-semibold bg-black w-1/2 h-1/2 border border-gray-800 hover:cursor-pointer hover:bg-gray-600 flex items-center justify-center absolute top-0 right-0 translate-x-1/2 rounded-b-md z-10'
                onPointerDown={props.mouseDownCallback}
                onPointerLeave={props.mouseUpCallback}
            >
                {/*{props.letter}*/}
            </div>
        </>
    );
}

export default function Piano(props: {
    mouseDownCallbackCreator: (note: number) => MouseEventHandler;
    mouseUpCallbackCreator: (note: number) => MouseEventHandler;
}) {
    const whiteKeys: Array<string> = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'];
    const whiteKeyMidiNumbers: Map<string, number> = new Map([
        ['C', 60],
        ['D', 62],
        ['E', 64],
        ['F', 65],
        ['G', 67],
        ['A', 69],
        ['B', 71],
        ['C2', 72],
    ]);

    return (
        <div className='m-auto w-full max-w-screen-tablet h-full bg-gray-900 rounded-t-md border-t border-slate-700 drop-shadow-lg p-2'>
            <div className='h-full flex justify-center'>
                <div className='flex flex-row w-full h-full overflow-hidden select-none'>
                    {whiteKeys.map((key, index) => {
                        const midiNumber: number = whiteKeyMidiNumbers.get(key) ?? 0;

                        return (
                            <>
                                <WhiteKey
                                    letter={key}
                                    key={key}
                                    mouseDownCallback={props.mouseDownCallbackCreator(midiNumber)}
                                    mouseUpCallback={props.mouseUpCallbackCreator(midiNumber)}
                                >
                                    {key !== 'B' &&
                                    key !== 'E' &&
                                    index !== whiteKeys.length - 1 ? (
                                        <BlackKey
                                            key={key + '♯'}
                                            letter={key + '♯'}
                                            mouseDownCallback={props.mouseDownCallbackCreator(
                                                midiNumber + 1
                                            )}
                                            mouseUpCallback={props.mouseUpCallbackCreator(
                                                midiNumber + 1
                                            )}
                                        />
                                    ) : null}
                                </WhiteKey>
                            </>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
