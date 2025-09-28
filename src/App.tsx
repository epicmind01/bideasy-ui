import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { RegionProvider } from './context/RegionContext'
import { useSidebar } from './context/SidebarContext'

function AppShell() {
  const { isExpanded, isHovered } = useSidebar();
  const contentShiftClass = (isExpanded || isHovered) ? 'lg:ml-[290px]' : 'lg:ml-[90px]';
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <div className={`transition-all duration-300 ${contentShiftClass}`}>
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <SidebarProvider>
      <RegionProvider>
        <AppShell />
      </RegionProvider>
    </SidebarProvider>
  )
}

export default App
