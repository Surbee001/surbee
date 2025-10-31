import { formatDistance } from "date-fns";
import { User } from "lucide-react";
import { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  // Mock response count - in real implementation, this would come from project data
  const responseCount = 154;

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
            <p className="font-medium truncate max-w-[120px]" style={{ color: 'var(--surbee-fg-primary)' }} title={project.space_id}>{project.space_id}</p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
              <User className="w-3 h-3" />
              <span>{responseCount}</span>
            </div>
          </div>
        </div>
        <div className="w-[66px] h-[35px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-[#f8f8f8] group-hover:pointer-events-auto duration-300 ease-in-out text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition" style={{ border: '1px solid var(--surbee-border-accent)' }}
          Edit
        </div>
      </div>
      <div
        className="w-full rounded-[8px] bg-cover bg-center aspect-[210/119] mt-auto"
        role="img"
        style={{
          backgroundImage: 'url("https://endlesstools.io/embeds/4.png")',
        }}
      />
    </div>
  );
}
