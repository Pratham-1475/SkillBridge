export default function StarRating({ rating, reviewCount, dark = false }) {
  const rounded = Math.round(rating);

  return (
    <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-200' : 'text-slate-300'}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={index < rounded ? 'text-amber-400' : 'text-slate-600'}>
            {'\u2605'}
          </span>
        ))}
      </div>
      <span>
        {rating.toFixed(1)} ({reviewCount} reviews)
      </span>
    </div>
  );
}
