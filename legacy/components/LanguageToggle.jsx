import React from 'react';

function LanguageToggle() {
  return (
    <div className="flex overflow-hidden gap-1 self-stretch p-1.5 px-2.5 my-auto rounded-3xl bg-neutral-700 w-[108px]">
      <div className="grow my-auto text-lg leading-none text-white">English</div>
      <div className="px-2 py-1 text-base font-medium leading-none text-center bg-white rounded-full fill-white h-[29px] text-zinc-800 w-[29px]">
        A
      </div>
    </div>
  );
}

export default LanguageToggle;