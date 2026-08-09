'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function TermsOfServicePage() {
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
      <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 border-l-4 border-amber-500 pl-3">
          Terms of Service
        </h1>
        
        <div className="space-y-6 text-slate-650 dark:text-slate-350 leading-relaxed text-justify text-sm">
          <p>
            Welcome to <strong>BOKASHA</strong>. By accessing or using this website, you agree to be bound by the following Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            By visiting BOKASHA, you acknowledge that you have read, understood, and agree to be bound by these terms, as well as our Privacy Policy and Affiliate Disclaimers. If you do not agree to any of these terms, please stop using the website.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">2. Use License</h2>
          <p>
            Permission is granted to temporarily view the content on BOKASHA for personal, non-commercial transitory viewing only. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy the materials.</li>
            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial).</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website.</li>
            <li>Remove any copyright or other proprietary notations from the materials.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">3. Disclaimer</h2>
          <p>
            The materials on BOKASHA are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
          <p>
            Furthermore, BOKASHA does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">4. Limitations</h2>
          <p>
            In no event shall BOKASHA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if we have been notified orally or in writing of the possibility of such damage.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">5. Revisions and Errata</h2>
          <p>
            The materials appearing on BOKASHA could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on the website at any time without notice.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">6. Site Terms of Service Modifications</h2>
          <p>
            BOKASHA may revise these terms of service for its web site at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
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
