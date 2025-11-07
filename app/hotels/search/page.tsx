'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { HotelOffer } from '@/lib/integrations/amadeus-client';

interface HotelSearchForm {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  roomQuantity: number;
  priceRange: string;
}

export default function HotelSearchPage() {
  const [formData, setFormData] = useState<HotelSearchForm>({
    cityCode: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 2,
    roomQuantity: 1,
    priceRange: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to search hotels');
        setLoading(false);
        return;
      }

      setResults(data);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🏨 Hotel Search
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find the perfect accommodation
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination (City Code)
              </label>
              <input
                type="text"
                name="cityCode"
                value={formData.cityCode}
                onChange={handleInputChange}
                placeholder="NYC"
                maxLength={3}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                3-letter city code (e.g., NYC, LAX, LON, PAR)
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleInputChange}
                  min={formData.checkInDate || format(new Date(), 'yyyy-MM-dd')}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Guests & Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleInputChange}
                  min={1}
                  max={9}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rooms
                </label>
                <input
                  type="number"
                  name="roomQuantity"
                  value={formData.roomQuantity}
                  onChange={handleInputChange}
                  min={1}
                  max={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Searching...' : 'Search Hotels'}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Searching for hotels...
            </p>
          </div>
        )}

        {results && results.results && results.results.length > 0 && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Found {results.count} hotels
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.cityCode.toUpperCase()}
              </p>
            </div>

            <div className="space-y-4">
              {results.results.map((hotel: HotelOffer, index: number) => (
                <HotelCard key={hotel.hotel.hotelId} hotel={hotel} />
              ))}
            </div>
          </div>
        )}

        {results && results.results && results.results.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or dates
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function HotelCard({ hotel }: { hotel: HotelOffer }) {
  const offer = hotel.offers[0];
  const checkIn = new Date(offer.checkInDate);
  const checkOut = new Date(offer.checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const pricePerNight = offer.price.variations?.average?.base ||
    (parseFloat(offer.price.total) / nights).toFixed(2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="md:flex">
        {/* Hotel Image */}
        <div className="md:w-1/3">
          <img
            src={hotel.hotel.media?.[0]?.uri || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
            alt={hotel.hotel.name}
            className="h-48 md:h-full w-full object-cover"
          />
        </div>

        {/* Hotel Details */}
        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {hotel.hotel.name}
                </h3>
                {hotel.hotel.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500 text-sm">
                      {'★'.repeat(Math.floor(parseFloat(hotel.hotel.rating)))}
                      {'☆'.repeat(5 - Math.floor(parseFloat(hotel.hotel.rating)))}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {hotel.hotel.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {hotel.hotel.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {hotel.hotel.description.text}
              </p>
            )}

            {/* Amenities */}
            {hotel.hotel.amenities && hotel.hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {hotel.hotel.amenities.slice(0, 5).map((amenity, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                  >
                    {amenity.replace(/_/g, ' ')}
                  </span>
                ))}
                {hotel.hotel.amenities.length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{hotel.hotel.amenities.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Room Details */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <p>{offer.room.description.text}</p>
              <p className="mt-1">
                {formatDate(checkIn)} - {formatDate(checkOut)} • {nights} night{nights > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${offer.price.total}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  total
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ${pricePerNight}/night
              </p>
              {offer.policies.cancellation && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {offer.policies.cancellation.description.text}
                </p>
              )}
            </div>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
