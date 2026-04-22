import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseClient';
import { UserProfile, UserRole } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

interface SignUpProps {
  onSignup: (profile: UserProfile) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

// 🔥 Create Firestore user document automatically
await setDoc(doc(db, "users", cred.user.uid), {
  email: cred.user.email,
  full_name: fullName || (email.split('@')[0] || 'User'),
  role: UserRole.STANDARD_USER,
  created_at: new Date().toISOString()
});

const profile: UserProfile = {
  id: cred.user.uid,
  email: cred.user.email || email,
  role: UserRole.STANDARD_USER,
  full_name: fullName || (email.split('@')[0] || 'User'),
};
      onSignup(profile);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Create an Account</h1>
            <p className="text-slate-500 mt-2">Set up access to the AudiTech compliance hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ayesha Khan"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@company.pk"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              Already have an account? <a href="#/login" className="text-blue-600 font-bold hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        <div className="relative z-10 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Onboard Your Compliance Team <br /> in Minutes
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Create secure access for producers, anchors, and compliance officers to monitor every broadcast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

