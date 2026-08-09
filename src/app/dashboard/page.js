'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function WriterDashboard() {
  const [asinOrUrl, setAsinOrUrl] = useState('');
  const [region, setRegion] = useState('US');
  const [trackingId, setTrackingId] = useState('');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [duplicateSlug, setDuplicateSlug] = useState('');
  const [dupCopied, setDupCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  const timerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchSession();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push('/login');
      } else {
        setUser(data.user);
        
        // Pre-populate tracking ID for the default region (US)
        if (data.user.trackingIds) {
          const defaultTag = data.user.trackingIds.find(t => t.region === 'US');
          if (defaultTag) {
            setTrackingId(defaultTag.tracking_id);
          }
        }
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth?logout=true');
    router.push('/login');
    router.refresh();
  };

  // Automatically update tracking ID field when region dropdown changes
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    if (user && user.trackingIds) {
      const matchedTag = user.trackingIds.find(t => t.region === newRegion);
      if (matchedTag) {
        setTrackingId(matchedTag.tracking_id);
      } else {
        setTrackingId(''); // Clear or let user type manually
      }
    }
  };

  // Pleasant Web Audio API Synthesizer (Double high chime)
  const playSuccessSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      
      const osc1 = context.createOscillator();
      const gain1 = context.createGain();
      osc1.connect(gain1);
      gain1.connect(context.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, context.currentTime); // C5
      gain1.gain.setValueAtTime(0.15, context.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
      osc1.start();
      osc1.stop(context.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, context.currentTime); // E5
        gain2.gain.setValueAtTime(0.15, context.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.25);
        osc2.start();
        osc2.stop(context.currentTime + 0.25);
      }, 100);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setDuplicateSlug('');
    setTimerSeconds(0);
    setLoading(true);

    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asinOrUrl, region }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'duplicate') {
          setDuplicateSlug(data.slug);
          throw new Error(data.message || 'Product already reviewed.');
        }
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);
      setAsinOrUrl('');
      playSuccessSound();
      fetchSession(); // Update limits count
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      clearInterval(timerRef.current);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const link = `${window.location.origin}/post/${result.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUrlInputChange = (val) => {
    setAsinOrUrl(val);
    const cleanVal = val.toLowerCase().trim();
    let detectedRegion = '';
    
    if (cleanVal.includes('amazon.co.uk')) {
      detectedRegion = 'UK';
    } else if (cleanVal.includes('amazon.de')) {
      detectedRegion = 'DE';
    } else if (cleanVal.includes('amazon.ca')) {
      detectedRegion = 'CA';
    } else if (cleanVal.includes('amazon.fr')) {
      detectedRegion = 'FR';
    } else if (cleanVal.includes('amazon.it')) {
      detectedRegion = 'IT';
    } else if (cleanVal.includes('amazon.com')) {
      detectedRegion = 'US';
    }

    if (detectedRegion) {
      handleRegionChange(detectedRegion);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#070a13] text-slate-800 dark:text-slate-100">
        <span className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#121b2e] via-[#090d18] to-[#04060c] light:from-slate-100 light:via-slate-200/80 light:to-white dark:from-[#121b2e] dark:via-[#090d18] dark:to-[#04060c] text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative transition-colors duration-200">
      
      {/* Floating Header Actions (Absolute Positioning for cleaner card look) */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {user.role === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="bg-amber-550/10 border border-amber-550/20 text-amber-500 hover:bg-amber-550/20 text-xs px-3.5 py-2 rounded-xl font-bold transition shadow-sm"
          >
            Admin Controls
          </button>
        )}
        <ThemeToggle />
      </div>

      {/* Main Centered E-commerce Layout Card */}
      <div className="w-full max-w-lg bg-white dark:bg-[#0c0f1d]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-850/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        
        {/* Top Session Banner inside card */}
        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs">
          <span className="text-slate-655 dark:text-slate-400">
            Logged in as <strong className="text-slate-900 dark:text-white font-black">{user.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 font-extrabold transition"
          >
            Log out
          </button>
        </div>

        {/* Title / Identity */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-widest text-slate-900 dark:text-white uppercase">
            BOKASHA
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Amazon Product Article Generator
          </p>
        </div>

        {/* Main Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          
          {/* 1. Amazon Product Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Amazon Product URL / ASIN
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-550 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm">URL</span>
                <span className="px-2 py-0.5 rounded">ASIN</span>
              </div>
            </div>
            <input
              type="text"
              required
              value={asinOrUrl}
              disabled={loading}
              onChange={(e) => handleUrlInputChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition disabled:opacity-50"
              placeholder="https://www.amazon.com/dp/B0GTYJWMNM..."
            />
          </div>

          {/* 2. Target Region Select */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Target Region
            </label>
            <select
              value={region}
              disabled={loading}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition disabled:opacity-50"
            >
              <option value="US">US - United States</option>
              <option value="UK">UK - United Kingdom</option>
              <option value="DE">DE - Germany</option>
              <option value="CA">CA - Canada</option>
              <option value="FR">FR - France</option>
              <option value="IT">IT - Italy</option>
            </select>
          </div>

          {/* 3. Pre-populated Affiliate Tracking Tag */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Affiliate Tracking ID
            </label>
            <input
              type="text"
              readOnly
              value={trackingId || 'No tag configured for this region'}
              className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-500 dark:text-amber-500 font-mono font-bold focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-800 dark:text-red-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span>{error}</span>
              {duplicateSlug && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/post/${duplicateSlug}`;
                      navigator.clipboard.writeText(link);
                      setDupCopied(true);
                      setTimeout(() => setDupCopied(false), 2000);
                    }}
                    className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-350 dark:border-slate-700 px-3.5 py-1.5 rounded-lg font-bold text-[10px] transition"
                  >
                    {dupCopied ? 'Copied! ✓' : 'Copy Link'}
                  </button>
                  <a
                    href={`/post/${duplicateSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg font-bold text-[10px] transition"
                  >
                    View Post
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Success Notification Alert */}
          {result && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
              <span>{result.message}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-350 dark:border-slate-700 px-3.5 py-1.5 rounded-lg font-bold text-[10px] transition"
                >
                  {copied ? 'Copied! ✓' : 'Copy Link'}
                </button>
                <a
                  href={`/post/${result.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg font-bold text-[10px] transition"
                >
                  View Post
                </a>
              </div>
            </div>
          )}

          {/* Submit Button with realtime loading timer */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Review... {timerSeconds}s elapsed</span>
              </>
            ) : (
              'Generate & Auto Post'
            )}
          </button>
        </form>

        {/* Card Footer: Monthly Quota Details */}
        <div className="pt-5 border-t border-slate-250 dark:border-slate-850 flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-widest">
          <span>Monthly Quota:</span>
          <span>{user.used_quota} / {user.article_quota} Articles Generated</span>
        </div>

      </div>
    </div>
  );
}
