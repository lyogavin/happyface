import React from "react";
import { getPost } from "@/lib/blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPage from "@/components/blog/blog-page";
import { getBlogMetadata } from "@/lib/get-blog-meta-data";
import { MDXRemote } from 'next-mdx-remote/rsc'
//import remarkGfm from "remark-gfm";
//import rehypePrettyCode from "rehype-pretty-code";
import { Button } from '@/components/ui/button'
import { ImageFeed } from '@/components/blog/image-feed'
import { CtaSection } from '@/components/blog/blog-cta'
import Video from '@/components/blog/video'
import Link from 'next/link'

/*const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: false,
    }] as [typeof rehypePrettyCode, Record<string, unknown>]
  }
};*/

// Define the components that will be available in MDX files
const components = {
  Button,
  ImageFeed,
  Video,
  Link,
  CtaSection,
  // Add other components you want to use in MDX here
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;

  const post = await getPost(slug);
  
  if (!post || !post.metadata) {
    return undefined;
  }
  
  return getBlogMetadata({ slug, postMetadata: post.metadata });
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  console.log('source', post.source);
  console.log('metadata', post.metadata);
  console.log('components', components);
  //console.log('options', options);
  
  return (
    <BlogPage metadata={post.metadata}>
      <article className="prose dark:prose-invert mx-auto max-w-full">
        <MDXRemote 
          source={post.source} 
          components={components}
          //options={options}
        />
      </article>
    </BlogPage>
  );
}
