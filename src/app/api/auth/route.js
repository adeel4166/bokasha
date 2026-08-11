import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reviews-era-secret-key-12345';

// Handle login
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 1. Fetch user from DB
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0];

    // 2. Compare password hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Set HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role }
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// Handle logout or get current session details
export async function GET(req) {
  const tokenCookie = req.cookies.get('auth_token');
  
  // Logout action if requested via query
  const { searchParams } = new URL(req.url);
  if (searchParams.get('logout') === 'true') {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set({
      name: 'auth_token',
      value: '',
      maxAge: 0,
      path: '/'
    });
    return response;
  }

  // Session check action
  if (!tokenCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET);
    
    // Fetch fresh user details (like remaining quota)
    const users = await query('SELECT id, username, role, article_quota, used_quota FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
       return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const trackingIds = await query('SELECT region, tracking_id FROM user_tracking_ids WHERE user_id = ?', [decoded.id]);
    const postsCount = await query('SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = "published"', [decoded.id]);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        ...users[0],
        total_posts: postsCount[0]?.count || 0,
        trackingIds: trackingIds
      }
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
