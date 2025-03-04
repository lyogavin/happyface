import Link from "next/link"

export function EditorFooter() {
  return (
    <footer className="border-t py-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Cum Face AI. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-purple-600">
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