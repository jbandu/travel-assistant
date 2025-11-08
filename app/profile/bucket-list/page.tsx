/**
 * Bucket List Board Page
 * Pinterest-style board of dream destinations
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BucketListCard from '@/components/profile/BucketListCard';
import Link from 'next/link';

interface BucketListItem {
  id: string;
  destination: string;
  country: string;
  region: string | null;
  priority: string;
  timeframe: string | null;
  estimatedBudget: number | null;
  currency: string;
  companions: string[];
  experiences: string[];
  notes: string | null;
  inspiration: string[];
  status: string;
  position: number;
}

export default function BucketListPage() {
  const { user, loading: authLoading } = useAuth();
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    region: '',
    priority: 'someday',
    timeframe: '',
    estimatedBudget: '',
    currency: 'USD',
    companions: [] as string[],
    companionInput: '',
    experiences: [] as string[],
    experienceInput: '',
    notes: '',
    inspiration: [] as string[],
    inspirationInput: '',
    status: 'wishlist'
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchBucketList();
    }
  }, [authLoading, user]);

  const fetchBucketList = async () => {
    try {
      const response = await fetch('/api/bucket-list');
      if (response.ok) {
        const data = await response.json();
        setBucketList(data.bucketList);
      }
    } catch (error) {
      console.error('Error fetching bucket list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setFormData({
      destination: item.destination,
      country: item.country,
      region: item.region || '',
      priority: item.priority,
      timeframe: item.timeframe || '',
      estimatedBudget: item.estimatedBudget?.toString() || '',
      currency: item.currency,
      companions: item.companions || [],
      companionInput: '',
      experiences: item.experiences || [],
      experienceInput: '',
      notes: item.notes || '',
      inspiration: item.inspiration || [],
      inspirationInput: '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bucket-list/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBucketList(bucketList.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting bucket list item:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const item = bucketList.find(i => i.id === id);
      if (!item) return;

      const response = await fetch(`/api/bucket-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setBucketList(bucketList.map(i => i.id === id ? data.bucketListItem : i));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/bucket-list/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, direction })
      });

      if (response.ok) {
        // Refresh the list to get updated positions
        await fetchBucketList();
      }
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `/api/bucket-list/${editingItem.id}`
        : '/api/bucket-list';

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.destination,
          country: formData.country,
          region: formData.region || null,
          priority: formData.priority,
          timeframe: formData.timeframe || null,
          estimatedBudget: formData.estimatedBudget || null,
          currency: formData.currency,
          companions: formData.companions,
          experiences: formData.experiences,
          notes: formData.notes || null,
          inspiration: formData.inspiration,
          status: formData.status
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (editingItem) {
          setBucketList(bucketList.map(item =>
            item.id === editingItem.id ? data.bucketListItem : item
          ));
        } else {
          setBucketList([...bucketList, data.bucketListItem]);
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error saving bucket list item:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      destination: '',
      country: '',
      region: '',
      priority: 'someday',
      timeframe: '',
      estimatedBudget: '',
      currency: 'USD',
      companions: [],
      companionInput: '',
      experiences: [],
      experienceInput: '',
      notes: '',
      inspiration: [],
      inspirationInput: '',
      status: 'wishlist'
    });
  };

  const addArrayItem = (field: 'companions' | 'experiences' | 'inspiration', inputField: string) => {
    const value = formData[inputField as keyof typeof formData] as string;
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
        [inputField]: ''
      });
    }
  };

  const removeArrayItem = (field: 'companions' | 'experiences' | 'inspiration', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const filteredBucketList = bucketList.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bucket list...</p>
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
                Travel Bucket List
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Dream destinations and future adventures
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

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Add Button */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Destination
            </button>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="must-do">Must Do</option>
                <option value="someday">Someday</option>
                <option value="dream">Dream</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="wishlist">Wishlist</option>
                <option value="researching">Researching</option>
                <option value="planning">Planning</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bucket List Grid */}
        {filteredBucketList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {bucketList.length === 0 ? 'No destinations yet' : 'No destinations match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {bucketList.length === 0
                ? 'Start adding dream destinations to your travel bucket list'
                : 'Try adjusting your filters to see more destinations'}
            </p>
            {bucketList.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Destination
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBucketList.map((item, index) => (
              <BucketListCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onReorder={handleReorder}
                isFirst={index === 0}
                isLast={index === filteredBucketList.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Destination' : 'Add Destination'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Destination & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g., Kyoto"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., Japan"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Region, Priority, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g., Kansai"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="must-do">Must Do</option>
                    <option value="someday">Someday</option>
                    <option value="dream">Dream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="researching">Researching</option>
                    <option value="planning">Planning</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Timeframe & Budget */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option value="this-year">This Year</option>
                    <option value="5-years">Next 5 Years</option>
                    <option value="10-years">Next 10 Years</option>
                    <option value="retirement">Retirement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Budget
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              {/* Experiences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experiences I Want
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.experienceInput}
                    onChange={(e) => setFormData({ ...formData, experienceInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('experiences', 'experienceInput'))}
                    placeholder="e.g., Visit ancient temples"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('experiences', 'experienceInput')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.experiences.map((exp, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {exp}
                      <button type="button" onClick={() => removeArrayItem('experiences', idx)} className="hover:text-blue-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Why do you want to visit? What makes it special?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Inspiration Sources */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspiration
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.inspirationInput}
                    onChange={(e) => setFormData({ ...formData, inspirationInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('inspiration', 'inspirationInput'))}
                    placeholder="e.g., Lost in Translation movie"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('inspiration', 'inspirationInput')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.inspiration.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-700 dark:text-gray-300">• {source}</span>
                      <button type="button" onClick={() => removeArrayItem('inspiration', idx)} className="text-red-600 hover:text-red-700">Remove</button>
                    </div>
                  ))}
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
                  {editingItem ? 'Update' : 'Add'} Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
