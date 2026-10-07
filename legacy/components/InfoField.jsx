import React from 'react';

function InfoField({ label, value }) {
  return (
    <div className="flex flex-col grow shrink min-w-[240px] w-[326px]">
      <label className="text-md leading-snug text-neutral-800">{label}</label>
      <div className="flex items-center p-1 mt-4 w-full bg-teal-50 rounded-lg max-w-[408px] shadow-[0px_0px_2px_rgba(0,0,0,1)]">
        <div className="flex gap-2 items-start self-stretch py-1 pr-1 pl-1 my-auto w-2">
          <div className="flex w-px rounded-lg bg-zinc-800 min-h-[22px]" />
        </div>
        <div className="flex-1 shrink self-stretch my-auto text-md font-medium leading-loose text-black basis-0">
          {value}
        </div>
      </div>
    </div>
  );
}

export default InfoField;