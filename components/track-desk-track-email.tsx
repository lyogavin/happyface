"use client"

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
declare global {
  function trackdesk(account: string, event: string, data: {
    externalCid: string;
    revenueOriginId: string;
  }): void;
}

export default function TrackDeskTrackEmail() {
  const [ trackingReady, setTrackingReady] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user && trackingReady) {
      // @ts-expect-error: TrackDesk initialization requires dynamic indexing
      // eslint-disable-next-line prefer-rest-params
      (function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(){(t[d].q=t[d].q||[]).push(arguments)}})(window,"trackdesk","TrackdeskObject");

      trackdesk('happy-face-ai', 'externalCid', {
        externalCid: user.emailAddresses[0].emailAddress, // user email
        revenueOriginId: '63652d52-e0eb-40eb-9121-f53897bd804e'
      });

      console.log("TrackDesk tracking script loaded, tracking email: ", user.emailAddresses[0].emailAddress);
    }
  }, [isLoaded, user, trackingReady]);

  return (
    <>
      <Script src="https://cdn.trackdesk.com/tracking.js" strategy="lazyOnload" 
      onReady={() => {
        console.log("TrackDesk tracking script loaded");
        setTrackingReady(true);

      }}
      />
    </>
  )
}