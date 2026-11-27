import { z } from 'zod';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';
import crypto from 'crypto';

export const TechnicianShiftStatusEnum = z.enum([
  'CHECKED_IN',
  'ON_JOB_SITE',
  'IN_TRANSIT',
  'BREAK',
  'CHECKED_OUT',
]);
export type TechnicianShiftStatus = z.infer<typeof TechnicianShiftStatusEnum>;

export const CheckInSchema = z.object({
  gpsLat: z.number().min(-90).max(90),
  gpsLng: z.number().min(-180).max(180),
  deviceInfo: z.string().max(255).optional(),
});

export const UpdateJobSiteStatusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['ARRIVED_AT_SITE', 'INSTALLATION_ACTIVE', 'COMPLETED_INSTALLATION']),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  notes: z.string().max(500).optional(),
});

export interface TechnicianAttendanceRecord {
  id: string;
  technicianId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: TechnicianShiftStatus;
  currentJobId?: string;
  locationHistory: {
    timestamp: string;
    status: string;
    gpsLat?: number;
    gpsLng?: number;
    notes?: string;
  }[];
}

export class FieldServiceHR {
  private static attendanceStore = new Map<string, TechnicianAttendanceRecord>();

  public static async recordCheckIn(
    technicianId: string,
    rawInput: z.infer<typeof CheckInSchema>
  ): Promise<TechnicianAttendanceRecord> {
    const input = CheckInSchema.parse(rawInput);
    const id = crypto.randomUUID();

    const record: TechnicianAttendanceRecord = {
      id,
      technicianId,
      checkInTime: new Date().toISOString(),
      status: 'CHECKED_IN',
      locationHistory: [
        {
          timestamp: new Date().toISOString(),
          status: 'CHECKED_IN',
          gpsLat: input.gpsLat,
          gpsLng: input.gpsLng,
          notes: 'Shift check-in confirmed via GPS',
        },
      ],
    };

    this.attendanceStore.set(technicianId, record);
    return record;
  }

  public static async updateFieldStatus(
    technicianId: string,
    rawInput: z.infer<typeof UpdateJobSiteStatusSchema>
  ) {
    const input = UpdateJobSiteStatusSchema.parse(rawInput);
    const record = this.attendanceStore.get(technicianId);
    if (!record || record.status === 'CHECKED_OUT') {
      throw new DomainRuleError(
        'TECHNICIAN_NOT_CHECKED_IN',
        'Technician must check in before updating field job status',
        undefined,
        422
      );
    }

    record.currentJobId = input.jobId;
    record.status = input.status === 'COMPLETED_INSTALLATION' ? 'CHECKED_IN' : 'ON_JOB_SITE';
    record.locationHistory.push({
      timestamp: new Date().toISOString(),
      status: input.status,
      gpsLat: input.gpsLat,
      gpsLng: input.gpsLng,
      notes: input.notes,
    });

    this.attendanceStore.set(technicianId, record);
    return record;
  }

  public static async recordCheckOut(technicianId: string) {
    const record = this.attendanceStore.get(technicianId);
    if (!record) {
      throw new NotFoundError('No active attendance record found for technician');
    }

    record.checkOutTime = new Date().toISOString();
    record.status = 'CHECKED_OUT';
    record.locationHistory.push({
      timestamp: new Date().toISOString(),
      status: 'CHECKED_OUT',
      notes: 'Shift completed and checked out',
    });

    this.attendanceStore.set(technicianId, record);
    return record;
  }

  public static getAttendance(technicianId: string): TechnicianAttendanceRecord | undefined {
    return this.attendanceStore.get(technicianId);
  }

  public static listActiveFieldStaff(): TechnicianAttendanceRecord[] {
    return Array.from(this.attendanceStore.values()).filter(
      (r) => r.status !== 'CHECKED_OUT'
    );
  }
}
