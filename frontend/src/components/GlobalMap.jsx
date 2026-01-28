import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { getProfiles } from '../services/api';
import { getCityCoordinates } from '../lib/cityCoordinates';
import LoadingSpinner from './LoadingSpinner';
import MapLockedState from './MapLockedState';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Placeholder avatar as data URI to avoid 404 requests
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='50' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E";

const ProfileMarker = ({ profile, position }) => {
    const coordinates = position || getCityCoordinates(profile.current_city, profile.current_country);
    const profileImg = profile.profile_image || PLACEHOLDER_AVATAR;

    const avatarIcon = L.divIcon({
        className: 'custom-avatar-marker',
        html: `<div style="position: relative;"><div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid #7c3aed; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><img src="${profileImg}" alt="${profile.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${PLACEHOLDER_AVATAR}'" /></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });

    return (
        <Marker position={coordinates} icon={avatarIcon}>
            <Popup>
                <Link to={`/profiles/${profile.id}`} className="block">
                    <div className="text-center p-2" style={{ minWidth: '150px' }}>
                        <img src={profileImg} alt={profile.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" onError={(e) => e.target.src = PLACEHOLDER_AVATAR} />
                        <h3 className="font-bold text-gray-900">{profile.name}</h3>
                        {profile.age && <p className="text-sm text-gray-600">{profile.age} years old</p>}
                        <p className="text-xs text-gray-500 mt-1">{profile.current_city}, {profile.current_country === 'GB' ? 'UK' : profile.current_country}</p>
                        <button className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700">View Profile</button>
                    </div>
                </Link>
            </Popup>
        </Marker>
    );
};


const ClusterMarker = ({ profiles, position }) => {
    const map = useMap();
    const count = profiles.length;
    const clusterIcon = L.divIcon({
        className: '',
        html: `<div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border: 4px solid white; box-shadow: 0 3px 12px rgba(124, 58, 237, 0.5); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 16px; cursor: pointer;">${count}+</div>`,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25],
    });


    return (
        <Marker position={position} icon={clusterIcon} eventHandlers={{ click: () => map.setView(position, 6, { animate: true }) }}>
            <Popup>
                <div className="text-center p-2">
                    <p className="font-bold text-gray-900">{count} profiles in this location</p>
                    <p className="text-xs text-gray-600 mt-1">Click to zoom in and see them</p>
                </div>
            </Popup>
        </Marker>
    );
};

const ZoomTracker = ({ setZoom }) => {
    const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
    useEffect(() => { setZoom(map.getZoom()); }, [map, setZoom]);
    return null;
};

const FitBounds = ({ profiles }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || profiles.length === 0) return;
        const bounds = profiles.map(p => p.displayPosition || getCityCoordinates(p.current_city, p.current_country));
        if (bounds.length > 0) {
            const timer = setTimeout(() => {
                try {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4, animate: true, duration: 1 });
                } catch (e) {
                    console.warn("Map fitBounds error:", e);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [profiles, map]);
    return null;
};

const processProfilesForMap = (profiles) => {
    const locationGroups = {};
    profiles.forEach(p => {
        const coords = getCityCoordinates(p.current_city, p.current_country);
        const key = `${coords[0]},${coords[1]}`;
        if (!locationGroups[key]) locationGroups[key] = [];
        locationGroups[key].push(p);
    });

    const processedProfiles = [];
    Object.entries(locationGroups).forEach(([key, group]) => {
        const baseCoords = getCityCoordinates(group[0].current_city, group[0].current_country);
        if (group.length === 1) {
            processedProfiles.push({ ...group[0], displayPosition: baseCoords, basePosition: baseCoords, locationKey: key });
        } else {
            group.forEach((profile, index) => {
                const angle = (index / group.length) * Math.PI * 2;
                const radius = 0.15;
                processedProfiles.push({
                    ...profile,
                    displayPosition: [baseCoords[0] + (Math.cos(angle) * radius), baseCoords[1] + (Math.sin(angle) * radius)],
                    basePosition: baseCoords,
                    locationKey: key
                });
            });
        }
    });
    return processedProfiles;
};

const GlobalMap = ({ onProfilesLoaded }) => {
    const [mapProfiles, setMapProfiles] = useState([]);
    const [zoom, setZoom] = useState(2);
    const ZOOM_THRESHOLD = 5;

    const {
        data: mapData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['mapProfiles'],
        queryFn: async () => {
            const response = await getProfiles({ show_on_map: true });
            const profilesData = response.results || response;
            const profilesWithLocation = profilesData.filter(p => p.current_city || p.current_country);
            const processed = processProfilesForMap(profilesWithLocation);
            return {
                processedProfiles: processed,
                profileCount: profilesWithLocation.length,
            };
        },
        staleTime: 1000 * 60 * 5, // cache map data for 5 minutes
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (mapData) {
            setMapProfiles(mapData.processedProfiles);
            if (onProfilesLoaded) onProfilesLoaded(mapData.profileCount);
        }
    }, [mapData, onProfilesLoaded]);

    const getLocationGroups = () => {
        const groups = {};
        mapProfiles.forEach(profile => {
            const key = profile.locationKey;
            const basePos = profile.basePosition;
            if (!groups[key]) groups[key] = { position: basePos, profiles: [] };
            groups[key].profiles.push(profile);
        });
        return Object.values(groups);
    };

    if (isLoading) return <div className="w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center"><LoadingSpinner message="Loading global map..." /></div>;

    // Handle 403 Forbidden Error (Guest View)
    if (isError && (error?.response?.status === 403 || error?.status === 403)) {
        return <MapLockedState />;
    }

    if (isError) return <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center"><p className="text-gray-600 dark:text-gray-400">{error?.message || 'Failed to load map'}</p></div>;

    const locationGroups = getLocationGroups();

    return (
        <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} attributionControl={false}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <ZoomTracker setZoom={setZoom} />
                {zoom < ZOOM_THRESHOLD ? (
                    locationGroups.map((group, idx) => group.profiles.length > 1 ? <ClusterMarker key={`cluster-${idx}`} profiles={group.profiles} position={group.position} /> : <ProfileMarker key={group.profiles[0].id} profile={group.profiles[0]} position={group.position} />)
                ) : (
                    mapProfiles.map((profile) => <ProfileMarker key={profile.id} profile={profile} position={profile.displayPosition} />)
                )}
                <FitBounds profiles={mapProfiles} />
            </MapContainer>
        </div>
    );
};

export default GlobalMap;
