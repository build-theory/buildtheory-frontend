import React from 'react';

function ScrollBar() {
  return (
    <div className="flex flex-col self-stretch pt-2.5 pb-96 w-4 rounded-3xl bg-zinc-300 shadow-[0px_0px_4px_rgba(0,0,0,0.25)] max-md:hidden max-md:pb-24">
      <div className="flex shrink-0 rounded-xl bg-zinc-50 h-[273px] max-md:hidden" />
    </div>
  );
}

export default ScrollBar;