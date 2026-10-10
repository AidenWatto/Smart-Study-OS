import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import KeyboardShortcuts from './KeyboardShortcuts';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <KeyboardShortcuts />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'glass-card !shadow-xl text-sm',
          duration: 3000,
        }}
      />
    </div>
  );
}
