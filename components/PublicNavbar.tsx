
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-50">
<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-20 flex items-center justify-between">        {/* Left Side: Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="hidden sm:block text-2xl font-bold text-white tracking-tight">
  AudiTech
</h1>
        </Link>

        {/* Right Side: Navigation and Action */}
        <div className="flex items-center justify-between flex-1 ml-2 sm:ml-6">
          {/* Page Links */}
          <div className="flex flex-1 justify-center gap-3 sm:gap-6 text-xs sm:text-base font-bold text-slate-300 whitespace-nowrap">            <Link 
              to="/features" 
              className={`transition-colors py-2 border-b-2 ${isActive('/features') ? 'text-blue-400 border-blue-400' : 'hover:text-white border-transparent hover:border-slate-700'}`}
            >
              Features
            </Link>
            <Link 
              to="/compliance-info" 
              className={`transition-colors py-2 border-b-2 ${isActive('/compliance-info') ? 'text-blue-400 border-blue-400' : 'hover:text-white border-transparent hover:border-slate-700'}`}
            >
              Compliance
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors py-2 border-b-2 ${isActive('/about') ? 'text-blue-400 border-blue-400' : 'hover:text-white border-transparent hover:border-slate-700'}`}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors py-2 border-b-2 ${isActive('/contact') ? 'text-blue-400 border-blue-400' : 'hover:text-white border-transparent hover:border-slate-700'}`}
            >
              Contact
            </Link>
          </div>

          {/* Sign In Button */}
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2.5 rounded-full font-bold text-xs sm:text-base transition-all whitespace-nowrap shrink-0">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
