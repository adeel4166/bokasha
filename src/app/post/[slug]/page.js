import { query } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await query('SELECT slug FROM posts WHERE status = "published"');
    return posts.map((post) => ({ slug: post.slug }));
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  let post = null;

  try {
    const results = await query('SELECT title, content, image_url, category FROM posts WHERE slug = ?', [slug]);
    if (results.length > 0) {
      post = results[0];
    }
  } catch (error) {
    console.error('Failed fetching post metadata:', error);
  }

  if (!post) {
    return { title: 'Post Not Found | BOKASHA' };
  }

  // Extract display title (if wrapped in h1 tag)
  let displayTitle = post.title;
  const h1Match = post.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    displayTitle = h1Match[1];
  }

  // Extract plain text excerpt for description
  let excerpt = post.content.replace(/<[^>]*>/g, ' ').substring(0, 160).trim();
  if (excerpt.length >= 160) excerpt += '...';

  return {
    title: `${displayTitle} | BOKASHA`,
    description: excerpt,
    keywords: [post.category, 'Amazon review', 'buy on Amazon', displayTitle.substring(0, 20)],
    openGraph: {
      title: displayTitle,
      description: excerpt,
      images: [
        {
          url: post.image_url,
          width: 800,
          height: 600,
          alt: displayTitle,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: excerpt,
      images: [post.image_url],
    },
  };
}

export default async function PostDetailPage({ params }) {
  const { slug } = params;
  let post = null;
  let affiliateUrl = '#';

  try {
    const results = await query('SELECT * FROM posts WHERE slug = ?', [slug]);
    if (results.length > 0) {
      post = results[0];

      // Fetch tracking ID
      const trackingRows = await query(
        'SELECT tracking_id FROM user_tracking_ids WHERE user_id = ? AND region = ?',
        [post.user_id, post.region]
      );
      
      let trackingId = '';
      if (trackingRows.length > 0) {
        trackingId = trackingRows[0].tracking_id;
      }

      const domains = {
        US: 'amazon.com',
        UK: 'amazon.co.uk',
        DE: 'amazon.de',
        CA: 'amazon.ca',
        FR: 'amazon.fr',
        IT: 'amazon.it',
        ES: 'amazon.es'
      };
      
      const domain = domains[post.region.toUpperCase()] || 'amazon.com';
      affiliateUrl = `https://www.${domain}/dp/${post.amazon_asin}${trackingId ? `?tag=${trackingId}` : ''}`;
    }
  } catch (error) {
    console.error('Failed fetching post:', error);
  }

  if (!post) {
    notFound();
  }

  // Extract displaying title
  let displayTitle = post.title;
  let bodyContent = post.content;
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
  const h1Match = post.content.match(h1Regex);
  if (h1Match) {
    displayTitle = h1Match[1];
    bodyContent = post.content.replace(h1Regex, '');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-200 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900 transition-colors duration-200">
      
      {/* Premium Header */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c0f1d]/75 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center w-full gap-2 sm:gap-4">
          <Link href="/" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-widest hover:opacity-90 transition truncate">
            BOKASHA
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link href="/" className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full">
              <span>&larr;</span> Back
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-1 animate-fadeIn">
        
        {/* Split Hero Section - Redesigned with premium product card showcase & typography */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
          
          {/* Left Column: Premium Floating Product Showcase Card & Action Button */}
          <div className="lg:col-span-5 flex flex-col items-center w-full">
            {post.image_url && (
              <div className="w-full bg-white border border-slate-200 dark:border-slate-850 rounded-3xl p-4 flex items-center justify-center aspect-square relative group overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-contain transition duration-500 group-hover:scale-102"
                />
                <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                  Active Review
                </span>
              </div>
            )}

            {/* Price Button under Image */}
            <div className="w-full mt-6 space-y-2 text-center">
              <a 
                href={affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Check Price on Amazon</span>
                <span className="text-base leading-none">&rarr;</span>
              </a>
              <p className="text-[10px] text-slate-500 font-mono">Redirects to Amazon {post.region} store</p>
            </div>
          </div>

          {/* Right Column: Title Info Metadata Grid */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Meta Tags / Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-md">
                {post.region} Store
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-md">
                {post.category || 'General'}
              </span>
              {post.badge && (
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-md">
                  {post.badge}
                </span>
              )}
              <span className="text-slate-300 dark:text-slate-700 text-xs font-mono">|</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                Updated {(() => {
                  const d = new Date(post.created_at);
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                })()}
              </span>
            </div>

            {/* Product Title (Optimized letter-spacing & font height) */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2] transition duration-200">
              {displayTitle}
            </h1>

            {/* Affiliate Disclosure Card */}
            <div className="p-5 bg-white dark:bg-[#0c0f1d]/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Affiliate Disclosure
              </div>
              <p>
                Clicking links on this page will redirect you to Amazon. As an Amazon Associate, we earn a commission on qualifying purchases at no additional expense to you. Real-time prices are verified directly on the store.
              </p>
            </div>
          </div>

        </section>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 mb-12"></div>

        {/* Detailed Article Body */}
        <section className="max-w-4xl mx-auto">
          {/* Article wrapper uses light/dark Tailwind typography styles */}
          <div 
            className="reviews-era-article-content prose dark:prose-invert max-w-none prose-slate"
            dangerouslySetInnerHTML={{ __html: bodyContent }} 
          />

          {/* Bottom Call to Action Card */}
          <div className="mt-16 p-8 bg-slate-100 dark:bg-gradient-to-b dark:from-slate-900/50 dark:to-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-xl">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Find a Deal on Amazon?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Check stock, color variants, and purchase directly on Amazon.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <a 
                href={affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full max-w-sm inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base py-4 rounded-2xl shadow-xl shadow-amber-500/10 transition transform hover:-translate-y-0.5 duration-200"
              >
                <span>Check Price on Amazon</span>
                <span className="text-lg leading-none">&rarr;</span>
              </a>
              <span className="text-[10px] text-slate-500 dark:text-slate-600 font-mono">ASIN: {post.amazon_asin} | Region: {post.region}</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-[#04060c] py-12 text-center text-xs text-slate-500 px-6">
        <div className="max-w-6xl mx-auto w-full space-y-4">
          <p className="max-w-2xl mx-auto leading-relaxed">
            BOKASHA is a participant in the Amazon Services LLC Associates Program. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
          <div className="flex justify-center gap-6 text-[11px] text-slate-500 dark:text-slate-450 font-bold my-4">
            <Link href="/privacy-policy" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Disclaimer</Link>
            <Link href="/contact" className="hover:text-amber-600 hover:dark:text-amber-500 transition">Contact Us</Link>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-655">&copy; {new Date().getFullYear()} BOKASHA. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
