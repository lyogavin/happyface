import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import landingPageData from '@/app/tools/[generator-title]/enhanced_results_with_prompts_nsfw_image_gend.json'

export function EditorFooter() {
  return (
    <footer className="border-t py-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Cum Face AI. All rights reserved.
          </div>
          <div className="flex gap-6 items-center">
            {/* AI Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm text-gray-500 hover:text-purple-600">
                  AI Tools
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                {landingPageData.map((tool, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <Link 
                      href={`/tools/${tool.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')}`}
                      className="w-full"
                    >
                      {tool.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/terms-of-use/index.html" className="text-sm text-gray-500 hover:text-purple-600">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="text-sm text-gray-500 hover:text-purple-600">
              Disclaimer
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-purple-600">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 