'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CheckCircle, Download, Calendar, Share2, ArrowLeft } from 'lucide-react';

interface Booking {
  id: string;
  bookingType: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string | null;
  startLocation: string;
  endLocation: string | null;
  confirmationCode: string | null;
  supplierName: string | null;
  bookingDetails: any;
}

export default function PaymentConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Generate and download PDF receipt
    alert('Receipt download will be implemented with PDF generation');
  };

  const handleAddToCalendar = () => {
    // TODO: Generate ICS file
    alert('Calendar export will be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Booking not found</p>
          <Link href="/trips" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Trips
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isPaid ? 'Payment Successful!' : 'Booking Confirmed!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isPaid
                ? 'Your booking has been confirmed and payment processed'
                : 'Your booking has been reserved'}
            </p>

            {booking.confirmationCode && (
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
                <p className="text-sm text-gray-600 mb-1">Confirmation Code</p>
                <p className="text-2xl font-mono font-bold text-blue-600">
                  {booking.confirmationCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Booking Type</p>
                <p className="font-medium text-gray-900">
                  {booking.bookingType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">{booking.status}</p>
              </div>
            </div>

            {booking.supplierName && (
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium text-gray-900">{booking.supplierName}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Travel Dates</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {booking.endDate && (
                  <>
                    {' - '}
                    {new Date(booking.endDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">
                {booking.startLocation}
                {booking.endLocation && <> → {booking.endLocation}</>}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.currency} {Number(booking.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>

          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </button>

          <button
            onClick={() => alert('Share functionality coming soon')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>A confirmation email has been sent to your registered email address</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Your booking details are available in your trip itinerary</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>You can manage your booking from your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trips
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
