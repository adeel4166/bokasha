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

  let displayTitle = post.title;
  let bodyContent = post.content;
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
  const h1Match = post.content.match(h1Regex);
  if (h1Match) {
    displayTitle = h1Match[1];
    bodyContent = post.content.replace(h1Regex, '');
  }

  return (
    <div className="flex flex-col font-sans transition-colors duration-200 selection:bg-fuchsia-500 selection:text-white w-full">
      
      {/* 2. AFFILIATE BANNER */}
      <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] md:text-xs font-semibold text-center py-2.5 px-4 border-b border-fuchsia-100 dark:border-fuchsia-900/50">
        As an Amazon Associate we earn from qualifying purchases. <Link href="/disclaimer" className="underline hover:text-fuchsia-600 dark:hover:text-fuchsia-200">Learn more &gt;</Link>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 animate-fadeIn">
        
        {/* Product Details Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
          
          {/* Left Column: Product Image */}
          <div className="flex flex-col items-center w-full sticky top-24">
            {post.image_url && (
              <div className="w-full bg-white dark:bg-[#13192b] border border-slate-100 dark:border-slate-800 rounded-xl p-8 flex items-center justify-center aspect-square shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-contain filter drop-shadow-sm transition transform hover:scale-105 duration-300"
                />
              </div>
            )}
          </div>

          {/* Right Column: Title Info Metadata Grid */}
          <div className="space-y-6 pt-4">
            
            {/* Meta Tags / Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                {post.region} Store
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                {post.category || 'General'}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-xs font-mono">|</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                Updated {(() => {
                  const d = new Date(post.created_at);
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                })()}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {displayTitle}
            </h1>

            {/* Affiliate Button */}
            <div className="pt-2">
              <a 
                href={affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-semibold text-sm py-4 px-8 rounded-md transition shadow-md"
              >
                <span>Check Price on Amazon</span>
                <span className="text-lg leading-none">&rarr;</span>
              </a>
              <p className="text-[11px] text-slate-500 font-medium mt-2">Redirects to Amazon {post.region} store</p>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800/80 my-8"></div>

            {/* Article Content */}
            <div 
              className="reviews-era-article-content prose dark:prose-invert prose-slate prose-a:text-fuchsia-700 dark:prose-a:text-fuchsia-400 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-img:rounded-xl max-w-none text-sm md:text-base leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: bodyContent }} 
            />

          </div>

        </section>
      </main>

    </div>
  );
}
