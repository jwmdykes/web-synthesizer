import { ReactNode } from 'react';

export default function ControlBox(props: { children: ReactNode }) {
  return (
    <div className='p-5 bg-gray-900 rounded-md border-t border-slate-700 drop-shadow-lg flex flex-col items-center'>
      {props.children}
    </div>
  );
}
