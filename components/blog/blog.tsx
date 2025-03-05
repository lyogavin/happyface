import React from "react";
import BlogCard from "@/components/blog/blog-card";
import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";

export async function Blog({ slugs }: { slugs?: string[] }) {
  const allPosts = await getBlogPosts();

  const articles = await Promise.all(
    allPosts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  );

  const displayedArticles = slugs 
    ? articles.filter((article) => slugs.includes(article.slug))
    : articles;

  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20 mt-24">
        <div className="text-center py-16">
          {slugs ? (
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              CrazyFace AI Blog
            </h2>
          ) : (
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              CrazyFace AI Blog
            </h1>
          )}
          <p className="mt-4 text-xl text-muted-foreground">
            Posts about getting your perfect facial expressions and selfies
          </p>
        </div>
      </div>
      <div className="min-h-[50vh] bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg">
        <div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-8 px-2.5 py-10 lg:px-20 lg:grid-cols-3">
          {displayedArticles.map((data, idx) => (
            <BlogCard key={data.slug} data={data} priority={idx <= 1} />
          ))}
        </div>
        {slugs && (
          <div className="flex justify-center mt-0 pb-24">
            <Link 
              href="/blog" 
              className="bg-primary text-white px-4 py-2 rounded-md transition-colors duration-300 hover:bg-primary/80"
            >
              All Blogs ...
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
