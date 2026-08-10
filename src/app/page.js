import { query } from '@/lib/db';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import FilterSelect from '@/components/FilterSelect';

export const revalidate = 60;

export default async function BlogHome({ searchParams }) {
  const searchQuery = searchParams?.q || '';
  const filterRegion = searchParams?.region || '';
  const filterCategory = searchParams?.category || '';
  const isLatest = searchParams?.latest === 'true';

  let databasePosts = [];
  try {
    let sql = 'SELECT title, slug, image_url, region, category, badge, content, created_at FROM posts WHERE status = "published"';
    let params = [];

    if (searchQuery) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ? OR region = ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, searchQuery.toUpperCase().trim());
    }

    if (filterRegion) {
      sql += ' AND region = ?';
      params.push(filterRegion);
    }

    if (filterCategory) {
      sql += ' AND category = ?';
      params.push(filterCategory);
    }

    if (isLatest) {
      sql += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
    }

    sql += ' ORDER BY created_at DESC';
    databasePosts = await query(sql, params);
  } catch (error) {
    console.error('Failed to load posts from database:', error);
  }

  const categoriesList = ['Electronics', 'Home & Kitchen', 'Garden & Outdoors', 'Sports & Outdoors', 'Health & Personal Care', 'Automotive', 'Tools & DIY'];
  const allPosts = [...databasePosts];

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'CA', name: 'Canada' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. TOP NAVBAR */}
      <nav className="bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xl leading-none">B</span>
            </div>
            <Link href="/" className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight hover:opacity-90 transition">
              BOKASHA
            </Link>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <form action="/" method="GET" className="relative w-full group">
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-fuchsia-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products..."
                className="w-full bg-slate-50 dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-5 py-2.5 pl-11 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-sm"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/contact" className="hidden sm:flex items-center gap-1.5 bg-fuchsia-700 hover:bg-fuchsia-800 text-white text-sm font-semibold px-4 py-2 rounded-md transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Contact Us
            </Link>
            <Link href="/login" className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-transparent border border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-400 text-sm font-semibold px-4 py-2 rounded-md hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. SECONDARY NAVBAR (Categories) */}
      <div className="bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-8">
          <ul className="flex items-center gap-8 py-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
            {categoriesList.slice(0, 5).map(cat => (
              <li key={cat}>
                <Link href={`/?category=${encodeURIComponent(cat)}`} className="hover:text-fuchsia-700 dark:hover:text-fuchsia-400 transition flex items-center gap-1">
                  {cat}
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="hover:text-fuchsia-700 dark:hover:text-fuchsia-400 transition flex items-center gap-1">
                See All
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. AFFILIATE BANNER */}
      <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] md:text-xs font-semibold text-center py-2.5 px-4 border-b border-fuchsia-100 dark:border-fuchsia-900/50">
        As an Amazon Associate we earn from qualifying purchases. <Link href="/disclaimer" className="underline hover:text-fuchsia-600 dark:hover:text-fuchsia-200">Learn more &gt;</Link>
      </div>

      {/* 4. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex-1">
        
        <div className="space-y-6 mb-10">
          <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
            {filterCategory ? filterCategory : 'All Products'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse product recommendations with links to trusted retailers
          </p>

          {/* Top Filters & Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className={`px-5 py-2 text-sm font-semibold rounded-md transition ${!isLatest ? 'bg-fuchsia-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              All Products
            </Link>
            <Link href="/?latest=true" className={`px-5 py-2 text-sm font-semibold rounded-md transition flex items-center gap-2 ${isLatest ? 'bg-fuchsia-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Latest (24h)
            </Link>
          </div>

          {/* Search & Country Filter Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
            
            <form action="/" method="GET" className="w-full md:flex-1 relative">
              <input 
                type="text" 
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products..." 
                className="w-full bg-white dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:border-fuchsia-500 focus:outline-none transition shadow-sm"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 rounded-r-md text-sm font-semibold transition">
                Search
              </button>
            </form>

            <div className="flex gap-4 w-full md:w-auto">
              <FilterSelect 
                name="category"
                placeholder="Categories..."
                defaultValue={filterCategory}
                options={categoriesList.map(c => ({ value: c, label: c }))}
              />

              <FilterSelect 
                name="region"
                placeholder="Filter by country"
                defaultValue={filterRegion}
                options={regions.map(r => ({ value: r.code, label: r.name }))}
              />
            </div>
          </div>
          
          <p className="text-xs text-slate-400 font-medium pt-2">
            Showing {allPosts.length} products
          </p>
        </div>

        {/* 5. PRODUCT GRID */}
        {allPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {allPosts.map((post) => (
              <div key={post.slug} className="group flex flex-col items-center text-center">
                
                <Link href={`/post/${post.slug}`} className="w-full bg-white dark:bg-[#070a13] rounded-xl p-4 flex items-center justify-center aspect-square mb-4 transition transform group-hover:scale-105 duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-contain filter drop-shadow-sm" />
                </Link>

                <div className="flex flex-col flex-1 justify-between w-full space-y-4">
                  <Link href={`/post/${post.slug}`}>
                    <h3 className="text-[13px] md:text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-400 transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <Link 
                    href={`/post/${post.slug}`}
                    className="w-full bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-semibold text-xs py-3 px-4 rounded-md transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    See Details
                    <span className="text-lg leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl text-slate-500">No products found matching your criteria.</h3>
          </div>
        )}

      </main>

      {/* 6. DARK FOOTER */}
      <footer className="bg-[#1a2035] text-slate-300 py-16 mt-10">
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
              <li><Link href="/" className="hover:text-fuchsia-400 transition">Articles and Buying Guides</Link></li>
              <li><Link href="/" className="hover:text-fuchsia-400 transition">About Us</Link></li>
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

    </div>
  );
}
