import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../services/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { username, email, password };

    try {
      let res;

      try {
        // Attempt 1: Standard JSON Body
        res = await api.post('/api/v1/auth/signup', payload);
      } catch (err1) {
        if (err1.response?.status === 422) {
          try {
            // Attempt 2: Query Parameters (FastAPI functions expecting query params)
            res = await api.post('/api/v1/auth/signup', null, { params: payload });
          } catch (err2) {
            if (err2.response?.status === 422) {
              // Attempt 3: Form Data (URLSearchParams)
              const formData = new URLSearchParams();
              formData.append('username', username);
              formData.append('email', email);
              formData.append('password', password);

              res = await api.post('/api/v1/auth/signup', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err1;
        }
      }

      // Signup successful -> Redirect to Login Page
      router.push('/login');
    } catch (err) {
      console.error('Signup Error details:', err.response?.data);
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        const parsedMsg = detail.map((e) => e.msg || JSON.stringify(e)).join(', ');
        setError(parsedMsg);
      } else if (typeof detail === 'object' && detail !== null) {
        setError(detail.msg || JSON.stringify(detail));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Registration failed. Please check backend server schema.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-6">Sign up to access AI predictions</p>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}