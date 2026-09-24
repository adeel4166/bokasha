import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | BOKASHA',
  description: 'Learn more about BOKASHA and our mission to provide unbiased product reviews.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 flex-1">
      <div className="bg-white dark:bg-[#0c0f1d]/40 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">About BOKASHA</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your trusted source for unbiased product reviews and buying guides.</p>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
            <p>At BOKASHA, our mission is simple: to help you make informed purchasing decisions. In a world full of endless product options, we aim to cut through the noise by providing clear, concise, and honest product reviews.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">What We Do</h2>
            <p>We analyze and summarize products from global Amazon marketplaces. Whether you are looking for the latest tech gadgets, home essentials, or lifestyle products, our curated guides bring you the most important features, pros, and cons.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Why Trust Us?</h2>
            <p>We operate with transparency. As an Amazon Associate, we earn from qualifying purchases, but this does not affect our recommendations. Our primary goal is to provide value to our readers. We combine automated data gathering with careful curation to ensure you get accurate and up-to-date information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Get in Touch</h2>
            <p>We always love hearing from our readers! If you have any questions, suggestions, or feedback, please visit our <Link href="/contact" className="text-fuchsia-600 dark:text-fuchsia-400 hover:underline">Contact Page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
