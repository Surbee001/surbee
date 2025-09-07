import Link from "next/link";
import { formatDistance } from "date-fns";
import { EllipsisVertical, Settings } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="text-neutral-200 space-y-3 group cursor-pointer">
      {/* Survey Preview Card */}
      <Link
        href={`/projects/${project.space_id}`}
        className="relative bg-neutral-900 rounded-2xl overflow-hidden h-44 w-full block border border-neutral-800"
      >
        <iframe
          src={`https://${project.space_id.replace("/", "-")}.static.hf.space/`}
          frameBorder="0"
          className="absolute inset-0 w-full h-full top-0 left-0 group-hover:brightness-75 transition-all duration-200 pointer-events-none"
        ></iframe>
      </Link>
      
      {/* User Info and Actions Below Card */}
      <div className="flex items-start justify-between gap-3 relative group/actions">
        <div className="flex items-start gap-3">
          {/* User Profile Picture with Gradient */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
          
          {/* User Title and Last Edited */}
          <div className="flex-1">
            <p className="text-neutral-200 text-base font-semibold line-clamp-1">
              {project.space_id}
            </p>
            <p className="text-sm text-neutral-500">
              Last edited{" "}
              {formatDistance(
                new Date(project._updatedAt || Date.now()),
                new Date(),
                {
                  addSuffix: true,
                }
              )}
            </p>
          </div>
        </div>
        
        {/* Status Badge and 3 Dots Menu */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className="inline-block rounded-md px-2 py-0.5 text-xs font-medium bg-brand-sapphire text-brand-sapphire-foreground"
            style={{
              backgroundColor: "hsl(217 33% 22%)",
              color: "hsl(209 100% 85%)",
            }}
          >
            Draft
          </span>
          
          {/* 3 Dots Menu - Shows on Hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover/actions:opacity-100 transition-opacity duration-200"
              >
                <EllipsisVertical className="text-neutral-400 size-5 hover:text-neutral-300 transition-colors duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <a
                  href={`https://huggingface.co/spaces/${project.space_id}/settings`}
                  target="_blank"
                >
                  <DropdownMenuItem>
                    <Settings className="size-4 text-neutral-100" />
                    Project Settings
                  </DropdownMenuItem>
                </a>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
