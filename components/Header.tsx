import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { Search } from "lucide-react";
import { useSearch } from "../context/SearchContext";

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
  const { query, setQuery } = useSearch();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
<header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between w-full flex-shrink-0">      
      <button 
  onClick={onMenuClick}
  className="lg:hidden mr-3 text-slate-700 text-2xl"
>
  ☰
</button>

      {/* Search */}
      <div className="relative w-full max-w-xs lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search logs, transcripts, keywords..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* User Dropdown */}
      <div className="relative" ref={menuRef}>
        <div
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">
              {user.full_name}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user.role.toLowerCase().replace("_", " ")}
            </p>
          </div>

          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
            {user.full_name.charAt(0)}
          </div>
        </div>

        {showMenu && (
          <div className="absolute right-0 mt-3 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-bold"
            >
              Logout
            </button>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;