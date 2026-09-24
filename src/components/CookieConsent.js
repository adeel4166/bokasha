'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700">
      <div className="text-sm text-slate-300 max-w-4xl text-center sm:text-left">
        We use cookies to improve your experience, personalize content, and serve personalized ads. 
        By continuing to use this site, you consent to our use of cookies in accordance with our <a href="/privacy-policy" className="text-fuchsia-400 hover:underline">Privacy Policy</a>.
      </div>
      <div className="flex gap-3">
        <button onClick={accept} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
          Accept All
        </button>
      </div>
    </div>
  );
}
