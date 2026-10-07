import React from 'react';

function InputField({ label, placeholder, prefix, value, onChange }) {
  return (
    <div className="flex flex-col mt-6 w-full max-w-[444px] max-md:max-w-full">
      <label className="text-2xl font-medium leading-none text-neutral-800 max-md:max-w-full">
        {label}
      </label>
      <div className="flex items-center p-3 mt-4 w-full rounded-lg bg-zinc-50 min-h-[54px] shadow-[0px_0px_2px_rgba(0,0,0,1)] max-md:max-w-full">
        {prefix && (
          <span className="self-stretch my-auto text-lg leading-loose text-stone-500 text-opacity-70 w-[33px]">
            {prefix}
          </span>
        )}
        <div className="flex gap-2.5 items-start self-stretch py-1 pr-1 pl-1 my-auto w-2">
          <div className="flex w-px rounded-lg bg-zinc-800 min-h-[22px]" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}  // Set the value prop
          onChange={onChange}  // Set the onChange prop
          className="flex-1 shrink self-stretch my-auto text-lg leading-loose basis-0 text-stone-500 text-opacity-70 bg-transparent border-none outline-none"
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default InputField;
