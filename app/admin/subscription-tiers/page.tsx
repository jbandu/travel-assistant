'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface SubscriptionTier {
  id: string;
  tierCode: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number | null;
  maxTrips: number | null;
  maxAIMessages: number | null;
  maxPriceAlerts: number | null;
  maxFlightBookings: number | null;
  maxHotelBookings: number | null;
  maxBucketList: number | null;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasCalendarSync: boolean;
  hasPDFExport: boolean;
  hasConcierge: boolean;
  hasFamilyAccount: boolean;
  has24x7Support: boolean;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  features: any;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubscriptionTiersPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/admin/subscription-tiers');
      if (response.status === 403) {
        setError('Unauthorized: Admin access required');
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch tiers');

      const data = await response.json();
      setTiers(data.tiers || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleCreateTier = () => {
    setShowCreateForm(true);
    setEditingTier({
      id: 'new',
      tierCode: '',
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: 'usd',
      trialDays: null,
      maxTrips: null,
      maxAIMessages: null,
      maxPriceAlerts: null,
      maxFlightBookings: null,
      maxHotelBookings: null,
      maxBucketList: null,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
      hasCalendarSync: false,
      hasPDFExport: false,
      hasConcierge: false,
      hasFamilyAccount: false,
      has24x7Support: false,
      isActive: true,
      isPopular: false,
      displayOrder: tiers.length,
      features: [],
      stripeProductId: null,
      stripeMonthlyPriceId: null,
      stripeYearlyPriceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveTier = async () => {
    if (!editingTier) return;

    setSaving(true);
    setError(null);

    try {
      const isNew = editingTier.id === 'new';
      const url = isNew
        ? '/api/admin/subscription-tiers'
        : `/api/admin/subscription-tiers/${editingTier.id}`;

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTier),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save tier');
      }

      await fetchTiers();
      setEditingTier(null);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tier');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tier: SubscriptionTier) => {
    if (!confirm(`Are you sure you want to delete the "${tier.name}" tier? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscription-tiers/${tier.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tier');
      }

      await fetchTiers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error && !tiers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Subscription Tier Management
                </h1>
              </div>
              <p className="text-gray-600">
                Configure pricing, features, and limits for subscription plans
              </p>
            </div>
            <button
              onClick={handleCreateTier}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create New Tier
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tiers</p>
                <p className="text-2xl font-bold text-gray-900">{tiers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tiers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tiers.filter(t => t.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue Tiers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tiers.filter(t => t.monthlyPrice > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiers List */}
        <div className="space-y-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {editingTier?.id === tier.id ? (
                <EditTierForm
                  tier={editingTier}
                  onChange={setEditingTier}
                  onSave={handleSaveTier}
                  onCancel={() => setEditingTier(null)}
                  saving={saving}
                />
              ) : (
                <TierCard
                  tier={tier}
                  onEdit={() => setEditingTier(tier)}
                  onDelete={() => handleDeleteTier(tier)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && editingTier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Tier</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTier(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <EditTierForm
                  tier={editingTier}
                  onChange={setEditingTier}
                  onSave={handleSaveTier}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setEditingTier(null);
                  }}
                  saving={saving}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tier Card Component
function TierCard({
  tier,
  onEdit,
  onDelete,
}: {
  tier: SubscriptionTier;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
            {tier.isPopular && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                POPULAR
              </span>
            )}
            {!tier.isActive && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                INACTIVE
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{tier.description}</p>
          <p className="text-sm text-gray-500">Code: {tier.tierCode}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Monthly Price</p>
          <p className="text-2xl font-bold text-blue-700">
            ${tier.monthlyPrice.toFixed(2)}
          </p>
          {tier.stripeMonthlyPriceId && (
            <p className="text-xs text-blue-600 mt-1 truncate">
              {tier.stripeMonthlyPriceId}
            </p>
          )}
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">Yearly Price</p>
          <p className="text-2xl font-bold text-purple-700">
            ${tier.yearlyPrice.toFixed(2)}
          </p>
          {tier.stripeYearlyPriceId && (
            <p className="text-xs text-purple-600 mt-1 truncate">
              {tier.stripeYearlyPriceId}
            </p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Trial Period</p>
          <p className="text-2xl font-bold text-green-700">
            {tier.trialDays ? `${tier.trialDays} days` : 'None'}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">Display Order</p>
          <p className="text-2xl font-bold text-orange-700">{tier.displayOrder}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Max Trips:</span>
          <span className="font-semibold">{tier.maxTrips ?? '∞'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Max AI Messages:</span>
          <span className="font-semibold">{tier.maxAIMessages ?? '∞'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Price Alerts:</span>
          <span className="font-semibold">{tier.maxPriceAlerts ?? '∞'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Flight Bookings:</span>
          <span className="font-semibold">{tier.maxFlightBookings ?? '∞'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Hotel Bookings:</span>
          <span className="font-semibold">{tier.maxHotelBookings ?? '∞'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Bucket List:</span>
          <span className="font-semibold">{tier.maxBucketList ?? '∞'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tier.hasAdvancedAnalytics && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Analytics
          </span>
        )}
        {tier.hasPrioritySupport && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Priority Support
          </span>
        )}
        {tier.hasCalendarSync && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            Calendar Sync
          </span>
        )}
        {tier.hasPDFExport && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
            PDF Export
          </span>
        )}
        {tier.hasConcierge && (
          <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
            Concierge
          </span>
        )}
        {tier.hasFamilyAccount && (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
            Family Account
          </span>
        )}
        {tier.has24x7Support && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            24/7 Support
          </span>
        )}
      </div>
    </div>
  );
}

// Edit Tier Form Component
function EditTierForm({
  tier,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  tier: SubscriptionTier;
  onChange: (tier: SubscriptionTier) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6 p-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tier Code *
          </label>
          <input
            type="text"
            value={tier.tierCode}
            onChange={(e) => onChange({ ...tier, tierCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="free, traveler, explorer"
            disabled={tier.id !== 'new'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={tier.name}
            onChange={(e) => onChange({ ...tier, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Traveler Plan"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={tier.description || ''}
          onChange={(e) => onChange({ ...tier, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Best for frequent travelers..."
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={tier.monthlyPrice}
            onChange={(e) =>
              onChange({ ...tier, monthlyPrice: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yearly Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={tier.yearlyPrice}
            onChange={(e) =>
              onChange({ ...tier, yearlyPrice: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trial Days
          </label>
          <input
            type="number"
            min="0"
            value={tier.trialDays || ''}
            onChange={(e) =>
              onChange({
                ...tier,
                trialDays: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      {/* Limits */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Feature Limits (leave empty for unlimited)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Trips</label>
            <input
              type="number"
              min="0"
              value={tier.maxTrips || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxTrips: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max AI Messages</label>
            <input
              type="number"
              min="0"
              value={tier.maxAIMessages || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxAIMessages: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price Alerts</label>
            <input
              type="number"
              min="0"
              value={tier.maxPriceAlerts || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxPriceAlerts: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Flight Bookings</label>
            <input
              type="number"
              min="0"
              value={tier.maxFlightBookings || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxFlightBookings: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Hotel Bookings</label>
            <input
              type="number"
              min="0"
              value={tier.maxHotelBookings || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxHotelBookings: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Bucket List Items</label>
            <input
              type="number"
              min="0"
              value={tier.maxBucketList || ''}
              onChange={(e) =>
                onChange({
                  ...tier,
                  maxBucketList: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="∞"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Premium Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'hasAdvancedAnalytics', label: 'Advanced Analytics' },
            { key: 'hasPrioritySupport', label: 'Priority Support' },
            { key: 'hasCalendarSync', label: 'Calendar Sync' },
            { key: 'hasPDFExport', label: 'PDF Export' },
            { key: 'hasConcierge', label: 'Concierge Service' },
            { key: 'hasFamilyAccount', label: 'Family Account' },
            { key: 'has24x7Support', label: '24/7 Support' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tier[key as keyof SubscriptionTier] as boolean}
                onChange={(e) => onChange({ ...tier, [key]: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Display Settings</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              value={tier.displayOrder}
              onChange={(e) =>
                onChange({ ...tier, displayOrder: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tier.isActive}
              onChange={(e) => onChange({ ...tier, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tier.isPopular}
              onChange={(e) => onChange({ ...tier, isPopular: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !tier.tierCode || !tier.name}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Tier
            </>
          )}
        </button>
      </div>
    </div>
  );
}
