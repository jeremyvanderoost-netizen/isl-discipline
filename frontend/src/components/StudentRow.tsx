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
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-200 last:border-b-0">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(student.id)}
        className="w-5 h-5 text-indigo-600 cursor-pointer"
      />
      <div className="flex-1 cursor-pointer" onClick={() => onViewDetail?.(student.id)}>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-indigo-600 hover:text-indigo-800">
            {student.last_name} {student.first_name}
          </p>
          {hasActiveAlert && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              ☎ ALERTE
            </span>
          )}
          {punishmentCount > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              punishmentCount >= 3
                ? 'bg-red-100 text-red-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {punishmentCount} retenue{punishmentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">ID: {student.id}</p>
      </div>
    </div>
  );
}
