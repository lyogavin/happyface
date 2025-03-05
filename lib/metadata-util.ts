//import { siteConfig } from "@/lib/config";
import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";
import appConfig from "@/lib/app-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || appConfig.url}${path}`;
}

export function constructMetadata({
  title = appConfig.name,
  description = appConfig.description,
  image = absoluteUrl("/og"),
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  [key: string]: Metadata[keyof Metadata];
}): Metadata {
  return {
    title: {
      template: "%s",
      default: appConfig.name,
    },
    description: description || appConfig.description,
    keywords: appConfig.keywords,
    openGraph: {
      title,
      description,
      url: appConfig.url,
      siteName: appConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    icons: "/favicon.ico",
    metadataBase: new URL(appConfig.url),
    authors: [
      {
        name: appConfig.name,
        url: appConfig.url,
      },
    ],
    robots: {
      index: true,
      follow: true,
    },
    ...props,
  };
}
