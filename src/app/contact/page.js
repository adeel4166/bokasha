'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-200 flex flex-col justify-between transition-colors duration-200">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c0f1d]/75 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
          <Link href="/" className="text-xl font-black text-slate-900 dark:text-white tracking-widest hover:opacity-90 transition">
            BOKASHA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              &larr; Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-[#0c0f1d]/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-md space-y-6">
          
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Have a question or feedback? Drop us a message below.</p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-550/10 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs text-center font-bold">
              Thank you for contacting us! We will get back to you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/45 focus:border-amber-500 transition"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/45 focus:border-amber-500 transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase tracking-wider mb-2">Message</label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/45 focus:border-amber-500 transition resize-none text-sm"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              Send Message
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#04060c] py-8 text-center text-xs text-slate-500 px-6">
        <div className="max-w-4xl mx-auto w-full">
          <p>&copy; {new Date().getFullYear()} BOKASHA. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
