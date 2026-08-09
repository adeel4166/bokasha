import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reviews-era-secret-key-12345';

// Helper to verify admin role
async function checkAdmin(req) {
  const tokenCookie = req.cookies.get('auth_token');
  if (!tokenCookie) return null;
  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET);
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

// GET: Fetch all users with their tracking IDs
export async function GET(req) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get all users
    const users = await query('SELECT id, username, role, article_quota, used_quota, created_at FROM users WHERE role != "admin"');
    
    // Fetch tracking IDs for each user
    const usersWithIds = await Promise.all(users.map(async (user) => {
      const trackingIds = await query('SELECT region, tracking_id FROM user_tracking_ids WHERE user_id = ?', [user.id]);
      return {
        ...user,
        trackingIds: trackingIds.reduce((acc, curr) => {
          acc[curr.region] = curr.tracking_id;
          return acc;
        }, {})
      };
    }));

    return NextResponse.json({ users: usersWithIds });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new user with tracking IDs
export async function POST(req) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { username, password, quota, trackingIds } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await query(
      'INSERT INTO users (username, password_hash, role, article_quota) VALUES (?, ?, "user", ?)',
      [username, passwordHash, quota || 50]
    );
    const userId = userResult.insertId;

    // Insert regional tracking IDs
    if (trackingIds && typeof trackingIds === 'object') {
      for (const [region, tag] of Object.entries(trackingIds)) {
        if (tag && tag.trim()) {
          await query(
            'INSERT INTO user_tracking_ids (user_id, region, tracking_id) VALUES (?, ?, ?)',
            [userId, region.toUpperCase(), tag.trim()]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'User created successfully', userId });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a user's quotas & tracking IDs
export async function PUT(req) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, password, quota, trackingIds } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update quota
    await query('UPDATE users SET article_quota = ? WHERE id = ?', [quota, id]);

    // Optional password reset
    if (password && password.trim()) {
      const passwordHash = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
    }

    // Delete existing tracking IDs and insert updated ones
    await query('DELETE FROM user_tracking_ids WHERE user_id = ?', [id]);
    if (trackingIds && typeof trackingIds === 'object') {
      for (const [region, tag] of Object.entries(trackingIds)) {
        if (tag && tag.trim()) {
          await query(
            'INSERT INTO user_tracking_ids (user_id, region, tracking_id) VALUES (?, ?, ?)',
            [id, region.toUpperCase(), tag.trim()]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(req) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
