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
