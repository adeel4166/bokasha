import Link from 'next/link';

export default function GlobalFooter() {
  return (
    <footer className="bg-[#1a2035] text-slate-300 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xl leading-none">B</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">BOKASHA</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Explore product summaries, category guides, and Amazon shopping references to compare features before buying.
          </p>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-300">
              Affiliate Disclosure: As an Amazon Associate we earn from qualifying purchases.
            </p>
            <p className="text-[10px] text-slate-500">
              Purchases through our links are at no extra cost to you. Product availability is subject to change. Some product images and details are provided by Amazon and may change without notice.
            </p>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li><Link href="/" className="hover:text-fuchsia-400 transition">All Products</Link></li>
            <li><Link href="/?latest=true" className="hover:text-fuchsia-400 transition">Latest Products</Link></li>
            <li><Link href="/dashboard" className="hover:text-fuchsia-400 transition">Writer Login</Link></li>
            <li><Link href="/contact" className="hover:text-fuchsia-400 transition">Contact Us</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-4">
          <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li><Link href="/terms-of-service" className="hover:text-fuchsia-400 transition">Terms & Conditions</Link></li>
            <li><Link href="/disclaimer" className="hover:text-fuchsia-400 transition">Affiliate Disclosure</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-fuchsia-400 transition">Privacy Policy</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-700/50 text-center">
        <p className="text-[10px] text-slate-500">
          &copy; {new Date().getFullYear()} BOKASHA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
