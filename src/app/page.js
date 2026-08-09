import { query } from '@/lib/db';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import HeroCarousel from '@/components/HeroCarousel';

export const revalidate = 60;

export default async function BlogHome({ searchParams }) {
  const searchQuery = searchParams?.q || '';
  const filterRegion = searchParams?.region || '';
  const filterCategory = searchParams?.category || '';
  
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

    sql += ' ORDER BY created_at DESC';
    databasePosts = await query(sql, params);
  } catch (error) {
    console.error('Failed to load posts from database:', error);
  }

  // Pre-populate standard category placeholders if database has no posts, to make the site look fully established
  const mockPlaceholders = {
    'Electronics': [
      {
        title: 'Sony WH-1000XM4 Wireless Premium Noise Cancelling Headphones',
        slug: '#',
        image_url: 'https://m.media-amazon.com/images/I/71o8Q5hCeVL._AC_SL1500_.jpg',
        region: 'US',
        category: 'Electronics',
        badge: 'Top Pick',
        content: '<p>Experience industry-leading noise cancellation with Sony\'s premier over-ear wireless headphones, featuring custom-tuned audio drivers and smart ambient controls.</p>',
        created_at: new Date('2026-08-01')
      },
      {
        title: 'Logitech MX Master 3S Advanced Wireless Performance Mouse',
        slug: '#',
        image_url: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',
        region: 'UK',
        category: 'Electronics',
        badge: 'Editor\'s Choice',
        content: '<p>The ultimate performance mouse designed for developers and creators. Offers hyper-fast MagSpeed scrolling and 8K DPI tracking on any surface.</p>',
        created_at: new Date('2026-08-03')
      }
    ],
    'Home & Kitchen': [
      {
        title: 'Instant Pot Duo Plus 9-in-1 Smart Electric Pressure Cooker',
        slug: '#',
        image_url: 'https://m.media-amazon.com/images/I/618m17VjJvL._AC_SL1500_.jpg',
        region: 'CA',
        category: 'Home & Kitchen',
        badge: 'Best Seller',
        content: '<p>The classic kitchen must-have, combining pressure cooking, slow cooking, rice cooking, yogurt making, steaming, and warming in one simple device.</p>',
        created_at: new Date('2026-08-04')
      }
    ],
    'Garden & Outdoors': [
      {
        title: 'Karcher K4 Power Control Premium Home Pressure Washer',
        slug: '#',
        image_url: 'https://m.media-amazon.com/images/I/71LhMscRslL._AC_SL1500_.jpg',
        region: 'DE',
        category: 'Garden & Outdoors',
        badge: 'Premium Pick',
        content: '<p>Clean stone terraces, driveways, and vehicles with ease using the power control trigger gun and spray lances with direct app guidance.</p>',
        created_at: new Date('2026-08-05')
      }
    ],
    'Sports & Outdoors': [
      {
        title: 'Coleman Cabin Tent with Instant Setup Technology',
        slug: '#',
        image_url: 'https://m.media-amazon.com/images/I/71pE1S+Q6yL._AC_SL1500_.jpg',
        region: 'US',
        category: 'Sports & Outdoors',
        badge: 'Best Value',
        content: '<p>Set up camp in less than 60 seconds with pre-attached poles. Features rainfly integration and double-thick fabric to handle rugged environments.</p>',
        created_at: new Date('2026-08-06')
      }
    ]
  };

  // Merge database posts and mock placeholders
  const categoriesList = ['Electronics', 'Home & Kitchen', 'Garden & Outdoors', 'Sports & Outdoors', 'Health & Personal Care', 'Automotive', 'Tools & DIY'];
  const allPosts = [...databasePosts];

  // Disabled mock placeholders merging to ensure only real database posts are shown on bokasha.com

  // Group combined posts by category
  const postsByCategory = {};
  categoriesList.forEach(cat => {
    postsByCategory[cat] = allPosts.filter(post => post.category === cat);
  });

  // Featured Posts for Carousel (top 4 latest posts) and Secondary Featured (Latest Additions)
  const carouselPosts = allPosts.slice(0, 4);
  const secondaryFeatured = allPosts.length >= 7 
    ? allPosts.slice(4, 7) 
    : allPosts.filter(p => !carouselPosts.includes(p)).slice(0, 3);

  // Region lookup details for count badge
  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'CA', name: 'Canada' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' }
  ];

  const getBadgeColor = (badge) => {
    const clean = badge?.toLowerCase() || '';
    if (clean.includes('top pick')) return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-250 dark:border-emerald-800';
    if (clean.includes('best seller')) return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-250 dark:border-indigo-800';
    if (clean.includes('editor')) return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-250 dark:border-indigo-850';
    return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-250 dark:border-amber-800';
  };

  // Extracts plain text snippet from the HTML review content
  const getExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    const clean = htmlContent.replace(/<[^>]*>/g, ' ');
    return clean.length > 150 ? clean.substring(0, 150) + '...' : clean;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070a13] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900 transition-colors duration-200 relative">
      
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-20 right-1/4 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c0f1d]/75 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Link href="/" className="text-xl font-black text-slate-900 dark:text-white tracking-widest hover:opacity-90 transition">
            BOKASHA
          </Link>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <form action="/" method="GET" className="relative flex-1 sm:w-80">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products..."
                className="w-full bg-slate-100 dark:bg-[#070a13]/85 border border-slate-300 dark:border-slate-800 rounded-full px-5 py-2.5 pl-11 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition duration-200"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-16">

        {/* 1. HERO FEATURED SECTION (Split design layout with dynamic sliding Carousel) */}
        {!searchQuery && !filterRegion && !filterCategory && carouselPosts.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Horizontal Split Carousel */}
            <div className="lg:col-span-8">
              <HeroCarousel posts={carouselPosts} />
            </div>


            {/* Right Column: "Latest Additions" */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="border-l-4 border-amber-500 pl-3">
                <h3 className="text-xs uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                  Latest Additions
                </h3>
              </div>
              
              <div className="flex-1 grid grid-cols-1 gap-4">
                {secondaryFeatured.map(post => (
                  <div 
                    key={post.slug} 
                    className="bg-white dark:bg-[#0c0f1d]/40 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition flex gap-4 items-center group"
                  >
                    <div className="w-16 h-16 bg-white border border-slate-150 dark:border-slate-850/50 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.image_url} alt={post.title} className="max-h-full object-contain" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider block">
                        {post.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white hover:text-amber-500 transition line-clamp-2 leading-snug">
                        {post.slug === '#' ? (
                          post.title
                        ) : (
                          <Link href={`/post/${post.slug}`}>{post.title}</Link>
                        )}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* 2. GREEN BRAND BANNER (Optimized design with amber search accent) */}
        <section className="bg-gradient-to-r from-emerald-600 via-emerald-650 to-emerald-700 dark:from-emerald-800/80 dark:to-teal-900/60 rounded-3xl p-10 shadow-xl text-center space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-lg md:text-2xl font-black text-white tracking-wide">
            Check our reviews before you buy anything. Ever.
          </h3>
          <div className="relative max-w-lg mx-auto">
            <form action="/" method="GET" className="flex shadow-md rounded-full bg-white dark:bg-[#070a13] p-1.5 border border-slate-200/50 dark:border-slate-800">
              <input 
                type="text" 
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products by title, region, or category..." 
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 border-none px-4 py-2 text-xs focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-6 py-2.5 rounded-full transition shadow-md"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* 3. BROWSE BY POPULAR CATEGORIES SECTION (Grid loop) */}
        <section className="space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Browse our most popular categories
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Handpicked Amazon reviews organized by technical features, pros, and cons.
            </p>
          </div>

          <div className="space-y-12">
            {categoriesList.map(catName => {
              const catPosts = postsByCategory[catName] || [];
              if (catPosts.length === 0) return null;

              return (
                <div 
                  key={catName} 
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-200 dark:border-slate-850/80 pb-10"
                >
                  {/* Left Column: Category Label Card */}
                  <div className="lg:col-span-3 bg-white dark:bg-[#0c0f1d]/30 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {catName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Latest guides, hands-on picks, and dynamic product specs sheets.
                    </p>
                    <Link 
                      href={`/?category=${encodeURIComponent(catName)}`}
                      className="text-xs text-amber-500 font-bold hover:text-amber-400 transition mt-4 inline-flex items-center gap-1"
                    >
                      View all in category &rarr;
                    </Link>
                  </div>

                  {/* Right Column: Dynamic E-commerce Cards Grid */}
                  <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {catPosts.slice(0, 3).map(post => (
                      <article 
                        key={post.slug} 
                        className="bg-white dark:bg-[#0c0f1d]/40 rounded-2xl border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        {/* Image Panel */}
                        <div className="relative aspect-video w-full bg-white flex items-center justify-center p-4 border-b border-slate-100 dark:border-slate-850">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.image_url} alt={post.title} className="max-h-full object-contain filter drop-shadow-sm group-hover:scale-102 transition duration-200" />
                          <span className="absolute top-2 left-2 bg-slate-900/90 dark:bg-slate-950/85 text-white dark:text-slate-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {post.region}
                          </span>
                          {post.badge && (
                            <span className={`absolute top-2 right-2 border text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow-sm ${getBadgeColor(post.badge)}`}>
                              {post.badge}
                            </span>
                          )}
                        </div>
                        {/* Article Text Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">
                              {post.category}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-500 transition">
                              {post.slug === '#' ? (
                                post.title
                              ) : (
                                <Link href={`/post/${post.slug}`}>{post.title}</Link>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed text-justify">
                              {getExcerpt(post.content)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-3 border-t border-slate-100 dark:border-slate-850/80">
                            <span>
                              {(() => {
                                const d = new Date(post.created_at);
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                              })()}
                            </span>
                            {post.slug !== '#' ? (
                              <Link href={`/post/${post.slug}`} className="text-amber-500 font-bold hover:underline">
                                Read Review
                              </Link>
                            ) : (
                              <span className="text-slate-400 italic">Sample Review</span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* 4. BROWSE REVIEWS BY REGION */}
        <section className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-4">
          <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
            Browse Reviews By Region
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {regions.map(r => {
              const isActive = filterRegion === r.code;
              return (
                <Link
                  key={r.code}
                  href={`/?region=${r.code}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    isActive 
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  {r.name} ({r.code})
                </Link>
              );
            })}
            {(filterRegion || filterCategory || searchQuery) && (
              <Link 
                href="/" 
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition"
              >
                Reset Filters ×
              </Link>
            )}
          </div>
        </section>

        {/* 5. WHO WE ARE & COUNTER METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-t border-b border-slate-200 dark:border-slate-850">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Who is BOKASHA?
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              We turn complex product listings and descriptions into structured buying advice. Every article is written by our system analyzing real-time Amazon parameters to help shoppers compare options and shop with confidence.
            </p>
          </div>
                  <div className="bg-white dark:bg-[#0c0f1d]/30 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-2xl font-black text-amber-500 block">{databasePosts.length}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Reviews</span>
          </div>

          <div className="bg-white dark:bg-[#0c0f1d]/30 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-2xl font-black text-emerald-500 block">{regions.length}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Regions Monitored</span>
          </div>
        </section>

      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#04060c] py-12 text-center text-xs text-slate-500 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <p className="max-w-2xl mx-auto leading-relaxed">
            <strong>Affiliate Disclosure:</strong> BOKASHA is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.
          </p>
          <div className="flex justify-center gap-6 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <Link href="/privacy-policy" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Disclaimer</Link>
            <Link href="/contact" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Contact Us</Link>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <Link href="/login" className="text-slate-500 hover:text-amber-600 hover:dark:text-amber-500 transition font-black">Writer Access</Link>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600">&copy; {new Date().getFullYear()} BOKASHA. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
