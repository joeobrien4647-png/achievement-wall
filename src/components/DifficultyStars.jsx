import { Star } from "lucide-react";

export default function DifficultyStars({ rating, size = 10 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-gray-700"}
        />
      ))}
    </div>
  );
}
