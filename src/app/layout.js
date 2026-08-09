import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BOKASHA - Verified Product Reviews & Buying Guides',
  description: 'Unbiased and dynamic product review articles and comparisons from global Amazon marketplaces.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-[#070a13] dark:text-slate-100 min-h-screen transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
