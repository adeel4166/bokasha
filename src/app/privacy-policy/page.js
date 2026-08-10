'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      <main className="max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 border-l-4 border-fuchsia-600 pl-4 tracking-tight">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-justify text-sm">
          <p>
            At <strong>BOKASHA</strong>, we prioritize the privacy of our visitors. This Privacy Policy document outlines the types of personal information that is received and collected by our platform and how it is utilized.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-10">1. Log Files</h2>
          <p>
            Like many other Web sites, BOKASHA makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user’s movement around the site, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-10">2. Cookies and Web Beacons</h2>
          <p>
            BOKASHA does use cookies to store information about visitors preferences, record user-specific information on which pages the user accesses or visits, customize Web page content based on visitors browser type or other information that the visitor sends via their browser.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-10">3. Amazon Affiliate Cookies (Third-Party Partners)</h2>
          <p>
            When you click on an affiliate link leading to Amazon from BOKASHA, Amazon places a specialized tracking cookie in your browser. This cookie is used solely to identify that your traffic originated from our website, allowing us to earn credit if a qualifying purchase is made. 
          </p>
          <p>
            These cookies automatically expire within 24 hours of clicking the link or once a purchase is finalized. Amazon's tracking cookies are subject to Amazon's own Privacy Policy which you can review directly on their official website.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-10">4. DoubleClick DART Cookie</h2>
          <p>
            Google, as a third party vendor, uses cookies to serve ads on BOKASHA. Google's use of the DART cookie enables it to serve ads to users based on their visit to BOKASHA and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-10">5. Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms. If you require any more information or have any questions about our privacy policy, please feel free to contact us.
          </p>
        </div>
      </main>
    </div>
  );
}
