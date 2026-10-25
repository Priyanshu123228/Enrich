import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileQuickActionBar from './MobileQuickActionBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Navbar />
      <main className="grow pb-28 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileQuickActionBar />
    </div>
  );
}
