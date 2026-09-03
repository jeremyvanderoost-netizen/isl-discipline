export interface DisciplineItem {
  class_name: string;
  first_name: string;
  last_name: string;
  date: string;
  kind: 'event' | 'punition';
  type?: 'retard' | 'matériel_manquant' | 'travail_non_fait';
  subcategory?: string | null;
  comment?: string | null;
  reason?: string | null;
}

const EVENT_LABELS: Record<string, string> = {
  retard: 'Retard',
  matériel_manquant: 'Matériel manquant',
  travail_non_fait: 'Travail non fait'
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  préparation: 'Préparation à domicile',
  document_oublié: 'Document oublié',
  évaluation_non_signée: 'Évaluation non signée'
};

export function getDisciplineLabel(item: DisciplineItem): string {
  if (item.kind === 'punition') {
    return `Punition${item.reason ? ' - ' + item.reason : ''}`;
  }
  const base = EVENT_LABELS[item.type || ''] || item.type || '';
  const sub = item.subcategory ? SUBCATEGORY_LABELS[item.subcategory] || item.subcategory : '';
  return sub ? `${base} (${sub})` : base;
}
