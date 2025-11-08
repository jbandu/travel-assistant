/**
 * Profile Edit Page
 * Comprehensive form for editing all profile sections
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import InterestPicker from '@/components/profile/InterestPicker';
import ProfileProgress from '@/components/profile/ProfileProgress';
import Link from 'next/link';

type Section = 'personal' | 'travel-style' | 'dietary' | 'accessibility' | 'travel-docs';

function ProfileEditContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialSection = (searchParams?.get('section') as Section) || 'personal';

  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form data
  const [personalInfo, setPersonalInfo] = useState<any>({});
  const [travelStyle, setTravelStyle] = useState<any>({});
  const [dietary, setDietary] = useState<any>({});
  const [accessibility, setAccessibility] = useState<any>({});
  const [travelDocs, setTravelDocs] = useState<any>({});
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [authLoading, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileData(data);

      // Populate form data
      setUserData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || ''
      });

      setPersonalInfo(data.profile?.personalInfo || {
        middleName: '',
        preferredName: '',
        dateOfBirth: null,
        gender: '',
        occupation: '',
        industry: '',
        city: '',
        state: '',
        country: '',
        timezone: '',
        languages: [],
        culturalBg: ''
      });

      setTravelStyle(data.profile?.travelStyle || {
        budgetLevel: '',
        pacePreference: '',
        activityLevel: '',
        planningStyle: '',
        accommodationPrefs: [],
        transportPrefs: [],
        interests: [],
        preferredCabinClass: '',
        seatPreference: '',
        preferredAirlines: []
      });

      setDietary(data.profile?.dietary || {
        restrictions: [],
        allergies: [],
        favoriteCuisines: [],
        adventurousScore: 5,
        specificDislikes: []
      });

      setAccessibility(data.profile?.accessibility || {
        physicalLimitations: [],
        accessibilityNeeds: [],
        medicalNotes: '',
        fitnessLevel: ''
      });

      setTravelDocs(data.profile?.travelDocs || {
        passportNumber: '',
        passportExpiry: null,
        passportCountry: '',
        visaHistory: [],
        loyaltyPrograms: [],
        travelBenefits: []
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: string, data: any) => {
    try {
      setSaving(true);
      setSaveMessage(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data })
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const result = await response.json();
      setSaveMessage('✓ Saved successfully!');

      // Update profile completion
      if (profileData) {
        setProfileData({
          ...profileData,
          completion: result.completion
        });
      }

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (err) {
      setSaveMessage('✗ Failed to save. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    switch (activeSection) {
      case 'personal':
        Promise.all([
          saveSection('user', userData),
          saveSection('personalInfo', personalInfo)
        ]);
        break;
      case 'travel-style':
        saveSection('travelStyle', travelStyle);
        break;
      case 'dietary':
        saveSection('dietary', dietary);
        break;
      case 'accessibility':
        saveSection('accessibility', accessibility);
        break;
      case 'travel-docs':
        saveSection('travelDocs', travelDocs);
        break;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'travel-style', name: 'Travel Style', icon: '✈️' },
    { id: 'dietary', name: 'Dietary', icon: '🍽️' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'travel-docs', name: 'Travel Docs', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
            <Link
              href="/profile"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Profile
            </Link>
          </div>

          {/* Progress */}
          {profileData && (
            <ProfileProgress
              completion={profileData.completion}
              streak={profileData.profile?.updateStreak || 0}
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as Section)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeSection === section.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-2xl">{section.icon}</span>
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Personal Info Section */}
              {activeSection === 'personal' && (
                <PersonalInfoForm
                  userData={userData}
                  personalInfo={personalInfo}
                  onUserChange={setUserData}
                  onPersonalChange={setPersonalInfo}
                />
              )}

              {/* Travel Style Section */}
              {activeSection === 'travel-style' && (
                <TravelStyleForm
                  travelStyle={travelStyle}
                  onChange={setTravelStyle}
                />
              )}

              {/* Dietary Section */}
              {activeSection === 'dietary' && (
                <DietaryForm
                  dietary={dietary}
                  onChange={setDietary}
                />
              )}

              {/* Accessibility Section */}
              {activeSection === 'accessibility' && (
                <AccessibilityForm
                  accessibility={accessibility}
                  onChange={setAccessibility}
                />
              )}

              {/* Travel Docs Section */}
              {activeSection === 'travel-docs' && (
                <TravelDocsForm
                  travelDocs={travelDocs}
                  onChange={setTravelDocs}
                />
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {saveMessage && (
                  <span className={`text-sm font-medium ${
                    saveMessage.startsWith('✓')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {saveMessage}
                  </span>
                )}
                <div className="ml-auto">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Info Form Component
function PersonalInfoForm({ userData, personalInfo, onUserChange, onPersonalChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Personal Information</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Tell us about yourself</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={userData.firstName}
            onChange={(e) => onUserChange({ ...userData, firstName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={userData.lastName}
            onChange={(e) => onUserChange({ ...userData, lastName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, dateOfBirth: e.target.value ? new Date(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender
          </label>
          <select
            value={personalInfo.gender || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, gender: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Occupation & Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Occupation
          </label>
          <input
            type="text"
            value={personalInfo.occupation || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, occupation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry
          </label>
          <input
            type="text"
            value={personalInfo.industry || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, industry: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Technology"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={personalInfo.city || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, city: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="San Francisco"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State/Province
          </label>
          <input
            type="text"
            value={personalInfo.state || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, state: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="California"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            value={personalInfo.country || ''}
            onChange={(e) => onPersonalChange({ ...personalInfo, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="USA"
          />
        </div>
      </div>
    </div>
  );
}

// Travel Style Form Component
function TravelStyleForm({ travelStyle, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Travel Style</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">How do you like to travel?</p>
      </div>

      {/* Budget & Pace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Level
          </label>
          <select
            value={travelStyle.budgetLevel || ''}
            onChange={(e) => onChange({ ...travelStyle, budgetLevel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="budget">Budget (Hostels, local transport)</option>
            <option value="mid-range">Mid-range (3-4★ hotels)</option>
            <option value="luxury">Luxury (5★ hotels, premium)</option>
            <option value="ultra-luxury">Ultra-luxury (Private, bespoke)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Travel Pace
          </label>
          <select
            value={travelStyle.pacePreference || ''}
            onChange={(e) => onChange({ ...travelStyle, pacePreference: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="slow">Slow (1-2 places, deep dive)</option>
            <option value="moderate">Moderate (Balanced schedule)</option>
            <option value="fast">Fast (Multiple destinations)</option>
            <option value="jam-packed">Jam-packed (Non-stop action)</option>
          </select>
        </div>
      </div>

      {/* Activity Level & Planning Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Activity Level
          </label>
          <select
            value={travelStyle.activityLevel || ''}
            onChange={(e) => onChange({ ...travelStyle, activityLevel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="relaxed">Relaxed (Beach, spa, leisure)</option>
            <option value="moderate">Moderate (Balanced activities)</option>
            <option value="active">Active (Hiking, sports)</option>
            <option value="extreme">Extreme (Adventure sports)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Planning Style
          </label>
          <select
            value={travelStyle.planningStyle || ''}
            onChange={(e) => onChange({ ...travelStyle, planningStyle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="spontaneous">Spontaneous (Go with flow)</option>
            <option value="flexible">Flexible (Loose plan)</option>
            <option value="detailed">Detailed (Planned schedule)</option>
            <option value="rigid">Rigid (Every minute planned)</option>
          </select>
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Travel Interests
        </label>
        <InterestPicker
          selectedInterests={travelStyle.interests || []}
          onChange={(interests) => onChange({ ...travelStyle, interests })}
        />
      </div>
    </div>
  );
}

// Dietary Form Component
function DietaryForm({ dietary, onChange }: any) {
  const cuisines = ['Italian', 'Japanese', 'Mexican', 'Thai', 'Indian', 'French', 'Chinese', 'Mediterranean', 'Vietnamese', 'Korean'];
  const restrictions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal', 'Kosher', 'Pescatarian'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Dietary Preferences</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Food preferences and restrictions</p>
      </div>

      {/* Favorite Cuisines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Favorite Cuisines
        </label>
        <div className="flex flex-wrap gap-2">
          {cuisines.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => {
                const current = dietary.favoriteCuisines || [];
                if (current.includes(cuisine)) {
                  onChange({ ...dietary, favoriteCuisines: current.filter((c: string) => c !== cuisine) });
                } else {
                  onChange({ ...dietary, favoriteCuisines: [...current, cuisine] });
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (dietary.favoriteCuisines || []).includes(cuisine)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Dietary Restrictions
        </label>
        <div className="flex flex-wrap gap-2">
          {restrictions.map(restriction => (
            <button
              key={restriction}
              onClick={() => {
                const current = dietary.restrictions || [];
                if (current.includes(restriction)) {
                  onChange({ ...dietary, restrictions: current.filter((r: string) => r !== restriction) });
                } else {
                  onChange({ ...dietary, restrictions: [...current, restriction] });
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (dietary.restrictions || []).includes(restriction)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>

      {/* Adventurous Score */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Food Adventurousness: {dietary.adventurousScore || 5}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={dietary.adventurousScore || 5}
          onChange={(e) => onChange({ ...dietary, adventurousScore: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Stick to familiar</span>
          <span>Try anything once!</span>
        </div>
      </div>
    </div>
  );
}

// Accessibility Form Component
function AccessibilityForm({ accessibility, onChange }: any) {
  const fitnessLevels = [
    { value: 'low', label: 'Low', desc: 'Prefer minimal walking' },
    { value: 'moderate', label: 'Moderate', desc: 'Can handle some activity' },
    { value: 'high', label: 'High', desc: 'Very active' },
    { value: 'athlete', label: 'Athlete', desc: 'Extreme activities' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Accessibility & Health</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Help us plan suitable activities</p>
      </div>

      {/* Fitness Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Fitness Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fitnessLevels.map(level => (
            <button
              key={level.value}
              onClick={() => onChange({ ...accessibility, fitnessLevel: level.value })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                accessibility.fitnessLevel === level.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{level.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Medical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Medical Notes (Optional)
        </label>
        <textarea
          value={accessibility.medicalNotes || ''}
          onChange={(e) => onChange({ ...accessibility, medicalNotes: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Any health considerations we should know about..."
        ></textarea>
      </div>
    </div>
  );
}

// Travel Docs Form Component
function TravelDocsForm({ travelDocs, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Travel Documents</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Passport and travel benefits</p>
      </div>

      {/* Passport Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Passport Country
          </label>
          <input
            type="text"
            value={travelDocs.passportCountry || ''}
            onChange={(e) => onChange({ ...travelDocs, passportCountry: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="USA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Passport Expiry Date
          </label>
          <input
            type="date"
            value={travelDocs.passportExpiry ? new Date(travelDocs.passportExpiry).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange({ ...travelDocs, passportExpiry: e.target.value ? new Date(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          🔒 Your passport information is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileEditContent />
    </Suspense>
  );
}
