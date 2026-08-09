'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeroCarousel({ posts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused && posts.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % posts.length);
      }, 3000); // Rotate slide every 3 seconds
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, posts.length]);

  if (!posts || posts.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % posts.length);
  };

  const getExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    const clean = htmlContent.replace(/<[^>]*>/g, ' ');
    return clean.length > 160 ? clean.substring(0, 160) + '...' : clean;
  };

  const getBadgeColor = (badge) => {
    const clean = badge?.toLowerCase() || '';
    if (clean.includes('top pick')) return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-250 dark:border-emerald-800';
    if (clean.includes('best seller')) return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-250 dark:border-indigo-800';
    if (clean.includes('editor')) return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-250 dark:border-indigo-850';
    return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-250 dark:border-amber-800';
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-white dark:bg-[#0c0f1d]/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 group h-[650px] sm:h-[500px] md:h-[400px] flex flex-col justify-stretch"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative flex-1 flex flex-col">
        {posts.map((post, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={`${post.slug}-${idx}`}
              className={`w-full h-full flex flex-col md:flex-row transition-all duration-700 ease-in-out absolute inset-0 ${
                isActive 
                  ? 'opacity-100 z-10 pointer-events-auto transform translate-x-0' 
                  : 'opacity-0 z-0 pointer-events-none transform translate-x-4'
              }`}
            >
              {/* Product Image Panel: Styled with modern slate background and centered white card frame */}
              <div className="h-[45%] md:h-full md:w-1/2 bg-slate-50 dark:bg-[#080c16] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-150 dark:border-slate-800 flex-shrink-0 relative">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 w-[85%] h-[85%] max-h-[240px] flex items-center justify-center group-hover:scale-102 transition duration-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                  />
                </div>
                
                <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Featured Review
                </span>
                
                {post.badge && (
                  <span className={`absolute top-4 right-4 text-[9px] uppercase font-black tracking-wider px-3 py-1 border rounded-full ${getBadgeColor(post.badge)}`}>
                    {post.badge}
                  </span>
                )}
              </div>
              
              {/* Product Details Panel */}
              <div className="h-[55%] md:h-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-3 md:space-y-4 bg-white dark:bg-[#0c0f1d]/20">
                <div className="space-y-3">
                  <div className="flex gap-2 items-center text-xs text-slate-500 font-mono">
                    <span className="text-amber-500 font-extrabold uppercase tracking-wider">{post.category}</span>
                    <span>•</span>
                    <span>{post.region} Store</span>
                  </div>
                  
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug hover:text-amber-500 transition line-clamp-3">
                    {post.slug === '#' ? (
                      post.title
                    ) : (
                      <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    )}
                  </h2>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify line-clamp-4">
                    {getExcerpt(post.content)}
                  </p>
                </div>
                
                <div className="pt-5 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(() => {
                      const d = new Date(post.created_at);
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                    })()}
                  </span>
                  
                  {post.slug !== '#' ? (
                    <Link 
                      href={`/post/${post.slug}`} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition"
                    >
                      Read Review &rarr;
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono italic">Sample Content</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {posts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-slate-950/60 hover:bg-slate-950 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md focus:outline-none"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-950/60 hover:bg-slate-950 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md focus:outline-none"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom Slider Indicators/Dots */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {posts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex 
                  ? 'w-6 bg-amber-500 shadow-sm' 
                  : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
