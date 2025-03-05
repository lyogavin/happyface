'use client'
import React, { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { slug as slugify } from 'github-slugger'

interface Heading {
  index: number
  text: string
  level: number
}

export function BlogSidebar() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const navRef = React.useRef<HTMLElement>(null)

  useEffect(() => {
    const headingElements = Array.from(document.querySelectorAll('article h1, article h2, article h3'))
    const headingData = headingElements.map((heading, index) => {
      const headingText = heading.textContent || ''
      heading.id = slugify(headingText)
      
      return {
        index,
        text: headingText,
        level: parseInt(heading.tagName[1])
      }
    })
    setHeadings(headingData)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = headingElements.indexOf(entry.target as Element)
            setActiveIndex(index)
            console.log(`Active heading index: ${index}`)
            
            const navElement = navRef.current
            const activeItem = navElement?.querySelector(`li:nth-child(${index + 1})`) as HTMLElement;
            if (activeItem && navElement) {
              const itemTop = activeItem.offsetTop;
              const navHeight = navElement.offsetHeight;
              const itemHeight = activeItem.clientHeight;
              
              navElement.scrollTo({
                top: itemTop - navHeight / 2 + itemHeight / 2,
                behavior: 'smooth'
              });
            }
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0.1 }
    )

    headingElements.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  return (
    <nav ref={navRef} className="hidden lg:block sticky top-4 max-h-[calc(100vh-4rem)] overflow-auto w-64 pr-8">
      <ul className="space-y-2">
        {headings.map((heading, index) => (
          <li key={index}>
            <a
              href={`#${slugify(heading.text)}`}
              className={cn(
                "block py-1 text-sm transition-colors hover:text-foreground/80",
                heading.level === 2 || heading.level === 1 ? "font-semibold" : "pl-4",
                activeIndex === index 
                  ? "text-foreground bg-gradient-to-r from-yellow-500/30 via-purple-300/30 to-pink-300/30 rounded-md px-2" 
                  : "text-foreground/60"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

