import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Globe, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center space-x-3 group">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 group-hover:scale-105 transition-transform">
          <Globe className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Darukaa<span className="text-emerald-400">.Earth</span>
        </span>
      </Link>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium truncate max-w-[180px]">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
