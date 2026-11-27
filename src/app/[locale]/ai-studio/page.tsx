'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { AIStudioStudio } from '@/components/ai-studio/AIStudioStudio';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function AIStudioPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <span>←</span>
          <span>{locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>
        <span className="text-xs font-bold text-indigo-400">SATCO AI SMART ENGINE</span>
      </div>

      <AIStudioStudio
        onConceptConfirmed={(concept, dimensions) => {
          console.info('Concept confirmed with measurements', concept.conceptId, dimensions);
        }}
      />
    </div>
  );
}
