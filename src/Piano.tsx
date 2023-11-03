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
  mouseDownCallback: MouseEventHandler;
  mouseUpCallback: MouseEventHandler;
}) {
  const whiteKeys: Array<string> = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  return (
    <div className='h-full bg-blue-950 p-2'>
      <div className='h-full'>
        <div className='flex flex-row h-full overflow-hidden'>
          {whiteKeys.map((key, index) => {
            return (
              <>
                <WhiteKey
                  letter={key}
                  key={key}
                  mouseDownCallback={props.mouseDownCallback}
                  mouseUpCallback={props.mouseUpCallback}
                >
                  {key !== 'B' &&
                  key !== 'E' &&
                  index !== whiteKeys.length - 1 ? (
                    <BlackKey
                      letter={key + '#'}
                      mouseDownCallback={props.mouseDownCallback}
                      mouseUpCallback={props.mouseUpCallback}
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
