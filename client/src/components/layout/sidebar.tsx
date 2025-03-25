import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  ClipboardList,
  DollarSign,
  BarChart2,
  Users,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-[#1a4b8c] p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-bold text-xl text-white ml-2">VOYAGER</h1>
        </div>
      </div>

      <aside 
        className={`fixed top-0 left-0 z-30 h-screen bg-[#1a4b8c] text-white transition-all duration-300 
          ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64"} 
          lg:block`}
      >
        <div className="p-4 border-b border-blue-800">
          <h1 className={`font-bold text-2xl ${collapsed ? "lg:hidden" : ""}`}>VOYAGER</h1>
          <p className={`text-sm opacity-75 ${collapsed ? "lg:hidden" : ""}`}>Motorcycle Dealership DSS</p>
        </div>
        
        <nav className="mt-6">
          <ul>
            <SidebarItem 
              href="/dashboard" 
              icon={<Home />} 
              label="Dashboard" 
              active={isActive("/dashboard")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/inventory" 
              icon={<ClipboardList />} 
              label="Inventory" 
              active={isActive("/inventory")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/sales" 
              icon={<DollarSign />} 
              label="Sales" 
              active={isActive("/sales")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/prediction" 
              icon={<BarChart2 />} 
              label="Prediction Models" 
              active={isActive("/prediction")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/crm" 
              icon={<Users />} 
              label="CRM" 
              active={isActive("/crm")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/reports" 
              icon={<FileText />} 
              label="Reports" 
              active={isActive("/reports")}
              collapsed={collapsed}
            />
            
            <div className="border-t border-blue-800 my-6"></div>
            
            <SidebarItem 
              href="/profile" 
              icon={<User />} 
              label="Profile" 
              active={isActive("/profile")} 
              collapsed={collapsed}
            />
            <SidebarItem 
              href="/settings" 
              icon={<Settings />} 
              label="Settings" 
              active={isActive("/settings")} 
              collapsed={collapsed}
            />
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout}
            className="flex items-center text-white opacity-75 hover:opacity-100 w-full"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className={`${collapsed ? "lg:hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
};

function SidebarItem({ href, icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <li className="mb-1">
      <Link href={href}>
        <a className={`flex items-center py-3 px-4 rounded transition-colors
          ${active ? 'bg-blue-800 text-white' : 'hover:bg-blue-700'}`}
        >
          <span className="w-5 h-5 mr-3">{icon}</span>
          <span className={`${collapsed ? "lg:hidden" : ""}`}>{label}</span>
        </a>
      </Link>
    </li>
  );
}
