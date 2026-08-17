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

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    if (user && user.trackingIds) {
      const matchedTag = user.trackingIds.find(t => t.region === newRegion);
      if (matchedTag) {
        setTrackingId(matchedTag.tracking_id);
      } else {
        setTrackingId('');
      }
    }
  };

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
      osc1.frequency.setValueAtTime(523.25, context.currentTime); 
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
        osc2.frequency.setValueAtTime(659.25, context.currentTime);
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
      fetchSession(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      clearInterval(timerRef.current);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const link = `${window.location.origin}/post/${result.slug}?ref=${user.username}`;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100">
        <span className="w-8 h-8 border-4 border-fuchsia-700 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative transition-colors duration-200">
      
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {user.role === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="bg-fuchsia-50 dark:bg-fuchsia-900/30 border border-fuchsia-200 dark:border-fuchsia-800/50 text-fuchsia-700 dark:text-fuchsia-400 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 text-xs px-3.5 py-2 rounded-lg font-bold transition shadow-sm"
          >
            Admin Controls
          </button>
        )}
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Logged in as <strong className="text-slate-800 dark:text-white font-black">{user.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="text-fuchsia-700 dark:text-fuchsia-400 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 font-extrabold transition"
          >
            Log out
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-fuchsia-700 flex items-center justify-center shadow-sm mb-3">
            <span className="text-white font-black text-2xl leading-none">B</span>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-slate-900 dark:text-white uppercase">
            BOKASHA
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            Product Content Generator
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-100 dark:border-fuchsia-800/30 rounded-xl p-3 text-center">
            <span className="block text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-bold uppercase tracking-widest mb-1">Total Posts</span>
            <span className="block text-xl font-black text-fuchsia-900 dark:text-fuchsia-100">{user.total_posts || 0}</span>
          </div>
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30 rounded-xl p-3 text-center">
            <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest mb-1">Generated</span>
            <span className="block text-xl font-black text-sky-900 dark:text-sky-100">{user.used_quota || 0}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-3 text-center">
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-1">Available</span>
            <span className="block text-xl font-black text-emerald-900 dark:text-emerald-100">{Math.max(0, (user.article_quota || 0) - (user.used_quota || 0))}</span>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Amazon Product URL / ASIN
            </label>
            <input
              type="text"
              required
              value={asinOrUrl}
              disabled={loading}
              onChange={(e) => handleUrlInputChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-700 focus:border-fuchsia-700 transition disabled:opacity-50"
              placeholder="https://www.amazon.com/dp/B0GTYJWMNM..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Target Region
            </label>
            <select
              value={region}
              disabled={loading}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-700 focus:border-fuchsia-700 transition disabled:opacity-50 appearance-none"
            >
              <option value="US">US - United States</option>
              <option value="UK">UK - United Kingdom</option>
              <option value="DE">DE - Germany</option>
              <option value="CA">CA - Canada</option>
              <option value="FR">FR - France</option>
              <option value="IT">IT - Italy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Affiliate Tracking ID
            </label>
            <input
              type="text"
              readOnly
              value={trackingId || 'No tag configured for this region'}
              className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-500 dark:text-fuchsia-500 font-mono font-bold focus:outline-none cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg text-red-800 dark:text-red-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span>{error}</span>
              {duplicateSlug && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/post/${duplicateSlug}?ref=${user.username}`;
                      navigator.clipboard.writeText(link);
                      setDupCopied(true);
                      setTimeout(() => setDupCopied(false), 2000);
                    }}
                    className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md font-bold text-[11px] transition"
                  >
                    {dupCopied ? 'Copied! ✓' : 'Copy Link'}
                  </button>
                  <a
                    href={`/post/${duplicateSlug}?ref=${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-bold text-[11px] transition"
                  >
                    View Post
                  </a>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg text-green-800 dark:text-green-300 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <span>{result.message}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md font-bold text-[11px] transition"
                >
                  {copied ? 'Copied! ✓' : 'Copy Link'}
                </button>
                <a
                  href={`/post/${result.slug}?ref=${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none text-center bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-3 py-1.5 rounded-md font-bold text-[11px] transition"
                >
                  View Post
                </a>
              </div>
            </div>
          )}

          {loading ? (
            <div className="w-full mt-4 bg-slate-100 dark:bg-[#0b0f19] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative h-14 flex items-center justify-center">
              <div 
                className="absolute top-0 left-0 h-full bg-fuchsia-600 transition-all duration-1000 ease-linear opacity-20"
                style={{ width: `${Math.min((timerSeconds / 20) * 100, 95)}%` }}
              ></div>
              <span className="relative z-10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></span>
                {timerSeconds < 5 ? 'Scraping Amazon data...' 
                 : timerSeconds < 10 ? 'AI is writing the magic...' 
                 : timerSeconds < 15 ? 'Formatting article...' 
                 : 'Saving your article...'} ({timerSeconds}s)
              </span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-bold text-sm py-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-3 mt-4"
            >
              Generate & Auto Post
            </button>
          )}
        </form>

      </div>
    </div>
  );
}
