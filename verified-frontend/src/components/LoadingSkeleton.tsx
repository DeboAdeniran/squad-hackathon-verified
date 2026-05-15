/**
 * Reusable loading skeleton components shaped to match the app's responsive UI.
 */

type SkeletonLineProps = {
  className?: string;
};

const shimmer =
  'animate-pulse rounded-md bg-gradient-to-r from-black/5 via-black/10 to-black/5';

export const SkeletonLine = ({ className = '' }: SkeletonLineProps) => (
  <div className={`${shimmer} h-4 w-full ${className}`} />
);

export const SkeletonCard = () => (
  <div className="glass p-4 sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-8 w-32 sm:h-10 sm:w-40" />
      </div>
      <SkeletonLine className="size-8 shrink-0 rounded-md" />
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonLine className="h-2.5 w-14" />
          <SkeletonLine className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  const columns = [
    { className: 'min-w-38', width: 'w-32' },
    { className: 'hidden sm:block', width: 'w-20' },
    { className: '', width: 'w-20' },
    { className: '', width: 'w-24' },
    { className: 'hidden md:block', width: 'w-20' },
    { className: 'hidden lg:block', width: 'w-24' },
    { className: 'hidden sm:block', width: 'w-20' },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-160 md:min-w-full">
        <div className="grid grid-cols-[1.35fr_0.8fr_0.85fr_1fr_0.8fr_0.9fr_0.9fr] gap-3 border-b border-black/10 bg-black/[0.025] px-3.5 py-3">
          {columns.map((column, i) => (
            <SkeletonLine
              key={i}
              className={`h-2.5 ${column.width} ${column.className}`}
            />
          ))}
        </div>
        <div>
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-[1.35fr_0.8fr_0.85fr_1fr_0.8fr_0.9fr_0.9fr] gap-3 border-b border-black/10 px-3.5 py-3.5"
            >
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-32" />
                <SkeletonLine className="h-3 w-24" />
              </div>
              <SkeletonLine className="hidden h-6 w-20 rounded-full sm:block" />
              <SkeletonLine className="h-4 w-20" />
              <SkeletonLine className="h-6 w-24 rounded-full" />
              <SkeletonLine className="hidden h-6 w-20 rounded-full md:block" />
              <SkeletonLine className="hidden h-2.5 w-24 rounded-full lg:block" />
              <SkeletonLine className="hidden h-4 w-20 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="glass p-4 sm:p-5">
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  </div>
);
