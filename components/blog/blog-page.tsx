import React from "react";
import { Post } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { ProgressBar } from "@/components/blog/progress-bar"



export default async function BlogPage({
  children,
  metadata,
}: {
  children: React.ReactNode;
  metadata: Post;
}) {
  return (
    <>
      <ProgressBar />
      <div className="max-w-6xl mx-auto px-4 py-8 flex mt-[3.5rem]">
        <BlogSidebar />
        <div className="max-w-4xl mx-auto flex-grow">
          <header className="mb-8">
            <h1 id="post-title" className="text-3xl font-bold tracking-tight mb-4 animate-fadeIn" style={{ animationFillMode: 'forwards' }}>
              {metadata.title}
            </h1>
            <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <Image
                src="/logo/logo.png"
                alt="Author avatar"
                className="rounded-full"
                width={40}
                height={40}
              />
              <div>
                <p className="font-medium">{metadata.author}</p>
                <p className="text-sm text-muted-foreground">
                  Posted on {formatDate(metadata.publishedAt)}
                </p>
              </div>
            </div>
          </header>

          <div className="prose prose-gray max-w-none">
            {metadata.image && (
              <div className="relative w-full h-0 pb-[50%] mb-8">
                <Image
                  src={metadata.image}
                  alt={metadata.title}
                  fill
                  className="rounded-lg animate-fadeIn"
                  style={{
                    animationDelay: '400ms',
                    objectFit: 'contain', 
                    objectPosition: 'left',
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            <div className="pt-8">
              {children}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
