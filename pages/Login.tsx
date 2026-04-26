
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseClient";

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2️⃣ Fetch role/profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        alert("User role/profile not found in Firestore for this account. Please create/update a document in the 'users' collection with this UID and a valid role (ADMIN, COMPLIANCE_OFFICER, or STANDARD_USER).");
        return;
      }

      const userData = userDoc.data() as { role?: UserRole; full_name?: string };

      // 3️⃣ Pass real profile to app
      onLogin({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        role: (userData.role as UserRole) ?? UserRole.STANDARD_USER,
        full_name: userData.full_name || firebaseUser.email || "",
      });

      navigate("/dashboard");
    } catch (error: any) {
      alert("Login failed: " + error.message);
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
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to the AudiTech compliance hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              Need access? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create an account</Link>
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
            <h2 className="text-4xl font-bold text-white leading-tight">Advanced Audio & Video Logging <br /> for Media Professionals</h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Harness the power of Gemini-3 Pro for instantaneous bilingual transcription and PEMRA compliance monitoring.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Urdu STT', desc: 'Precision Recognition' },
              { label: 'Auto Flagging', desc: 'Compliance Ready' },
              { label: 'Live Insights', desc: 'Sentiment & Noise' },
              { label: 'Reporting', desc: 'Audit Trail' },
            ].map((box, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <p className="text-white font-bold">{box.label}</p>
                <p className="text-slate-500 text-xs">{box.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
