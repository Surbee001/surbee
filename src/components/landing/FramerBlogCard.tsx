"use client";

import React from "react";
import { Image as IKImage } from "@imagekit/next";

type FramerBlogCardProps = {
  href: string;
  imageSrc: string;
  title: string;
  date: string;
};

export default function FramerBlogCard({ href, imageSrc, title, date }: FramerBlogCardProps) {
  const renderImage = () => {
    if (imageSrc.startsWith("/")) {
      return (
        <IKImage
          src={imageSrc}
          alt={title}
          width={1920}
          height={1080}
          sizes="max((min(100vw, 1440px) - 96px) / 3, 200px)"
          className="h-full w-full object-cover"
          transformation={[{ width: 1920, height: 1080, quality: 85 }]}
          loading="lazy"
        />
      );
    }

    return (
      <img
        src={`${imageSrc}?width=1920&height=1080`}
        srcSet={`${imageSrc}?scale-down-to=512&width=1920&height=1080 512w, ${imageSrc}?scale-down-to=1024&width=1920&height=1080 1024w, ${imageSrc}?width=1920&height=1080 1920w`}
        sizes="max((min(100vw, 1440px) - 96px) / 3, 200px)"
        width={1920}
        height={1080}
        className="h-full w-full object-cover"
        alt={title}
        loading="lazy"
      />
    );
  };

  return (
    <a
      href={href}
      className="group flex w-full flex-col gap-5 rounded-2xl bg-[#FEFFFC] p-0 text-inherit no-underline transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        {renderImage()}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-6 items-end px-6 pb-6 transition-all duration-300 group-hover:translate-y-0">
          <span className="text-sm font-semibold uppercase tracking-widest text-white">Read me</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-2">
        <h4 className="text-lg font-semibold leading-tight text-neutral-900">{title}</h4>
        <p className="text-sm font-medium text-neutral-600">{date}</p>
      </div>
    </a>
  );
}
