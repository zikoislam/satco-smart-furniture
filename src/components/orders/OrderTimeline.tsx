'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

export const ORDER_LIFECYCLE_STAGES = [
  { key: 'PENDING_DEPOSIT', labelEn: 'Pending 50% Deposit', labelAr: 'بانتظار الدفعة الأولى ٥٠٪' },
  { key: 'PAID_DEPOSIT', labelEn: 'Deposit Verified (CNC Unlocked)', labelAr: 'تم تأكيد العربون' },
  { key: 'CONFIRMED', labelEn: 'Order Confirmed', labelAr: 'تم تأكيد الطلب' },
  { key: 'PRODUCTION_QUEUED', labelEn: 'Production Queued', labelAr: 'في قائمة الإنتاج' },
  { key: 'IN_PRODUCTION', labelEn: 'In CNC Production', labelAr: 'قيد التصنيع الآلي' },
  { key: 'QC_COMPLETED', labelEn: 'Quality Control Passed', labelAr: 'تم اجتياز فحص الجودة' },
  { key: 'DISPATCH_HOLD_DUE_PAYMENT', labelEn: 'Pre-Dispatch Balance Due (40%)', labelAr: 'بانتظار دفعة ما قبل الشحن ٤٠٪' },
  { key: 'READY_FOR_DELIVERY', labelEn: 'Ready for Delivery', labelAr: 'جاهز للتوصيل' },
  { key: 'OUT_FOR_DELIVERY', labelEn: 'Out for Delivery', labelAr: 'في الطريق إليك' },
  { key: 'DELIVERED', labelEn: 'Delivered to Site', labelAr: 'تم التسليم للموقع' },
  { key: 'INSTALLATION_SCHEDULED', labelEn: 'Installation Scheduled', labelAr: 'تم جدولة التركيب' },
  { key: 'INSTALLATION_IN_PROGRESS', labelEn: 'Installation In Progress', labelAr: 'جاري التركيب' },
  { key: 'HANDOVER_COMPLETED', labelEn: 'Handover Completed', labelAr: 'تم التسليم النهائي' },
] as const;

export interface TimelineEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actionBy: string;
  notes?: string | null;
  createdAt: string;
}

interface OrderTimelineProps {
  currentStatus: string;
  timeline: TimelineEntry[];
  locale?: string;
}

export function OrderTimeline({
  currentStatus,
  timeline,
  locale = 'en',
}: OrderTimelineProps) {
  const isArabic = locale === 'ar';
  const currentIdx = ORDER_LIFECYCLE_STAGES.findIndex((s) => s.key === currentStatus);
  const timelineByStatus = new Map(timeline.map((t) => [t.toStatus, t]));

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3 text-red-700">
          <XCircle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">
              {isArabic ? 'تم إلغاء الطلب' : 'Order Cancelled'}
            </p>
            <p className="text-sm text-red-600">
              {timelineByStatus.get('CANCELLED')?.notes ??
                (isArabic ? 'تم إلغاء هذا الطلب قبل التصنيع.' : 'This order was cancelled prior to production.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ORDER_LIFECYCLE_STAGES.map((stage, idx) => {
        const event = timelineByStatus.get(stage.key);
        const isCompleted = currentIdx > idx || (currentStatus === 'HANDOVER_COMPLETED' && idx === currentIdx);
        const isCurrent = currentIdx === idx && currentStatus !== 'HANDOVER_COMPLETED';

        return (
          <div
            key={stage.key}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              isCurrent
                ? 'border-amber-400 bg-amber-50/70'
                : isCompleted
                ? 'border-emerald-200 bg-emerald-50/40'
                : 'border-stone-200 bg-white opacity-60'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : isCurrent ? (
                <Clock className="h-5 w-5 text-amber-600" />
              ) : (
                <Circle className="h-5 w-5 text-stone-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-stone-900">
                  {isArabic ? stage.labelAr : stage.labelEn}
                </span>
                {event && (
                  <span className="text-xs text-stone-500">
                    {new Date(event.createdAt).toLocaleString(isArabic ? 'ar-SA' : 'en-SA')}
                  </span>
                )}
              </div>
              {event?.notes && (
                <p className="mt-1 text-xs text-stone-600">{event.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
