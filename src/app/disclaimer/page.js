'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function DisclaimerPage() {
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
          Affiliate Disclosure & Disclaimer
        </h1>
        
        <div className="space-y-6 text-slate-650 dark:text-slate-350 leading-relaxed text-justify text-sm">
          <p>
            Welcome to <strong>BOKASHA</strong>. In alignment with keeping full transparency with our readers, we provide this comprehensive disclosure regarding our affiliate relationships, advertising policies, and content disclaimers.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">1. Amazon Associates Program Disclosure</h2>
          <p>
            BOKASHA is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for website owners to earn advertising fees by advertising and linking to Amazon websites (including amazon.com, amazon.co.uk, amazon.de, amazon.ca, amazon.fr, amazon.it, and any other website that may be affiliated with Amazon Service LLC Associates Program).
          </p>
          <p>
            As an Amazon Associate, we earn from qualifying purchases. This means that when you click on one of our recommended product links and make a purchase on Amazon within 24 hours, we receive a small percentage of the sale as a commission at <strong>no additional cost to you</strong>.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">2. FTC Compliance</h2>
          <p>
            The Federal Trade Commission (FTC) requires disclosures regarding any relationship that exists between a content creator and a service provider or product manufacturer. BOKASHA always aims to comply fully with these guidelines. 
          </p>
          <p>
            Please assume that any link directing you to Amazon or another merchant on our website is an affiliate link, and that we will receive a commission if you make a purchase through those links.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">3. Pricing and Product Specification Disclaimer</h2>
          <p>
            Product prices, stock availability, and specifications are retrieved dynamically or based on data scraped directly from Amazon listing pages. Amazon prices fluctuate frequently.
          </p>
          <p>
            Therefore, any price details or availability statuses displayed on BOKASHA are only accurate as of the time the content was generated. We do not guarantee the accuracy of pricing, and we advise all readers to check the real-time details directly on the Amazon store page by clicking the <strong>"Check Price on Amazon"</strong> button before checking out.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">4. No Editorial Bias</h2>
          <p>
            Our product reviews and comparison metrics are generated using data-driven benchmarks, user feedback, and technical specifications. While we receive commissions from purchases made through affiliate links, this does not influence our editorial assessments or reviews. We aim to present honest, balanced pros and cons for every product to help you make informed buying decisions.
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
