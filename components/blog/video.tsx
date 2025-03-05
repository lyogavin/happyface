import { Suspense } from 'react'

export default function Video({ url, thumbnail }: { url: string, thumbnail: string }) {
  return (
    <Suspense fallback={<p>Loading cum face transformation video...</p>}>
      <VideoComponent url={url} thumbnail={thumbnail} />
    </Suspense>
  )
}
 
async function VideoComponent({ url, thumbnail }: { url: string, thumbnail: string }) {
  return (
    <>
    <video 
      controls 
      preload="none" 
      aria-label="Cum Face AI transformation demonstration"
      width="100%"
      height="auto"
      poster={thumbnail}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    </>
  )
}