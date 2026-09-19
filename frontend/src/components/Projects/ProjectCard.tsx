import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../../types/project';
import { MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
  index: number;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onDelete }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'planning':
        return 'planning';
      case 'completed':
        return 'completed';
      default:
        return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200 hover:border-emerald-600/60 rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 group relative"
    >
      <div>
        {/* Card Header: Project Type & Status + Delete */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className="capitalize text-slate-600 font-medium">
            {project.project_type}
          </Badge>

          <div className="flex items-center space-x-1.5">
            <Badge variant={getStatusVariant(project.status)}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="capitalize">{project.status}</span>
            </Badge>

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                    onDelete(project.id);
                  }
                }}
                className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Project Title & Description */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-950 transition-colors leading-snug font-sans mb-1.5">
            {project.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
            {project.description || 'Geospatial carbon stock & ecological biodiversity monitoring.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Site Count & Action Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-600 font-medium text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {project.site_count ?? 0} {project.site_count === 1 ? 'site' : 'sites'}
          </span>
        </div>

        <Link to={`/projects/${project.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-emerald-700 font-semibold hover:bg-emerald-50 hover:text-emerald-900 gap-1 px-2.5 group-hover:translate-x-0.5 transition-all"
          >
            <span>View Project</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
