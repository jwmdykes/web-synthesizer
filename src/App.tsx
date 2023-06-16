import React from 'react';

function App() {
  return (
    <div className="App h-full">
      <nav className="navbar bg-base-100">
        <div className="navbar-start">
          <a href="/" className='btn btn-ghost normal-case text-xl'>Synthesizer</a>
        </div>
      </nav>

      <main className='h-full flex flex-col align-middle justify-center'>
        <div className='flex justify-center'>
          <button className='btn btn-primary'>Play Sound!</button>
        </div>
      </main>
    </div>
  );
}

export default App;
