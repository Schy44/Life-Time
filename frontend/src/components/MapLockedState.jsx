import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapLockedState = () => {
    // Mock positions for "background" profiles to make it look alive
    const mockPositions = [
        [23.8103, 90.4125], [22.3569, 91.7832], [24.3636, 88.6241],
        [19.0760, 72.8777], [28.6139, 77.2090], [51.5074, -0.1278]
    ];

    return (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 group">
            {/* Live Blurred Map Background */}
            <div className="absolute inset-0 z-0 blur-[6px] opacity-60">
                <MapContainer
                    center={[22, 90]}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {mockPositions.map((pos, i) => (
                        <CircleMarker
                            key={i}
                            center={pos}
                            radius={8}
                            pathOptions={{ fillColor: '#7c3aed', color: 'white', weight: 2, fillOpacity: 0.8 }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-50/10 backdrop-blur-[2px]">
                {/* Minimalist LOCKED Badge (Matching User Screenshot) */}
                <div className="bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-6 py-2.5 rounded-full border border-slate-100 mb-8 transform transition-transform group-hover:scale-105 duration-500">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        LOCKED
                    </span>
                </div>

                {/* Refined CTA */}
                <div className="text-center max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Be our premium user to <span className="text-purple-600">Connect</span> with people from around the globe
                    </h3>

                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 active:scale-95"
                        >
                            Join Now
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLockedState;
