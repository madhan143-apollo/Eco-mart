import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import ManagerSidebar from '../../../components/common/ManagerSidebar';
import Navbar from '../../../components/common/Navbar';
import { Building2, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export const ManagerProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Company Logistics Partner Profile" />

        <main className="p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                {currentUser?.companyName ? currentUser.companyName.charAt(0).toUpperCase() : 'G'}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{currentUser?.companyName || 'GreenRoute Logistics Pvt Ltd'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-cyan-100 text-cyan-800 rounded-full uppercase">
                    Verified ECO MART Partner
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Agreement Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Contact Manager</label>
                  <p className="font-extrabold text-slate-900 text-sm">{currentUser?.name || 'Santhosh Kumar'}</p>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Official Email</label>
                  <p className="font-bold text-slate-800 text-sm">{currentUser?.email || 'contact@greenroute.in'}</p>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Phone Number (+91)</label>
                  <p className="font-bold text-slate-800 text-sm">{currentUser?.phone || '+91 98401 11223'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Headquarters Location</label>
                  <p className="font-bold text-slate-900 text-sm">{currentUser?.city || 'Chennai'}, {currentUser?.state || 'Tamil Nadu'}</p>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Transport Company ID</label>
                  <p className="font-mono font-bold text-cyan-700 text-sm">{currentUser?.transportCompanyId || 'comp-greenroute'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
