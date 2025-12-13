import React from "react";
import Link from "next/link";
import { jobRoles } from "./data";

export default function CareersPage() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-[var(--surbee-fg-primary)]">Careers</h1>
        <p className="text-xl text-[var(--surbee-fg-secondary)] max-w-2xl mx-auto">
          Join us in building the future of coding. We are looking for exceptional engineers and designers to join our team.
        </p>
      </header>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {jobRoles.map((role) => (
          <Link 
            key={role.slug} 
            href={`/careers/${role.slug}`}
            className="block group p-6 rounded-lg border border-[var(--surbee-border-secondary)] bg-[var(--surbee-card-bg)] hover:bg-[var(--surbee-card-hover)] hover:border-[var(--surbee-border-focus)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--surbee-fg-primary)] group-hover:text-blue-500 transition-colors">
                  {role.title}
                </h2>
                <p className="text-[var(--surbee-fg-secondary)] mt-1">
                  {role.department} · {role.type} · {role.location}
                </p>
              </div>
              <div className="flex items-center text-[var(--surbee-fg-secondary)] group-hover:text-[var(--surbee-fg-primary)] transition-colors">
                <span>View Role</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        ))}

        {jobRoles.length === 0 && (
          <p className="text-center text-[var(--surbee-fg-secondary)] py-12">
            No open positions at the moment. Please check back later.
          </p>
        )}
      </div>
    </section>
  );
}
