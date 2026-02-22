import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  User as UserIcon,
  Menu,
  Shield,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["USER", "STAFF", "ADMIN"] },
    { icon: FileText, label: "My Complaints", path: "/complaints", roles: ["USER"] },
    { icon: FileText, label: "Assigned Tasks", path: "/complaints", roles: ["STAFF"] },
    { icon: Shield, label: "All Complaints", path: "/complaints", roles: ["ADMIN"] },
    { icon: Settings, label: "Settings", path: "/settings", roles: ["ADMIN"] },
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-500 ease-in-out shadow-premium ${
          isSidebarOpen ? "w-72" : "w-24"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-24 flex items-center px-8 border-b border-slate-50">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-black text-xl tracking-tighter text-slate-900"
                >
                  RESOLVE<span className="text-blue-600">.</span>
                </motion.span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-bold tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-50">
            <div className={`flex items-center gap-4 p-4 rounded-[2rem] bg-slate-50 border border-slate-100 ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                {user.name.charAt(0)}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarOpen ? "pl-72" : "pl-24"}`}>
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-100 transition-all shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-100"></div>
            <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
              {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {user.role === "USER" && (
              <Link
                to="/complaints/new"
                className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all text-sm font-bold shadow-xl shadow-blue-100"
              >
                <Plus className="w-4 h-4" />
                New Case
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
            <button className="relative p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-100 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
