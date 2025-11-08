/**
 * Travel Companions Management Page
 * Manage family members and frequent travel partners
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CompanionCard from '@/components/profile/CompanionCard';
import Link from 'next/link';

interface Companion {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string | null;
  travelFrequency: string | null;
  decisionInfluence: number;
  preferences: any;
  dietary: any;
  accessibility: any;
}

// Quick add templates
const COMPANION_TEMPLATES = [
  {
    name: 'Spouse/Partner',
    relationship: 'spouse',
    icon: '💑',
    decisionInfluence: 10,
    travelFrequency: 'regular'
  },
  {
    name: 'Child',
    relationship: 'child',
    icon: '👶',
    decisionInfluence: 3,
    travelFrequency: 'regular'
  },
  {
    name: 'Parent',
    relationship: 'parent',
    icon: '👨',
    decisionInfluence: 7,
    travelFrequency: 'occasional'
  },
  {
    name: 'Sibling',
    relationship: 'sibling',
    icon: '👫',
    decisionInfluence: 5,
    travelFrequency: 'occasional'
  },
  {
    name: 'Friend',
    relationship: 'friend',
    icon: '👥',
    decisionInfluence: 5,
    travelFrequency: 'occasional'
  },
  {
    name: 'Colleague',
    relationship: 'colleague',
    icon: '💼',
    decisionInfluence: 4,
    travelFrequency: 'rare'
  }
];

export default function CompanionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
    travelFrequency: '',
    decisionInfluence: 5,
    dietary: {
      restrictions: [],
      allergies: []
    }
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchCompanions();
    }
  }, [authLoading, user]);

  const fetchCompanions = async () => {
    try {
      const response = await fetch('/api/companions');
      if (response.ok) {
        const data = await response.json();
        setCompanions(data.companions);
      }
    } catch (error) {
      console.error('Error fetching companions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromTemplate = (template: typeof COMPANION_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      relationship: template.relationship,
      decisionInfluence: template.decisionInfluence,
      travelFrequency: template.travelFrequency
    });
    setShowTemplates(false);
    setShowModal(true);
  };

  const handleEdit = (companion: Companion) => {
    setEditingCompanion(companion);
    setFormData({
      firstName: companion.firstName,
      lastName: companion.lastName,
      relationship: companion.relationship,
      dateOfBirth: companion.dateOfBirth || '',
      travelFrequency: companion.travelFrequency || '',
      decisionInfluence: companion.decisionInfluence,
      dietary: companion.dietary || { restrictions: [], allergies: [] }
    });
    setShowTemplates(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/companions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCompanions(companions.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting companion:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCompanion
        ? `/api/companions/${editingCompanion.id}`
        : '/api/companions';

      const response = await fetch(url, {
        method: editingCompanion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingCompanion) {
          setCompanions(companions.map(c =>
            c.id === editingCompanion.id ? data.companion : c
          ));
        } else {
          setCompanions([...companions, data.companion]);
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error saving companion:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompanion(null);
    setShowTemplates(true);
    setFormData({
      firstName: '',
      lastName: '',
      relationship: '',
      dateOfBirth: '',
      travelFrequency: '',
      decisionInfluence: 5,
      dietary: { restrictions: [], allergies: [] }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Travel Companions
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage family members and frequent travel partners
              </p>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Companion
          </button>
        </div>

        {/* Companions Grid */}
        {companions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No companions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add family members and friends you travel with to personalize recommendations
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Companion
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map(companion => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingCompanion ? 'Edit Companion' : 'Add Companion'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Templates (only for new companions) */}
            {showTemplates && !editingCompanion && (
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Quick Add
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMPANION_TEMPLATES.map(template => (
                    <button
                      key={template.relationship}
                      onClick={() => handleAddFromTemplate(template)}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center"
                    >
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Relationship & DOB */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship *
                  </label>
                  <select
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option value="spouse">Spouse/Partner</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Travel Frequency & Decision Influence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Travel Frequency
                  </label>
                  <select
                    value={formData.travelFrequency}
                    onChange={(e) => setFormData({ ...formData, travelFrequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option value="regular">Regular</option>
                    <option value="occasional">Occasional</option>
                    <option value="rare">Rare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Decision Influence: {formData.decisionInfluence}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.decisionInfluence}
                    onChange={(e) => setFormData({ ...formData, decisionInfluence: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCompanion ? 'Update' : 'Add'} Companion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
