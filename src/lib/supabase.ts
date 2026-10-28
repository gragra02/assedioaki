import { createClient } from '@supabase/supabase-js';
import { Report, ReportComment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function mapDbRowToReport(row: any, comments: ReportComment[] = []): Report {
  return {
    id: row.id,
    accessKey: row.access_key,
    isAnonymous: row.is_anonymous,
    title: row.title,
    category: row.category,
    locationType: row.location_type,
    address: row.address,
    city: row.city,
    state: row.state,
    lat: row.lat,
    lng: row.lng,
    dateTime: row.date_time,
    periodOfDay: row.period_of_day,
    description: row.description,
    aggressorDetails: row.aggressor_details || undefined,
    witnesses: row.witnesses || undefined,
    riskLevel: row.risk_level,
    status: row.status,
    forwardDestination: row.forward_destination || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    encryptedPayload: row.encrypted_payload || undefined,
    encryptionHash: row.encryption_hash || undefined,
    timeline: row.timeline || [],
    attachments: row.attachments || [],
    comments
  };
}

export function mapReportToDbRow(report: Report) {
  return {
    id: report.id,
    access_key: report.accessKey,
    is_anonymous: report.isAnonymous,
    title: report.title,
    category: report.category,
    location_type: report.locationType,
    address: report.address,
    city: report.city,
    state: report.state,
    lat: report.lat,
    lng: report.lng,
    date_time: report.dateTime,
    period_of_day: report.periodOfDay,
    description: report.description,
    aggressor_details: report.aggressorDetails || null,
    witnesses: report.witnesses || null,
    risk_level: report.riskLevel,
    status: report.status,
    forward_destination: report.forwardDestination || null,
    encrypted_payload: report.encryptedPayload || null,
    encryption_hash: report.encryptionHash || null,
    timeline: report.timeline || [],
    attachments: report.attachments || [],
    created_at: report.createdAt,
    updated_at: report.updatedAt
  };
}