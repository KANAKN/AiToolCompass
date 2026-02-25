interface StarRatingProps {
  score: number;
  max?: number;
  label: string;
}

export function StarRating({ score, max = 5, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`text-sm ${i < score ? "text-amber-400" : "text-gray-200"}`}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-400">{score}/{max}</span>
    </div>
  );
}
