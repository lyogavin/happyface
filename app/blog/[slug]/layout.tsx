import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BlogLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="blog-layout">
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo/logo.png" 
                alt="CrazyFace AI Logo" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
              <span className="font-bold text-lg hidden sm:inline">CrazyFace AI</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
              Blog Home
            </Link>
            <Link href="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
              Start Free
            </Link>
          </nav>
        </div>
      </header>
      
      {children}
    </div>
  );
};

export default BlogLayout;
