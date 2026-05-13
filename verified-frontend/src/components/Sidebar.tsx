import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Eye, FileText, LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { useDashboard } from '../hooks';

const navItemBase =
  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-purple-500';

const Sidebar = () => {
  const { role, userId, fullName, logout } = useAuth();
  const { data: stats } = useDashboard();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[#E4DED2] bg-[#F4F0E7] px-4 py-6">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white text-lg font-bold border-b-2 border-[#CF4232] relative">
          V
          <span className="absolute p-[0.2rem] bg-[#CF4232] rounded-full border border-[#F6F1E8] -top-0.5 -right-0.5"></span>
        </div>

        <div>
          <h1 className="text-lg font-bold leading-none text-[#14110D]">
            Verified
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9B9487]">
            Claims AI
          </p>
        </div>
      </div>

      {/* Workspace */}
      <div className="mb-8">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B0A79A]">
          Workspace
        </p>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232]'
                  : 'text-[#6B6458] hover:bg-[#ECE3D6]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/claims"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232]'
                  : 'text-[#6B6458] hover:bg-[#ECE3D6]'
              }`
            }
            end
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span>Claims</span>
            </div>

            {stats && (
              <span className="rounded-full bg-[#E7E0D5] px-2 py-0.5 text-xs font-semibold text-[#7B7468]">
                {stats.totalClaimsThisWeek}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/claims/new"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232]'
                  : 'text-[#6B6458] hover:bg-[#ECE3D6]'
              }`
            }
            end
          >
            <div className="flex items-center gap-3">
              <Plus size={18} />
              <span>Submit claim</span>
            </div>
          </NavLink>
        </nav>
      </div>

      {/* Adjudication */}
      <div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B0A79A]">
          Adjudication
        </p>

        <nav>
          <NavLink
            to="/claims?status=UNDER_REVIEW"
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232]'
                  : 'text-[#6B6458] hover:bg-[#ECE3D6]'
              }`
            }
            end
          >
            <div className="flex items-center gap-3">
              <Eye size={18} />
              <span>Review queue</span>
            </div>

            {stats && stats.reviewCount > 0 && (
              <span className="rounded-full bg-[#FFD9D3] px-2 py-0.5 text-xs font-semibold text-[#CF4232]">
                {stats.reviewCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Bottom user card */}
      <div className="mt-auto border-t border-[#E4DED2] pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CF4232] text-sm font-bold text-white">
              {fullName ? fullName.slice(0, 2).toUpperCase() : 'AO'}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#14110D]">
                {fullName ?? userId ?? 'User'}
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39B8E]">
                {role ?? '—'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-[#8B8478] transition hover:text-[#14110D]"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
