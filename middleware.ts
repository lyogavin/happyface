import { clerkMiddleware } from "@clerk/nextjs/server";
import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/plans(.*)', '/sign-up(.*)', '/', '/#(.*)', '/sitemap.xml', 
  '/api/webhook/stripe(.*)', '/api/cog-webhook(.*)', '/clothes-remover(.*)', '/terms', '/disclaimer',
  '/api/health-check(.*)', '/api/(.*)', '/blog/(.*)', '/blog/(.*)/(.*)', '/blog', '/NSFW-generator(.*)', '/ai-nsfw-api(.*)',
  '/tools/(.*)'
])

  
export default clerkMiddleware(async (auth, request) => {
    // Check if the domain is ainsfwapi.com and reroute to /ai-nsfw-api
    const hostname = request.headers.get('host');
    if (hostname?.includes('ainsfwapi.com')) {
      const url = new URL('/ai-nsfw-api', request.url);
      console.log('Rewriting to /ai-nsfw-api');
      return NextResponse.rewrite(url);
    }

    if (!isPublicRoute(request)) {
      const authObject = await auth();
      if (!authObject.userId) {
        return authObject.redirectToSignIn();
      }
    }
  })


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};