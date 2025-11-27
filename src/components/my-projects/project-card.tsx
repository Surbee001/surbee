import { formatDistance } from "date-fns";
import { User } from "lucide-react";
import { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  // Use real response count from project data
  const responseCount = project.response_count ?? 0;

  return (
    <div
      className="group w-full p-[5px] rounded-[12px] relative border transition-all duration-300 ease-in-out flex flex-col gap-[5px] h-full"
      style={{
        cursor: "pointer",
        backgroundColor: 'var(--surbee-card-bg)',
        borderColor: 'transparent',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        const isDark = document.documentElement.classList.contains('dark');
        e.currentTarget.style.borderColor = isDark ? '#f8f8f8' : '#000000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="w-full flex justify-between">
        <div className="flex gap-[5px]">
          <img
            className="rounded-[8px]"
            height={35}
            width={35}
            src="https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75"
            alt="User avatar"
          />
          <div className="text-sm flex flex-col justify-center h-[35px]">
            <p className="font-medium truncate max-w-[120px]" style={{ color: 'var(--surbee-fg-primary)' }} title={project.title}>{project.title || project.space_id || 'Untitled Project'}</p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
              <User className="w-3 h-3" />
              <span>{responseCount}</span>
            </div>
          </div>
        </div>
        <div className="w-[66px] h-[35px] opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto duration-300 ease-in-out text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition"
          style={{
            backgroundColor: 'var(--surbee-fg-primary)',
            color: 'var(--surbee-bg-primary)',
            border: '1px solid var(--surbee-border-accent)'
          }}>
          Edit
        </div>
      </div>
      <div
        className="w-full rounded-[8px] bg-cover bg-center aspect-[210/119] mt-auto relative overflow-hidden"
        role="img"
        style={{
          backgroundImage: project.preview_image_url
            ? `url("${project.preview_image_url}")`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundColor: project.preview_image_url ? 'transparent' : '#f5f5f5'
        }}
      >
        {!project.preview_image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-medium opacity-50" style={{ color: 'var(--surbee-fg-primary)' }}>
                No preview yet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
