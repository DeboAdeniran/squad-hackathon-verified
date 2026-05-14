import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks';
import {
  Eye,
  FileText,
  LayoutDashboard,
  Plus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useDashboard } from '../hooks';

const navItemBase =
  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-[#ECE3D6]';

const Sidebar = () => {
  const { role, userId, fullName, logout } = useAuth();
  const { data: stats } = useDashboard();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-black text-lg font-bold text-white border-b-2 border-[#CF4232]">
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
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232] hover:bg-[#14110D]'
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
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232] hover:bg-[#14110D]'
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
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232] hover:bg-[#14110D]'
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
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `${navItemBase} ${
                isActive
                  ? 'bg-[#14110D] text-white shadow-sm border-b-2 border-[#CF4232] hover:bg-[#14110D]'
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
      <div className="mt-auto border-t border-[#E4DED2] pt-4 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CF4232] text-sm font-bold text-white">
              {fullName ? fullName.slice(0, 2).toUpperCase() : 'AO'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#14110D]">
                {fullName ?? userId ?? 'User'}
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39B8E]">
                {role ?? '—'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-[#8B8478] transition hover:text-[#14110D] shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 right-4 z-50 rounded-lg bg-[#14110D] p-2 text-white shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform flex flex-col border-r border-[#E4DED2] bg-[#F4F0E7] px-4 py-6 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default Sidebar;
