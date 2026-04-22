
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { NAV_ITEMS } from '../constants';
import { LogOut, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AudiTech</h1>
          <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Compliance Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${isActive 
                ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20' 
                : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-3 py-2 bg-slate-800/50 rounded-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase">Logged in as</p>
          <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{user.role}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
