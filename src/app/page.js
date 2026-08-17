import React from 'react';
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
  const pageStr = searchParams?.page || '1';
  const page = parseInt(pageStr, 10) > 0 ? parseInt(pageStr, 10) : 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  let databasePosts = [];
  let totalPosts = 0;
  try {
    let whereClause = ' WHERE status = "published"';
    let params = [];

    if (searchQuery) {
      whereClause += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ? OR region = ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, searchQuery.toUpperCase().trim());
    }

    if (filterRegion) {
      whereClause += ' AND region = ?';
      params.push(filterRegion);
    }

    if (filterCategory) {
      whereClause += ' AND category = ?';
      params.push(filterCategory);
    }

    if (isLatest) {
      whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
    }

    const countSql = `SELECT COUNT(*) as total FROM posts ${whereClause}`;
    const countResult = await query(countSql, params);
    totalPosts = countResult[0].total;

    const sql = `SELECT title, slug, image_url, region, category, badge, content, created_at FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    databasePosts = await query(sql, params);
  } catch (error) {
    console.error('Failed to load posts from database:', error);
  }

  const allPosts = [...databasePosts];
  const totalPages = Math.ceil(totalPosts / limit);

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
          
          {/* Mobile Only: Region Filter */}
          <div className="md:hidden bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4 mb-6">
             <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Filter by Country</h3>
             <FilterSelect 
                name="region"
                placeholder="All Regions"
                defaultValue={filterRegion}
                options={regions.map(r => ({ value: r.code, label: r.name }))}
              />
          </div>

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
                Showing {allPosts.length} of {totalPosts} products
              </p>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {allPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {allPosts.map((post) => (
                <div key={post.slug} className="group relative flex flex-col bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl transition-all duration-300 hover:shadow-lg overflow-hidden">
                  
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
                      className="w-full bg-slate-50 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-white text-slate-600 hover:text-white dark:text-slate-300 dark:hover:text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-[#0b0f19] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-lg font-bold text-slate-500 mb-1">No products found</h3>
              <p className="text-sm text-slate-400">Try adjusting your category or search filters.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {page > 1 && (
                <Link 
                  href={`/?${new URLSearchParams({...searchParams, page: page - 1}).toString()}`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  &larr; Previous
                </Link>
              )}
              
              <div className="flex gap-1 px-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-2 py-2 text-slate-400">...</span>
                      )}
                      <Link
                        href={`/?${new URLSearchParams({...searchParams, page: p}).toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition ${p === page ? 'bg-fuchsia-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                        {p}
                      </Link>
                    </React.Fragment>
                  ))}
              </div>

              {page < totalPages && (
                <Link 
                  href={`/?${new URLSearchParams({...searchParams, page: page + 1}).toString()}`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
