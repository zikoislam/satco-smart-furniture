'use client';

import React, { createContext, useContext } from 'react';
import Script from 'next/script';
import { pushToDataLayer, type DataLayerEvent } from '@/lib/analytics/data-layer';

interface GA4ContextValue {
  trackEvent: (event: DataLayerEvent) => void;
}

const GA4Context = createContext<GA4ContextValue>({
  trackEvent: pushToDataLayer,
});

export function useGA4() {
  return useContext(GA4Context);
}

export function GA4Provider({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <GA4Context.Provider value={{ trackEvent: pushToDataLayer }}>
      {gtmId && (
        <Script
          id="satco-gtm-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}
      {children}
    </GA4Context.Provider>
  );
}
