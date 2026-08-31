export interface Class {
  id: number;
  name: string;
  created_at: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  class_id: number;
  created_at: string;
  updated_at: string;
}

export type DisciplineEventType = 'retard' | 'matériel_manquant' | 'travail_non_fait';
export type DisciplineSubcategory = 'préparation' | 'document_oublié' | 'évaluation_non_signée' | null;

export interface DisciplineEvent {
  id: number;
  student_id: number;
  event_type: DisciplineEventType;
  subcategory: DisciplineSubcategory;
  comment: string | null;
  event_date: string;
  created_at: string;
}

export interface Punition {
  id: number;
  student_id: number;
  detention_date: string;
  reason: string | null;
  created_at: string;
  email_sent_at: string | null;
  email_last_error: string | null;
  email_attempts: number;
}

export interface Alert {
  id: number;
  student_id: number;
  punishment_count_at_trigger: number;
  triggered_at: string;
  resolved_at: string | null;
  resolution_comment: string | null;
}

export interface StudentStats {
  student_id: number;
  punishment_count: number;
  active_alert: Alert | null;
}
