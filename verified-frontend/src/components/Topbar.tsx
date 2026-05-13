import { Bell } from 'lucide-react';

export default function Topbar({ title, crumb, actions }: any) {
  return (
    <div className="mb-8 pb-5 border-b border-[rgba(20,17,13,0.08)] relative">
      <div className="absolute bottom-0 left-0 w-14 h-0.5 bg-[#d63a1f]" />
      {crumb && (
        <div className="text-[11px] text-[rgba(20,17,13,0.46)] font-mono uppercase mb-2.5 tracking-wide">
          {crumb}
        </div>
      )}
      <div className="flex justify-between items-start">
        <h1 className="font-display text-[38px] font-semibold tracking-tight leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          {actions}
          <button className="btn btn-ghost">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
