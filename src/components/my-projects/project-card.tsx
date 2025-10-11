import { formatDistance } from "date-fns";
import { User } from "lucide-react";
import { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  // Mock response count - in real implementation, this would come from project data
  const responseCount = 154;

  return (
    <div
      className="group w-full p-[5px] rounded-[12px] relative ring-1 ring-zinc-300 hover:ring-1 hover:ring-zinc-200 transition-all duration-300 ease-in-out bg-zinc-100 flex flex-col gap-[5px] h-full"
      style={{ cursor: "pointer" }}
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
          <div className="text-sm text-zinc-600 flex flex-col justify-center h-[35px]">
            <p className="text-zinc-800 font-medium truncate max-w-[120px]" title={project.space_id}>{project.space_id}</p>
            <div className="flex items-center gap-1 text-zinc-500 text-xs">
              <User className="w-3 h-3" />
              <span>{responseCount}</span>
            </div>
          </div>
        </div>
        <div className="w-[66px] h-[35px] bg-zinc-100 text-zinc-700 border border-zinc-200 opacity-0 group-hover:opacity-100 group-hover:border-zinc-300 group-hover:pointer-events-auto duration-300 ease-in-out text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition">
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
