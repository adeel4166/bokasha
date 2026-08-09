import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { scrapeAmazonProduct, extractAsin, getAmazonUrl } from '@/lib/scraper';
import { generateProductReview } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reviews-era-secret-key-12345';

// Verify token and return user details
async function getSessionUser(req) {
  const tokenCookie = req.cookies.get('auth_token');
  if (!tokenCookie) return null;
  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET);
    const users = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    return users[0] || null;
  } catch (e) {
    return null;
  }
}

export async function POST(req) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { asinOrUrl, region } = await req.json();

    if (!asinOrUrl || !region) {
      return NextResponse.json({ error: 'ASIN/URL and target region are required' }, { status: 400 });
    }

    const cleanRegion = region.toUpperCase();
    const asin = extractAsin(asinOrUrl);

    if (!asin) {
      return NextResponse.json({ error: 'Could not extract a valid Amazon ASIN from your input.' }, { status: 400 });
    }

    // 1. Quota check
    if (user.used_quota >= user.article_quota) {
      return NextResponse.json({ error: 'Your monthly article generation quota is exhausted.' }, { status: 403 });
    }

    // 2. Duplicate posting check (prevent double posting)
    const existing = await query('SELECT slug FROM posts WHERE amazon_asin = ? AND region = ?', [asin, cleanRegion]);
    if (existing.length > 0) {
      return NextResponse.json({
        error: 'duplicate',
        message: 'This product has already been reviewed for this region!',
        slug: existing[0].slug
      }, { status: 400 });
    }

    // 3. Retrieve user's tracking ID for this region
    const trackingRows = await query(
      'SELECT tracking_id FROM user_tracking_ids WHERE user_id = ? AND region = ?',
      [user.id, cleanRegion]
    );

    let trackingId = '';
    if (trackingRows.length > 0) {
      trackingId = trackingRows[0].tracking_id;
    } else {
      // Fallback: Check if admin has a tracking ID or return error
      const adminTrackingRows = await query(
        'SELECT tracking_id FROM user_tracking_ids WHERE user_id = (SELECT id FROM users WHERE role="admin" LIMIT 1) AND region = ?',
        [cleanRegion]
      );
      if (adminTrackingRows.length > 0) {
        trackingId = adminTrackingRows[0].tracking_id;
      } else {
        return NextResponse.json({
          error: 'No tracking ID configured for this region. Please configure your Amazon Associate ID first.'
        }, { status: 400 });
      }
    }

    // 4. Scrape Product Details from Amazon
    const amazonUrl = getAmazonUrl(asin, cleanRegion);
    const scrapedData = await scrapeAmazonProduct(amazonUrl, cleanRegion);

    // Construct affiliate link
    const affiliateUrl = `${amazonUrl}?tag=${trackingId}`;

    // 5. Generate SEO Content using Gemini 3.5 Flash (Structured JSON)
    const generatedReview = await generateProductReview({
      title: scrapedData.title,
      bulletPoints: scrapedData.bulletPoints,
      specifications: scrapedData.specifications,
      affiliateUrl: affiliateUrl,
      region: cleanRegion
    });

    // Generate unique URL slug based on AI title
    let baseSlug = generatedReview.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Fallback if title has non-latin characters only
    if (!baseSlug) {
      baseSlug = `review-${asin.toLowerCase()}`;
    }

    // Make sure slug is unique in DB
    let slug = baseSlug;
    let slugCounter = 1;
    while (true) {
      const slugCheck = await query('SELECT id FROM posts WHERE slug = ?', [slug]);
      if (slugCheck.length === 0) break;
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // 6. Save Post into Database with Category and Badge details
    await query(
      `INSERT INTO posts (user_id, title, slug, content, image_url, amazon_asin, region, category, badge, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [user.id, generatedReview.title, slug, generatedReview.content, scrapedData.imageUrl, asin, cleanRegion, generatedReview.category, generatedReview.badge]
    );

    // 7. Increment user quota usage
    await query('UPDATE users SET used_quota = used_quota + 1 WHERE id = ?', [user.id]);

    // 8. Revalidate paths dynamically to compile statically
    try {
      revalidatePath('/');
      revalidatePath(`/post/${slug}`);
    } catch (e) {
      console.warn('Revalidation failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Article generated and auto-posted successfully!',
      slug: slug
    });

  } catch (error) {
    console.error('Generation handler error:', error);
    return NextResponse.json({ error: error.message || 'An internal error occurred during article generation.' }, { status: 500 });
  }
}
