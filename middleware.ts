import { clerkMiddleware } from "@clerk/nextjs/server";
import { createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/plans(.*)', '/sign-up(.*)', '/', '/#(.*)', '/sitemap.xml', 
  '/api/webhook/stripe(.*)', '/api/cog-webhook(.*)',
  '/api/health-check(.*)', '/api/(.*)', '/blog/(.*)', '/blog/(.*)/(.*)', '/blog', 
  ])

  
export default clerkMiddleware(async (auth, request) => {
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