import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Folder, MapPin, Plus, Home, Sparkles } from 'lucide-react';
import { Project } from '../types/project';
import { projectsApi } from '../api/projects';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      projectsApi
        .getProjects()
        .then((data) => setProjects(data))
        .catch(() => setProjects([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSelectProject = (projectId: string) => {
    onClose();
    navigate(`/projects/${projectId}`);
  };

  const handleGoHome = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <Command className="w-full bg-white font-sans text-slate-900">
          <div className="flex items-center border-b border-slate-200 px-4 py-3 bg-white">
            <Search className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
            <Command.Input
              placeholder="Search projects or system commands..."
              className="w-full text-xs font-medium placeholder:text-slate-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-900"
            />
            <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 ml-2 shrink-0 bg-slate-50">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
            <Command.Empty className="py-6 text-center text-xs text-slate-500 font-mono">
              No matching projects or commands found.
            </Command.Empty>

            <Command.Group
              heading="SYSTEM ACTIONS"
              className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5"
            >
              <Command.Item
                onSelect={handleGoHome}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-900 font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span>Go to Dashboard</span>
              </Command.Item>

              {onOpenCreateProject && (
                <Command.Item
                  onSelect={() => {
                    onClose();
                    onOpenCreateProject();
                  }}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-900 font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Create New Project</span>
                </Command.Item>
              )}
            </Command.Group>

            <Command.Separator className="h-px bg-slate-100 my-1" />

            <Command.Group
              heading="PROJECTS"
              className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5"
            >
              {loading ? (
                <div className="py-4 text-center text-slate-400 text-xs font-mono flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Loading projects...</span>
                </div>
              ) : (
                projects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => handleSelectProject(proj.id)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-900 transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Folder className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-900 font-sans">
                        {proj.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-[9px] capitalize font-sans">
                        {proj.project_type}
                      </Badge>
                      <MapPin className="w-3 h-3 text-emerald-600" />
                    </div>
                  </Command.Item>
                ))
              )}
            </Command.Group>
          </Command.List>

          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>
              Use <kbd className="bg-white px-1 border border-slate-200 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="bg-white px-1 border border-slate-200 rounded text-[10px]">↓</kbd> to
              navigate
            </span>
            <span>
              Press{' '}
              <kbd className="bg-white px-1 border border-slate-200 rounded text-[10px]">↵</kbd> to
              select
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
