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

  let displayTitle = post.title;
  const h1Match = post.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    displayTitle = h1Match[1];
  }

  let excerpt = post.content.replace(/<[^>]*>/g, ' ').substring(0, 160).trim();
  if (excerpt.length >= 160) excerpt += '...';

  return {
    title: `${displayTitle} | BOKASHA`,
    description: excerpt,
    keywords: [post.category, 'Amazon review', 'buy on Amazon', displayTitle.substring(0, 20)],
    alternates: {
      canonical: `/post/${slug}`,
    },
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

export default async function PostDetailPage({ params, searchParams }) {
  const { slug } = params;
  const ref = searchParams?.ref;
  let post = null;
  let relatedPosts = [];
  let affiliateUrl = '#';

  try {
    const results = await query('SELECT * FROM posts WHERE slug = ?', [slug]);
    if (results.length > 0) {
      post = results[0];

      let trackingId = '';
      let refUserId = null;

      // 1. If there is a ?ref=username parameter, fetch that user's ID
      if (ref) {
        const refUsers = await query('SELECT id FROM users WHERE username = ?', [ref]);
        if (refUsers.length > 0) {
          refUserId = refUsers[0].id;
        }
      }

      // 2. Fetch the Tracking ID for the referring user (if provided and valid)
      if (refUserId) {
        const trackingRows = await query(
          'SELECT tracking_id FROM user_tracking_ids WHERE user_id = ? AND region = ?',
          [refUserId, post.region]
        );
        if (trackingRows.length > 0) {
          trackingId = trackingRows[0].tracking_id;
        }
      }

      // 3. If no tracking ID yet (no ref, ref invalid, or ref user has no tag), 
      // automatically fallback to the Admin's Master Tag for this region
      if (!trackingId) {
        const adminTrackingRows = await query(
          `SELECT ut.tracking_id 
           FROM user_tracking_ids ut 
           JOIN users u ON u.id = ut.user_id 
           WHERE u.role = 'admin' AND ut.region = ? LIMIT 1`, 
          [post.region]
        );
        if (adminTrackingRows.length > 0) {
          trackingId = adminTrackingRows[0].tracking_id;
        }
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

      // Fetch related posts
      relatedPosts = await query(
        'SELECT title, slug, image_url, region, badge FROM posts WHERE category = ? AND slug != ? AND status = "published" ORDER BY created_at DESC LIMIT 3',
        [post.category, post.slug]
      );
    }
  } catch (error) {
    console.error('Failed fetching post:', error);
  }

  if (!post) {
    notFound();
  }

  let displayTitle = post.title;
  let bodyContent = post.content;
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
  const h1Match = post.content.match(h1Regex);
  if (h1Match) {
    displayTitle = h1Match[1];
    bodyContent = post.content.replace(h1Regex, '');
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: displayTitle,
    image: post.image_url ? [post.image_url] : [],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: [{
      '@type': 'Organization',
      name: 'Bokasha',
      url: 'https://bokasha.com'
    }]
  };

  return (
    <div className="flex flex-col font-sans transition-colors duration-200 selection:bg-fuchsia-500 selection:text-white w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 2. AFFILIATE BANNER */}
      <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] md:text-xs font-semibold text-center py-2.5 px-4 border-b border-fuchsia-100 dark:border-fuchsia-900/50">
        As an Amazon Associate we earn from qualifying purchases. <Link href="/disclaimer" className="underline hover:text-fuchsia-600 dark:hover:text-fuchsia-200">Learn more &gt;</Link>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 animate-fadeIn">
        
        {/* Product Details Section */}
        <section className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start mb-16">
          
          {/* Left Column: Product Image (Sticky) */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-24 mb-8 lg:mb-0">
            {post.image_url && (
              <div className="w-full bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-8 sm:p-12 flex items-center justify-center aspect-square shadow-sm transition-all hover:shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-contain filter drop-shadow-sm transition transform group-hover:scale-105 duration-500"
                />
              </div>
            )}
            
            {/* Desktop Action Area Below Image */}
            <div className="mt-8 hidden lg:block text-center">
               <a 
                href={affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-sm py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                <span className="flex-1">Check Price on Amazon</span>
                <span className="text-lg leading-none">&rarr;</span>
              </a>
              <p className="text-[11px] text-slate-500 font-medium mt-3">Redirects to Amazon {post.region} store</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">We earn a commission if you make a purchase, at no additional cost to you.</p>
            </div>
          </div>

          {/* Right Column: Title Info Metadata Grid */}
          <div className="w-full lg:w-7/12 space-y-6 lg:pt-4">
            
            {/* Meta Tags / Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-md">
                {post.region} Store
              </span>
              <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-md">
                {post.category || 'General'}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-xs font-mono hidden sm:inline">|</span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                Updated {(() => {
                  const d = new Date(post.created_at);
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                })()}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {displayTitle}
            </h1>

            {/* Mobile Action Area */}
            <div className="pt-2 block lg:hidden">
              <a 
                href={affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-sm py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98]"
              >
                <span>Check Price on Amazon</span>
                <span className="text-lg leading-none ml-2">&rarr;</span>
              </a>
              <p className="text-[11px] text-slate-500 font-medium mt-2 text-center">Redirects to Amazon {post.region} store</p>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800/80 my-8"></div>

            {/* Article Content */}
            <div 
              className="reviews-era-article-content prose dark:prose-invert prose-slate prose-a:text-fuchsia-700 dark:prose-a:text-fuchsia-400 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-img:rounded-xl max-w-none text-sm md:text-base leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: bodyContent }} 
            />

          </div>

        </section>

        {/* Related Products Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800/80">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <div key={rp.slug} className="group relative flex flex-col bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl transition-all duration-300 hover:shadow-lg overflow-hidden">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-fuchsia-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-sm">
                      {rp.region}
                    </span>
                  </div>
                  {rp.badge && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-amber-400 text-amber-950 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded shadow-sm">
                        {rp.badge}
                      </span>
                    </div>
                  )}
                  <Link href={`/post/${rp.slug}`} className="w-full h-40 bg-white flex items-center justify-center p-4 transition transform group-hover:scale-105 duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rp.image_url} alt={rp.title} className="w-full h-full object-contain filter drop-shadow-sm" />
                  </Link>
                  <div className="flex flex-col flex-1 justify-between p-4 space-y-4">
                    <Link href={`/post/${rp.slug}`}>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-400 transition-colors">
                        {rp.title}
                      </h3>
                    </Link>
                    <Link href={`/post/${rp.slug}`} className="w-full bg-slate-50 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-white text-slate-600 hover:text-white dark:text-slate-300 dark:hover:text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-auto">
                      Read Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
