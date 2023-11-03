import { MouseEventHandler, ReactNode } from 'react';

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
        onMouseDown={props.mouseDownCallback}
        onMouseUp={props.mouseUpCallback}
      >
        <div className='text-gray-700 bg-white w-full h-full border border-gray-800 hover:cursor-pointer hover:bg-slate-200 flex items-center justify-center'>
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
        className='text-gray-200 bg-black w-1/2 h-1/2 border border-gray-800 hover:cursor-pointer hover:bg-gray-600 flex items-center justify-center absolute top-0 right-0 translate-x-1/2 rounded-b-md z-10'
        onMouseDown={props.mouseDownCallback}
        onMouseUp={props.mouseUpCallback}
      >
        {props.letter}
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
    <div className='h-full bg-blue-950 p-2'>
      <div className='h-full'>
        <div className='flex flex-row h-full overflow-hidden'>
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
                      letter={key + '#'}
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
