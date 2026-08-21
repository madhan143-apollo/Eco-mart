import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import EcoMartLogo from '../../../components/common/EcoMartLogo';
import MapView from '../../../components/common/MapView';
import { Truck, CheckCircle2, Navigation, LogOut, Phone, MapPin, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export const DriverDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { orders, driverAcceptTrip, driverUpdateTripStatus } = useData();

  const driverId = currentUser?.driverId || currentUser?.transportId || 'DRV001';

  const myTrips = (orders || []).filter(o => 
    o.driverId === driverId || o.vehicleNumber === currentUser?.assignedVehicleNumber || o.id === 'ORD-9081'
  );

  const activeTrip = myTrips[0];

  const statusWorkflow = [
    { label: 'Start Pickup (En Route)', nextStatus: 'EN_ROUTE_TO_PICKUP' },
    { label: 'Arrived at Pickup', nextStatus: 'ARRIVED_AT_PICKUP' },
    { label: 'Pickup Completed', nextStatus: 'PICKUP_COMPLETED' },
    { label: 'Start Delivery (In Transit)', nextStatus: 'IN_TRANSIT' },
    { label: 'Arrived at Destination', nextStatus: 'ARRIVED_AT_DESTINATION' },
    { label: 'Mark Delivered & Complete', nextStatus: 'COMPLETED' }
  ];

  const mapMarkers = activeTrip ? [
    {
      id: 'pickup',
      lat: activeTrip.pickupCoordinates[0],
      lng: activeTrip.pickupCoordinates[1],
      title: `Pickup: ${activeTrip.sellerName}`,
      location: activeTrip.sellerAddress,
      type: 'seller',
      typeLabel: 'Pickup Location'
    },
    {
      id: 'delivery',
      lat: activeTrip.deliveryCoordinates[0],
      lng: activeTrip.deliveryCoordinates[1],
      title: `Delivery: ${activeTrip.buyerName}`,
      location: activeTrip.buyerAddress,
      type: 'buyer',
      typeLabel: 'Destination'
    },
    {
      id: 'truck',
      lat: activeTrip.currentTransportCoordinates[0],
      lng: activeTrip.currentTransportCoordinates[1],
      title: `My Truck: ${currentUser?.assignedVehicleNumber || activeTrip.vehicleNumber || 'TN 01 AB 1234'}`,
      location: `Driver: ${currentUser?.name || 'Ramesh Kumar'}`,
      type: 'transport',
      typeLabel: 'My Vehicle GPS'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <EcoMartLogo size="sm" showTagline={false} />
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md uppercase">
            Driver Portal
          </span>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Driver</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Driver & Vehicle Identity Badge */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-6 rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-cyan-500/30 uppercase">
                {driverId}
              </span>
              <h2 className="text-xl font-extrabold text-white">{currentUser?.name || 'Ramesh Kumar'}</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">Company: <span className="font-bold text-white">{currentUser?.companyName || 'GreenRoute Logistics Pvt Ltd'}</span></p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Truck</p>
            <p className="text-sm font-extrabold text-cyan-300">{currentUser?.assignedVehicleNumber || activeTrip?.vehicleNumber || 'TN 01 AB 1234 (Demo)'}</p>
          </div>
        </div>

        {/* Current Trip Control Card */}
        {activeTrip ? (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Trip ID</span>
                <h3 className="text-lg font-extrabold text-cyan-400 font-mono">{activeTrip.id}</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-xs rounded-full border border-emerald-500/30 uppercase">
                {activeTrip.transportRequestStatus || activeTrip.status}
              </span>
            </div>

            {/* Accept Trip Banner */}
            {activeTrip.transportRequestStatus === 'DRIVER_ASSIGNED' && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-200">New Trip Assigned by Transport Manager!</p>
                  <p className="text-[11px] text-slate-300">Accept this trip assignment to begin pickup logistics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => driverAcceptTrip(activeTrip.id)}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>ACCEPT TRIP</span>
                </button>
              </div>
            )}

            {/* Trip Address Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup Location (Seller)</p>
                <p className="font-bold text-white text-sm">{activeTrip.sellerName}</p>
                <p className="text-slate-400">{activeTrip.sellerAddress}</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Destination (Buyer Delivery)</p>
                <p className="font-bold text-white text-sm">{activeTrip.buyerName}</p>
                <p className="text-slate-400">{activeTrip.buyerAddress}</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Recyclable Material</p>
                <p className="font-bold text-cyan-300 text-sm">{activeTrip.productTitle} ({activeTrip.quantityKg} kg)</p>
              </div>
            </div>

            {/* Driver Workflow Action Buttons */}
            <div className="pt-2 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advance Trip Lifecycle</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {statusWorkflow.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => driverUpdateTripStatus(activeTrip.id, action.nextStatus)}
                    className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer hover:border-cyan-500/50"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* OpenStreetMap Driver GPS Route */}
            <div className="pt-3">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Live Route GPS Navigation</p>
              <MapView markers={mapMarkers} height="320px" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-12 rounded-3xl text-center text-slate-400">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-white">No Active Trip Assigned</p>
            <p className="text-xs text-slate-400 mt-1">Waiting for Transport Manager to dispatch a new order.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;
