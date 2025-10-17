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
    <a href={href} className="group flex w-full flex-col gap-5 rounded-2xl bg-[#FEFFFC] p-0 text-inherit no-underline transition-transform duration-300">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        {renderImage()}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/75 via-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span
            className="text-xl font-medium leading-[1.1] tracking-[-0.04em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Read Me
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-2">
        <h4
          className="text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-neutral-900"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {title}
        </h4>
        <p className="text-sm font-normal text-neutral-500">{date}</p>
      </div>
    </a>
  );
}
