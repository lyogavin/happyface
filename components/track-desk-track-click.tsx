/* eslint-disable */
"use client"
import Script from 'next/script'

declare global {
  function trackdesk(account: string, event: string): void;
}

export default function TrackDeskTrackClick() {
  return (
    <>
      <Script src="https://cdn.trackdesk.com/tracking.js" strategy="lazyOnload" 
      onReady={() => {
        console.log("TrackDesk tracking script loaded");

        // track click code:
        // @ts-expect-error: TrackDesk initialization requires dynamic indexing
        (function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(...args){(t[d].q=t[d].q||[]).push(args)}})(window,"trackdesk","TrackdeskObject"); 

        trackdesk('happy-face-ai', 'click');
      }}
      />
    </>
  )
}