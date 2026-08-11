'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SidebarCategories from '@/components/SidebarCategories';

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-50 shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 dark:text-slate-300 hover:text-fuchsia-700 dark:hover:text-fuchsia-400 focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xl leading-none">B</span>
            </div>
            <Link href="/" className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight hover:opacity-90 transition">
              BOKASHA
            </Link>
          </div>
        </div>

        {/* Global Search Bar (Only visible on Desktop, except when on homepage where sidebar has it) */}
        {pathname !== '/' && (
          <div className="flex-1 max-w-md hidden md:block ml-4">
            <form action="/" method="GET" className="relative w-full group">
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-fuchsia-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="w-full bg-slate-50 dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-5 py-2 pl-11 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-sm"
              />
            </form>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <ThemeToggle />
          <Link href="/contact" className="hidden sm:flex items-center gap-1.5 bg-fuchsia-700 hover:bg-fuchsia-800 text-white text-sm font-semibold px-4 py-2 rounded-md transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Contact Us
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800/80 shadow-xl z-50 p-4 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="mb-6">
            <form action="/" method="GET" className="relative w-full group">
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-fuchsia-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="w-full bg-slate-50 dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-5 py-2.5 pl-11 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-sm"
              />
            </form>
          </div>

          <div onClick={() => setIsMobileMenuOpen(false)}>
            <SidebarCategories />
          </div>

          <div className="flex flex-col gap-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-fuchsia-700 text-white text-sm font-semibold px-4 py-3 rounded-md shadow-sm">
              Contact Us
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 border border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-400 text-sm font-semibold px-4 py-3 rounded-md">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
