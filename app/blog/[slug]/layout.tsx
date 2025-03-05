import React from 'react';


const BlogLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="blog-layout">
      
      {children}
    </div>
  );
};

export default BlogLayout;
