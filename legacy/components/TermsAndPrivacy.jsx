import React from 'react';

function TermsAndPrivacy() {
  return (
    <p className="mt-11 text-lg leading-9 text-center text-neutral-800 max-md:mt-10 max-md:max-w-full">
      By Continuing, you agree to the{' '}
      <a href="#" className="font-semibold text-blue-700">
        Terms of use
      </a>{' '}
      &{' '}
      <a href="#" className="font-semibold text-blue-700">
        Privacy policies
      </a>
    </p>
  );
}

export default TermsAndPrivacy;