

import React from 'react';

export const metadata = {
  alternates: {
    canonical: '/blog',
  },
};


export default async function Layout({ children }: { children: React.ReactNode  }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
