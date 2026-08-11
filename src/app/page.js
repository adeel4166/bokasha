import { query } from '@/lib/db';
import Link from 'next/link';
import FilterSelect from '@/components/FilterSelect';
import SidebarCategories from '@/components/SidebarCategories';

export const revalidate = 60;

export default async function BlogHome({ searchParams }) {
  const searchQuery = searchParams?.q || '';
  const filterRegion = searchParams?.region || '';
  const filterCategory = searchParams?.category || '';
  const filterSubcategory = searchParams?.sub || '';
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
    
    // Note: If you want to filter by subcategory, you would add a column to DB or parse from category. 
    // For now, we simulate subcategory filtering or just ignore if it's not in DB schema yet.

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
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1">
      
      {/* 1. AFFILIATE BANNER (Moved here for page context) */}
      <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] md:text-xs font-semibold text-center py-2.5 px-4 rounded-lg mb-8 border border-fuchsia-100 dark:border-fuchsia-900/50">
        As an Amazon Associate we earn from qualifying purchases. <Link href="/disclaimer" className="underline hover:text-fuchsia-600 dark:hover:text-fuchsia-200">Learn more &gt;</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* SIDEBAR (Desktop: 3 cols, Mobile: Hidden) */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          
          {/* Mobile/Sidebar Search */}
          <div className="md:hidden">
            <form action="/" method="GET" className="relative w-full group">
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3 transition-colors group-focus-within:text-fuchsia-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products..."
                className="w-full bg-white dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-5 py-2.5 pl-11 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-sm"
              />
            </form>
          </div>

          <SidebarCategories />
          
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4 mt-6">
             <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Filter by Country</h3>
             <FilterSelect 
                name="region"
                placeholder="All Regions"
                defaultValue={filterRegion}
                options={regions.map(r => ({ value: r.code, label: r.name }))}
              />
          </div>
        </aside>

        {/* MAIN CONTENT (9 cols) */}
        <main className="md:col-span-9">
          
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
              {filterSubcategory ? `${filterCategory} > ${filterSubcategory}` : filterCategory ? filterCategory : 'All Products'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse product recommendations with links to trusted retailers
            </p>

            {/* Top Filters & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex gap-2">
                <Link href="/" className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${!isLatest && !filterCategory ? 'bg-fuchsia-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  All
                </Link>
                <Link href="/?latest=true" className={`px-4 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${isLatest ? 'bg-fuchsia-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Latest (24h)
                </Link>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Showing {allPosts.length} products
              </p>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {allPosts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {allPosts.map((post) => (
                <div key={post.slug} className="group relative flex flex-col bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800/60 hover:border-fuchsia-200 dark:hover:border-fuchsia-900/50 rounded-xl transition-all hover:shadow-md overflow-hidden">
                  
                  {/* Absolute Badges */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-fuchsia-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-sm">
                      {post.region}
                    </span>
                  </div>
                  {post.badge && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-amber-400 text-amber-950 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-sm">
                        {post.badge}
                      </span>
                    </div>
                  )}

                  <Link href={`/post/${post.slug}`} className="w-full h-48 bg-white flex items-center justify-center p-4 transition transform group-hover:scale-105 duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-contain filter drop-shadow-sm" />
                  </Link>

                  <div className="flex flex-col flex-1 justify-between w-full p-4 space-y-4">
                    <Link href={`/post/${post.slug}`}>
                      <h3 className="text-[13px] md:text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-400 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <Link 
                      href={`/post/${post.slug}`}
                      className="w-full bg-slate-50 hover:bg-fuchsia-700 dark:bg-slate-800 dark:hover:bg-fuchsia-700 text-slate-600 hover:text-white dark:text-slate-300 font-semibold text-xs py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-lg font-bold text-slate-500 mb-1">No products found</h3>
              <p className="text-sm text-slate-400">Try adjusting your category or search filters.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
