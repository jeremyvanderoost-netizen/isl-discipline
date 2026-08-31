import { Student, StudentStats } from '../types';

interface StudentRowProps {
  student: Student;
  stats: StudentStats | null;
  isSelected: boolean;
  onToggle: (studentId: number) => void;
  onViewDetail?: (studentId: number) => void;
}

export default function StudentRow({ student, stats, isSelected, onToggle, onViewDetail }: StudentRowProps) {
  const punishmentCount = stats?.punishment_count || 0;
  const hasActiveAlert = stats?.active_alert && !stats.active_alert.resolved_at;

  return (
    <div className="flex items-center gap-3 px-4 py-4 hover:bg-indigo-50 transition-colors border-b border-gray-200 last:border-b-0 min-h-[64px]">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(student.id)}
        className="w-6 h-6 text-indigo-600 cursor-pointer flex-shrink-0 mt-1"
      />
      <div className="flex-1 cursor-pointer min-w-0" onClick={() => onViewDetail?.(student.id)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-indigo-600 hover:text-indigo-800 text-sm">
            {student.last_name} {student.first_name}
          </p>
          {hasActiveAlert && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">
              ☎ ALERTE
            </span>
          )}
          {punishmentCount > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
              punishmentCount >= 3
                ? 'bg-red-100 text-red-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {punishmentCount} retenue{punishmentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">ID: {student.id}</p>
      </div>
    </div>
  );
}
