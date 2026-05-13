export function TrustMini({ score }: { score: number | null }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm tabular-nums font-medium">
      <span>{score}</span>
      <div className="w-14 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-full"
          style={{ width: score ? `${score}%` : '0%' }}
        />
      </div>
    </div>
  );
}
