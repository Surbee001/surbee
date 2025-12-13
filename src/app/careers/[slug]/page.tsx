import React from "react";
import { notFound } from "next/navigation";
import { jobRoles } from "../data";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JobPage(props: PageProps) {
  const params = await props.params;
  const job = jobRoles.find((role) => role.slug === params.slug);

  if (!job) {
    notFound();
  }

  return (
    <>
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <article className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-24">
              <div className="mb-8 relative z-1">
                <Link
                  className="text-[var(--surbee-fg-secondary)] hover:text-[var(--surbee-fg-primary)] transition-colors"
                  href="/careers"
                >
                  ← All Careers
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-1 xl:col-span-9">
            <header className="mb-8">
              <h1 className="text-4xl font-semibold mb-4 text-balance text-[var(--surbee-fg-primary)]">
                {job.title}
              </h1>
              <p className="text-[var(--surbee-fg-secondary)] mb-6 text-lg">
                {job.department} · {job.type} · {job.location}
              </p>
              <a
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surbee-fg-primary)] text-[var(--surbee-bg-primary)] rounded-md font-medium hover:opacity-90 transition-opacity"
                href="#apply"
              >
                Apply
                <span aria-hidden="true">↓</span>
              </a>
            </header>
            
            <div className="mb-12">
              <div className="prose prose-lg max-w-none text-[var(--surbee-fg-primary)]">
                <p>
                  <strong className="text-[var(--surbee-fg-primary)]">Role</strong>
                </p>
                {job.description.map((desc, index) => (
                  <p key={index} className="mb-4 text-[var(--surbee-fg-primary)] opacity-90">
                    {desc}
                  </p>
                ))}

                <p className="mt-8">
                  <strong className="text-[var(--surbee-fg-primary)]">Responsibilities</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6 marker:text-[var(--surbee-fg-secondary)]">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>
                      <p className="text-[var(--surbee-fg-primary)] opacity-90">{item}</p>
                    </li>
                  ))}
                </ul>

                <p className="mt-8">
                  <strong className="text-[var(--surbee-fg-primary)]">Requirements</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6 marker:text-[var(--surbee-fg-secondary)]">
                  {job.requirements.map((item, index) => (
                    <li key={index}>
                      <p 
                        className="text-[var(--surbee-fg-primary)] opacity-90"
                        dangerouslySetInnerHTML={{ __html: item }} 
                      />
                    </li>
                  ))}
                </ul>

                <p className="mt-8">
                  <strong className="text-[var(--surbee-fg-primary)]">About</strong>
                </p>
                {job.about.map((paragraph, index) => (
                  <p 
                    key={index} 
                    className="mb-4 text-[var(--surbee-fg-primary)] opacity-90"
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
            </div>

            <section className="pt-8 border-t border-[var(--surbee-border-secondary)]">
              <header className="mb-6">
                <h2 id="apply" className="text-2xl font-semibold text-[var(--surbee-fg-primary)]">Apply for this role</h2>
              </header>
              <form className="space-y-6" aria-label="Job application form">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="_systemfield_name"
                  >
                    Name
                    <span
                      className="text-red-500 ml-1"
                      aria-label="required"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="_systemfield_name"
                    className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] focus:outline-none focus:border-[var(--surbee-fg-primary)] placeholder:text-[var(--surbee-fg-secondary)]/60 transition-colors"
                    name="_systemfield_name"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="_systemfield_email"
                  >
                    Email
                    <span
                      className="text-red-500 ml-1"
                      aria-label="required"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="_systemfield_email"
                    className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] focus:outline-none focus:border-[var(--surbee-fg-primary)] placeholder:text-[var(--surbee-fg-secondary)]/60 transition-colors"
                    name="_systemfield_email"
                    type="email"
                    required
                    placeholder="hello@world.com"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="_systemfield_resume"
                  >
                    Resume
                  </label>
                  <div className="relative">
                    <input
                      id="_systemfield_resume"
                      className="sr-only"
                      name="_systemfield_resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                    />
                    <button
                      className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] hover:bg-[var(--surbee-card-hover)] focus:outline-none focus:border-[var(--surbee-fg-primary)] cursor-pointer text-center transition-colors"
                      type="button"
                    >
                      ↥ Upload file
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="linkedin"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedin"
                    className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] focus:outline-none focus:border-[var(--surbee-fg-primary)] placeholder:text-[var(--surbee-fg-secondary)]/60 transition-colors"
                    name="linkedin"
                    type="url"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="github"
                  >
                    GitHub Profile
                  </label>
                  <input
                    id="github"
                    className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] focus:outline-none focus:border-[var(--surbee-fg-primary)] placeholder:text-[var(--surbee-fg-secondary)]/60 transition-colors"
                    name="github"
                    type="url"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-[var(--surbee-fg-primary)]"
                    htmlFor="project_note"
                  >
                    Please write a short note on a project you're proud of:
                  </label>
                  <textarea
                    id="project_note"
                    className="w-full px-3 py-2 border rounded-md bg-[var(--surbee-card-bg)] border-[var(--surbee-border-secondary)] text-[var(--surbee-fg-primary)] focus:outline-none focus:border-[var(--surbee-fg-primary)] placeholder:text-[var(--surbee-fg-secondary)]/60 transition-colors resize-y min-h-[150px]"
                    name="project_note"
                    rows={6}
                  />
                </div>
                <div className="pt-4">
                  <button 
                    className="w-full md:w-auto px-6 py-3 bg-[var(--surbee-fg-primary)] text-[var(--surbee-bg-primary)] rounded-md font-medium hover:opacity-90 transition-opacity" 
                    type="submit"
                  >
                    Submit application →
                  </button>
                </div>
              </form>
            </section>
          </div>
        </article>
      </section>
    </>
  );
}
