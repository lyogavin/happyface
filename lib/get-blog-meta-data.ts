import type { Metadata } from "next";
import appConfig from "@/lib/app-config";
import { Post } from "@/lib/blog";

export async function getBlogMetadata({
  slug, postMetadata
}: {
  slug: string;
  postMetadata: Post;
}): Promise<Metadata | undefined> {
  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = postMetadata;

  const defaultImage = "/default-blog-image.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${appConfig.url}/blog/${slug}`,
      images: [
        {
          url: image || defaultImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || defaultImage],
    },
  };
}