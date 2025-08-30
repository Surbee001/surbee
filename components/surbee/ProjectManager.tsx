'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Settings, BarChart3, Sparkles } from 'lucide-react';
import { db } from '@/lib/supabase/client';
import Link from 'next/link';

interface Project {
  id: string;
  project_id: string;
  title: string;
  description: string;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectManagerProps {
  userId: string;
  onProjectSelect?: (project: Project) => void;
}

export function ProjectManager({
  userId,
  onProjectSelect,
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.projects.getByUser(userId);

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    try {
      const { data: projectId } = await db.projects.generateProjectId();

      const { data: newProject, error } = await db.projects.create({
        project_id: projectId,
        user_id: userId,
        title: 'New Survey Project',
        description: 'Start creating your survey',
        project_type: 'survey',
      });

      if (error) {
        console.error('Error creating project:', error);
        return;
      }

      setProjects((prev) => [newProject, ...prev]);
      setSelectedProject(newProject);

      if (onProjectSelect) {
        onProjectSelect(newProject);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const getProjectUrl = (projectId: string) => {
    return `/projects/${projectId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
        </div>
        <button
          onClick={createNewProject}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first survey project to get started
          </p>
          <button
            onClick={createNewProject}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedProject?.id === project.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => handleProjectSelect(project)}
            >
              {/* Project Type Badge */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {project.project_type}
                </span>
              </div>

              {/* Project Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>

                {/* Project ID (like Lovable) */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {project.project_id.substring(0, 8)}...
                  </span>
                </div>

                {/* Project Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Link
                      href={getProjectUrl(project.project_id)}
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                      title="Open Project"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                      title="Project Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                      title="Analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Project Info */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                Selected: {selectedProject.title}
              </h3>
              <p className="text-sm text-gray-600">
                Project ID: {selectedProject.project_id}
              </p>
            </div>
            <Link
              href={getProjectUrl(selectedProject.project_id)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Open Project
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
