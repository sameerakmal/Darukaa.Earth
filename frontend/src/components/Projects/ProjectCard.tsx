import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types/project';
import { Folder, MapPin, ArrowRight, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/20 group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base group-hover:text-emerald-400 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  {project.project_type}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this project?')) {
                  onDelete(project.id);
                }
              }}
              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{project.site_count ?? 0} Sites</span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <span>Open Project</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
