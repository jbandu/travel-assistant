'use client';

import { useState, useEffect } from 'react';
import {
  Mic,
  MessageSquare,
  MapPin,
  Heart,
  AlertCircle,
  Sparkles,
  Filter,
  Search,
  Trash2,
  Clock,
  Hotel,
  Utensils,
  Plane,
  Activity,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface TravelNote {
  id: string;
  noteText: string;
  category: string;
  subject: string | null;
  sentiment: string;
  locationName: string | null;
  city: string | null;
  tags: string[];
  isActionable: boolean;
  priority: string;
  parsedData: any;
  createdAt: string;
  reminders: any[];
}

export default function TravelNotesPage() {
  const [notes, setNotes] = useState<TravelNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [creating, setCreating] = useState(false);
  const [contradiction, setContradiction] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [filterCategory, searchQuery]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/travel-notes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteText.trim()) return;

    setCreating(true);
    setContradiction(null);

    try {
      const response = await fetch('/api/travel-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteText,
          inputMethod: 'text',
        }),
      });

      const data = await response.json();

      if (data.requiresConfirmation) {
        // Show contradiction warning
        setContradiction(data.contradictionResult);
        setCreating(false);
        return;
      }

      if (response.ok) {
        setNoteText('');
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOverrideContradiction = async () => {
    if (!contradiction) return;

    setCreating(true);

    try {
      const response = await fetch('/api/travel-notes/override-contradiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteText,
          inputMethod: 'text',
          supersededNoteIds: contradiction.contradictingNotes.map((n: any) => n.id),
        }),
      });

      if (response.ok) {
        setNoteText('');
        setContradiction(null);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error overriding note:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await fetch(`/api/travel-notes/${id}`, { method: 'DELETE' });
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startRecording = () => {
    // Simple voice recording indicator
    // In production, integrate with Web Speech API or similar
    setIsRecording(true);
    alert('Voice recording feature coming soon! For now, type your note.');
    setIsRecording(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hotel':
        return Hotel;
      case 'restaurant':
        return Utensils;
      case 'flight':
      case 'seat':
        return Plane;
      case 'activity':
        return Activity;
      default:
        return MapPin;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Smart Travel Notes</h1>
          </div>
          <p className="text-gray-600">
            Record your travel experiences and get reminded at the right time and place
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Note Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Note</h2>

          <div className="flex gap-4 mb-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Example: The Marriott room 402 was too noisy. Avoid rooms facing the street next time. OR The pad thai at Som Tam Nua is incredible! OR Seat 12A on UA 1234 has great legroom."
              rows={3}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNote}
              disabled={!noteText.trim() || creating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <MessageSquare className="w-5 h-5" />
              {creating ? 'Creating...' : 'Add Note'}
            </button>

            <button
              onClick={startRecording}
              disabled={isRecording}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              <Mic className="w-5 h-5" />
              {isRecording ? 'Recording...' : 'Voice Note'}
            </button>

            <div className="flex-1 text-sm text-gray-500">
              AI will automatically categorize and extract key details from your note
            </div>
          </div>

          {/* Contradiction Warning */}
          {contradiction && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 mb-2">
                    Conflicting Note Detected
                  </p>
                  <p className="text-sm text-yellow-800 mb-3">
                    {contradiction.message}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleOverrideContradiction}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                    >
                      Override Previous Note
                    </button>
                    <button
                      onClick={() => setContradiction(null)}
                      className="px-4 py-2 bg-white border border-yellow-300 text-yellow-900 rounded-lg hover:bg-yellow-50 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="hotel">Hotels</option>
              <option value="restaurant">Restaurants</option>
              <option value="flight">Flights</option>
              <option value="seat">Seats</option>
              <option value="activity">Activities</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No travel notes yet
              </h3>
              <p className="text-gray-600">
                Start recording your travel experiences and get smart reminders!
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const CategoryIcon = getCategoryIcon(note.category);
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <CategoryIcon className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {note.subject && (
                            <h3 className="text-lg font-bold text-gray-900">
                              {note.subject}
                            </h3>
                          )}
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getSentimentColor(
                              note.sentiment
                            )}`}
                          >
                            {note.sentiment}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            {note.category}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{note.noteText}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          {note.locationName && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{note.locationName}</span>
                            </div>
                          )}
                          {note.city && (
                            <div className="flex items-center gap-2">
                              <span>{note.city}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {note.reminders.length > 0 && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Sparkles className="w-4 h-4" />
                              <span>{note.reminders.length} reminder(s)</span>
                            </div>
                          )}
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
