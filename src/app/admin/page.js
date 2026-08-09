'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [quota, setQuota] = useState(50);
  const [trackingIds, setTrackingIds] = useState({ US: '', UK: '', DE: '', CA: '', FR: '', IT: '' });
  
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const sessionRes = await fetch('/api/auth');
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok || !sessionData.authenticated || sessionData.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? { id: editId, password, quota, trackingIds }
      : { username, password, quota, trackingIds };

    try {
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reset form and reload
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setUsername(user.username);
    setPassword('');
    setQuota(user.article_quota);
    setTrackingIds({
      US: user.trackingIds?.US || '',
      UK: user.trackingIds?.UK || '',
      DE: user.trackingIds?.DE || '',
      CA: user.trackingIds?.CA || '',
      FR: user.trackingIds?.FR || '',
      IT: user.trackingIds?.IT || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setUsername('');
    setPassword('');
    setQuota(50);
    setTrackingIds({ US: '', UK: '', DE: '', CA: '', FR: '', IT: '' });
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-100">
        <span className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-100 pb-12 transition-colors duration-200">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c0f1d]/75 backdrop-blur sticky top-0 z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-widest">
            REVIEWS <span className="text-amber-500">ERA</span>
          </span>
          <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-slate-550 dark:text-slate-400">
            Admin System
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 text-xs px-3.5 py-2 rounded-lg font-bold transition duration-200"
          >
            Writer Dashboard
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">User Administration</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage writers, edit Amazon tags, and configure quotas.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
          >
            Create New User
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* User CRUD Form Box */}
        {showForm && (
          <section className="bg-white dark:bg-[#0c0f1d]/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-md">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">{editId ? 'Edit User Details' : 'Register New User'}</h2>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase mb-2">Username</label>
                  <input
                    type="text"
                    required
                    disabled={!!editId}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 disabled:opacity-50"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase mb-2">
                    {editId ? 'Reset Password (optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-xs font-bold uppercase mb-2">Monthly Generation Quota</label>
                  <input
                    type="number"
                    required
                    value={quota}
                    onChange={(e) => setQuota(parseInt(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Regional Associate Tracking ID Sub-Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Regional Amazon Associate Tags</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {Object.keys(trackingIds).map((region) => (
                    <div key={region}>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">{region} Tag</label>
                      <input
                        type="text"
                        value={trackingIds[region]}
                        onChange={(e) => setTrackingIds({ ...trackingIds, [region]: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                        placeholder="e.g. tag-20"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow-md"
                >
                  {editId ? 'Save Changes' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Users Table */}
        <section className="bg-white dark:bg-[#0c0f1d]/40 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5">Username</th>
                  <th className="p-5">Quota Utilized</th>
                  <th className="p-5">US / DE / UK Tags</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition">
                    <td className="p-5 font-black text-slate-900 dark:text-white">{u.username}</td>
                    <td className="p-5 text-slate-600 dark:text-slate-300">
                      <span className="text-slate-900 dark:text-white font-bold">{u.used_quota}</span> / {u.article_quota}
                    </td>
                    <td className="p-5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>US: <code className="text-amber-600 dark:text-amber-500 font-mono font-bold">{u.trackingIds?.US || 'None'}</code></div>
                      <div>DE: <code className="text-amber-600 dark:text-amber-500 font-mono font-bold">{u.trackingIds?.DE || 'None'}</code></div>
                      <div>UK: <code className="text-amber-600 dark:text-amber-500 font-mono font-bold">{u.trackingIds?.UK || 'None'}</code></div>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500 italic">No users found. Create one to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
