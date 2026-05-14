import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-auto overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6">
        <div className="mx-auto max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
