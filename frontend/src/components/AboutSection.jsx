import React from 'react';
import SectionCard from './SectionCard';
import InfoRow from './InfoRow';
import './Components.css';
import {
  ArrowUpRight,
  Heart,
  Book,
  MapPin,
  Home,
  Flag,
  Martini,
  Cigarette,
  Droplet,
  Plane,
  Users,
  Briefcase as BriefcaseIcon
} from 'lucide-react';

const formatString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const AboutSection = ({ aboutData, onEdit }) => {
  const { about, looking_for, basicInfo, basics, locationResidency, family } = aboutData || {};

  return (
    <div className="space-y-4">
      {/* About Section */}
      {(about || looking_for) && (
        <SectionCard title="About" icon={<Heart className="text-red-500" size={18} />}>
          {onEdit && (
            <button
              onClick={onEdit}
              className="float-right text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Edit
            </button>
          )}
          {about && <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{about}</p>}

          {looking_for && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Looking For</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{looking_for}</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Basic Information */}
      {basicInfo && Object.keys(basicInfo).length > 0 && (
        <SectionCard title="Basic Information" icon={<Heart size={20} className="text-indigo-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {basicInfo.profile_for && <InfoRow label="Profile created by" value={basicInfo.profile_for === 'self' ? 'Self' : `Parent/Relative (${basicInfo.profile_for})`} />}
            {basicInfo.gender && <InfoRow label="Gender" value={formatString(basicInfo.gender)} />}
            {basicInfo.height && <InfoRow label="Height" value={basicInfo.height} />}
            {basicInfo.skin_complexion && <InfoRow label="Skin Complexion" value={formatString(basicInfo.skin_complexion)} />}
            {basicInfo.marital_status && <InfoRow label="Relationship" value={formatString(basicInfo.marital_status)} />}
            {basicInfo.religion && <InfoRow label="Religion" value={formatString(basicInfo.religion)} />}
            {basicInfo.citizenship && <InfoRow label="Citizenship" value={formatString(basicInfo.citizenship)} />}
          </div>
        </SectionCard>
      )}

      {/* Basics (Blood Group, etc.) */}
      {basics && Object.keys(basics).filter(k => basics[k]).length > 0 && (
        <SectionCard title="Basics" icon={<Droplet size={20} className="text-indigo-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {basics.blood_group && <InfoRow label="Blood group" value={basics.blood_group} />}
          </div>
        </SectionCard>
      )}

      {/* Location & Residency */}
      {locationResidency && Object.keys(locationResidency).filter(k => locationResidency[k]).length > 0 && (
        <SectionCard title="Location & Residency" icon={<MapPin size={20} className="text-indigo-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locationResidency.current_city && <InfoRow label="Current city" value={locationResidency.current_city} />}
            {locationResidency.current_country && <InfoRow label="Current country" value={locationResidency.current_country} />}
            {locationResidency.origin_city && <InfoRow label="Origin city" value={locationResidency.origin_city} />}
            {locationResidency.origin_country && <InfoRow label="Origin country" value={locationResidency.origin_country} />}
            {locationResidency.visa_status && <InfoRow label="Visa status" value={formatString(locationResidency.visa_status)} />}
          </div>
        </SectionCard>
      )}

      {/* Family */}
      {family && Object.keys(family).filter(k => family[k]).length > 0 && (
        <SectionCard title="Family" icon={<Users size={20} className="text-indigo-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {family.father_occupation && <InfoRow label="Father's occupation" value={family.father_occupation} />}
            {family.mother_occupation && <InfoRow label="Mother's occupation" value={family.mother_occupation} />}
            {family.siblings && <InfoRow label="Siblings" value={family.siblings} />}
            {family.family_type && <InfoRow label="Family type" value={formatString(family.family_type)} />}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default AboutSection;
