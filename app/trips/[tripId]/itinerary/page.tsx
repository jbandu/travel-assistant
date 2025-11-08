'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, DollarSign, AlertTriangle, CheckCircle, XCircle, Plane, Hotel, Car, Activity } from 'lucide-react';

interface Booking {
  id: string;
  bookingType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  startLocation: string;
  endLocation: string | null;
  confirmationCode: string | null;
  supplierName: string | null;
  totalAmount: string;
  currency: string;
  flightDetails?: any;
  hotelDetails?: any;
  carDetails?: any;
  activityDetails?: any;
}

interface Trip {
  id: string;
  title: string;
  destinations: any[];
  startDate: string;
  endDate: string;
  budgetAmount: string | null;
  budgetCurrency: string;
  hasConflicts: boolean;
  conflictDetails: ConflictCheck[];
}

interface ConflictCheck {
  type: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  affectedBookings: string[];
  suggestions?: string[];
}

export default function TripItineraryPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);

      // Fetch trip details and bookings in parallel
      const [tripRes, bookingsRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/bookings/trip/${tripId}`)
      ]);

      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrip(tripData.trip);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCanceling(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data
        await fetchTripData();
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCanceling(null);
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'FLIGHT':
        return <Plane className="w-5 h-5" />;
      case 'HOTEL':
        return <Hotel className="w-5 h-5" />;
      case 'CAR_RENTAL':
        return <Car className="w-5 h-5" />;
      case 'ACTIVITY':
        return <Activity className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getBookingColor = (type: string) => {
    switch (type) {
      case 'FLIGHT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HOTEL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CAR_RENTAL':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ACTIVITY':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'INFO':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const totalSpent = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-4">The requested trip could not be found.</p>
          <Link href="/trips" className="text-blue-600 hover:underline">
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/trips/${tripId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                <p className="text-gray-600 mt-1">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
              </div>
            </div>

            {trip.hasConflicts && (
              <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Has Conflicts</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conflict Warnings */}
            {trip.conflictDetails && trip.conflictDetails.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Conflicts & Warnings
                </h2>
                {trip.conflictDetails.map((conflict, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(conflict.severity)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{conflict.message}</h3>
                        {conflict.suggestions && conflict.suggestions.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {conflict.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-center">
                                <span className="mr-2">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings Timeline */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itinerary Timeline</h2>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600 mb-4">Start adding flights, hotels, and activities to your trip.</p>
                  <div className="flex justify-center space-x-3">
                    <Link
                      href="/flights/search"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Search Flights
                    </Link>
                    <Link
                      href="/hotels/search"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Search Hotels
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => {
                    const isConflicted = trip.conflictDetails?.some(c =>
                      c.affectedBookings.includes(booking.id)
                    );

                    return (
                      <div
                        key={booking.id}
                        className={`bg-white rounded-lg border-2 p-5 ${
                          booking.status === 'CANCELLED'
                            ? 'opacity-50 border-gray-200'
                            : isConflicted
                            ? 'border-red-300'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`p-3 rounded-lg ${getBookingColor(booking.bookingType)}`}>
                              {getBookingIcon(booking.bookingType)}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {booking.bookingType.replace('_', ' ')}
                                </h3>
                                {booking.status === 'CANCELLED' && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    Cancelled
                                  </span>
                                )}
                                {booking.status === 'MOCK_RESERVED' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                    Reserved
                                  </span>
                                )}
                              </div>

                              {booking.supplierName && (
                                <p className="text-sm text-gray-600 mb-2">{booking.supplierName}</p>
                              )}

                              <div className="space-y-2">
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(booking.startDate)}
                                    {booking.endDate && ` - ${formatDate(booking.endDate)}`}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {booking.startLocation}
                                    {booking.endLocation && ` → ${booking.endLocation}`}
                                  </div>
                                </div>

                                {booking.confirmationCode && (
                                  <p className="text-sm text-gray-500">
                                    Confirmation: <span className="font-mono font-medium">{booking.confirmationCode}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold text-gray-900">
                              ${parseFloat(booking.totalAmount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">{booking.currency}</p>

                            {booking.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={canceling === booking.id}
                                className="mt-3 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                              >
                                {canceling === booking.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            )}
                          </div>
                        </div>

                        {isConflicted && (
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="flex items-center text-sm text-red-700">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              This booking has conflicts. See warnings above.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Budget Summary
              </h3>

              <div className="space-y-3">
                {trip.budgetAmount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium">
                        ${parseFloat(trip.budgetAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className={`font-medium ${
                        totalSpent > parseFloat(trip.budgetAmount) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t">
                      <span className="font-medium">Remaining</span>
                      <span className={`font-semibold ${
                        parseFloat(trip.budgetAmount) - totalSpent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${(parseFloat(trip.budgetAmount) - totalSpent).toFixed(2)}
                      </span>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="pt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            totalSpent > parseFloat(trip.budgetAmount) ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((totalSpent / parseFloat(trip.budgetAmount)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {((totalSpent / parseFloat(trip.budgetAmount)) * 100).toFixed(0)}% of budget used
                      </p>
                    </div>
                  </>
                )}

                {!trip.budgetAmount && (
                  <p className="text-sm text-gray-500">No budget set for this trip</p>
                )}
              </div>
            </div>

            {/* Booking Stats */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Bookings</h3>
              <div className="space-y-2">
                {['FLIGHT', 'HOTEL', 'CAR_RENTAL', 'ACTIVITY'].map(type => {
                  const count = bookings.filter(b => b.bookingType === type && b.status !== 'CANCELLED').length;
                  if (count === 0) return null;

                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${getBookingColor(type)}`}>
                          {getBookingIcon(type)}
                        </div>
                        <span className="text-gray-700">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Add More</h3>
              <div className="space-y-2">
                <Link
                  href="/flights/search"
                  className="block w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center text-sm font-medium"
                >
                  Search Flights
                </Link>
                <Link
                  href="/hotels/search"
                  className="block w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-center text-sm font-medium"
                >
                  Search Hotels
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
