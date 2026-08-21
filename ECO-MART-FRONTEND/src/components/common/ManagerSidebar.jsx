import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EcoMartLogo from './EcoMartLogo';
import {
  LayoutDashboard,
  Truck,
  Users,
  Package,
  Navigation,
  Clock,
  CheckCircle2,
  BarChart3,
  Building2,
  LogOut
} from 'lucide-react';

export const ManagerSidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/transport/partner/login');
  };

  const menu = [
    { path: '/transport/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transport/manager/fleet', label: 'Fleet Management', icon: Truck },
    { path: '/transport/manager/drivers', label: 'Drivers & Workers', icon: Users },
    { path: '/transport/manager/orders', label: 'Assigned Orders', icon: Package },
    { path: '/transport/manager/tracking', label: 'Route Tracking', icon: Navigation, badge: 'Live GPS' },
    { path: '/transport/manager/pickups', label: 'Pickup Requests', icon: Clock },
    { path: '/transport/manager/deliveries', label: 'Delivery Management', icon: Truck },
    { path: '/transport/manager/trips', label: 'Trip History', icon: CheckCircle2 },
    { path: '/transport/manager/reports', label: 'Reports', icon: BarChart3 },
    { path: '/transport/manager/profile', label: 'Company Profile', icon: Building2 }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20 shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50">
        <EcoMartLogo size="sm" showTagline={true} />
      </div>

      {/* Company Badge Header */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-col gap-1">
        <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Transport Partner Workspace</span>
        <p className="text-xs font-bold text-slate-200 truncate">{currentUser?.companyName || 'GreenRoute Logistics Pvt Ltd'}</p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-slate-950 font-extrabold shadow-md shadow-cyan-950/50'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-400 text-slate-950 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-sm">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name || 'Santhosh Kumar'}</p>
            <p className="text-[10px] text-cyan-400 font-mono truncate">{currentUser?.transportId || currentUser?.driverId || 'TRM001'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout Manager Session</span>
        </button>
      </div>
    </aside>
  );
};

export default ManagerSidebar;
