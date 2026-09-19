import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Globe, LogOut, User as UserIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '../CommandPalette';

interface NavbarProps {
  onOpenCreateProject?: () => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateProject, activeTab = 'projects' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-900 transition-colors">
                <Globe className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div className="flex items-baseline space-x-0.5">
                <span className="text-base font-bold tracking-tight text-emerald-950 font-sans">
                  Darukaa
                </span>
                <span className="text-base font-bold text-emerald-600">.Earth</span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center pl-4 border-l border-slate-200">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-emerald-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Projects
              </Link>
            </nav>
          </div>

          {/* Center Command Palette Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs text-slate-500 font-medium transition-all w-64 justify-between shadow-2xs group"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              <span>Search projects...</span>
            </div>
            <kbd className="font-mono text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* User / Auth Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              title="Search commands (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-900 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200/80">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate max-w-[160px] text-emerald-950">
                  {user.email}
                </span>
              </div>
            )}

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenCreateProject={onOpenCreateProject}
      />
    </>
  );
};
