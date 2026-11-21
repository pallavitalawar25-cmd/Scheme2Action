export default function Skeleton({ variant = 'line', width, height, className = '' }) {
  return <span className={`skeleton skeleton--${variant} ${className}`} style={{ width, height }} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card skeleton-card" role="status" aria-label="Loading">
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton width="70%" height={18} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="85%" height={12} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
