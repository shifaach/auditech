
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import { ShieldCheck } from 'lucide-react';

const PublicLayout: React.FC = () => {
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col selection:bg-blue-500/30">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="w-full border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white">AudiTech</span>
            <span>© 2024. All rights reserved.</span>
          </div>
          <div className="flex gap-8 font-semibold">
            <Link to="/features" className="hover:text-white transition-colors">Features</Link>
            <Link to="/compliance-info" className="hover:text-white transition-colors">Compliance</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
