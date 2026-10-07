import React from 'react';

function Divider() {
  return (
    <div className="flex gap-2.5 justify-center items-center px-2 py-1 mt-6 w-full text-2xl leading-10 text-center whitespace-nowrap text-slate-900 max-md:max-w-full">
      <div className="shrink-0 self-stretch my-auto h-px border border-solid border-slate-900 w-[140px]" />
      <div className="self-stretch my-auto w-9">OR</div>
      <div className="shrink-0 self-stretch my-auto h-px border border-solid border-slate-900 w-[140px]" />
    </div>
  );
}

export default Divider;