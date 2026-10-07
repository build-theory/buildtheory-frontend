import React from 'react';

function GoogleLoginButton() {
  return (
    <button className="flex gap-2.5 justify-center items-center px-10 py-2 mt-6 w-full text-lg font-medium leading-10 rounded-3xl border border-solid bg-zinc-50 border-zinc-400 text-slate-900 max-md:px-5 max-md:max-w-full">
      <img
        loading="lazy"
        src=""
        alt="Google logo"
        className="object-contain shrink-0 self-stretch my-auto w-10 rounded aspect-square"
      />
      <span className="self-stretch my-auto">Continue with Google</span>
    </button>
  );
}

export default GoogleLoginButton;