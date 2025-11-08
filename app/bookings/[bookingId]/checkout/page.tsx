'use client';

import { useState, useEffect, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plane, Hotel, Car, MapPin, Calendar, DollarSign } from 'lucide-react';
import CheckoutForm from '@/components/payments/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  supplierName: string | null;
  bookingDetails: any;
}

export default function CheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingAndCreateIntent();
  }, [bookingId]);

  const fetchBookingAndCreateIntent = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch booking details
      const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
      if (!bookingResponse.ok) {
        throw new Error('Failed to fetch booking');
      }
      const bookingData = await bookingResponse.json();
      setBooking(bookingData.booking);

      // Check if already paid
      if (bookingData.booking.paymentStatus === 'paid') {
        router.push(`/bookings/${bookingId}/confirmation`);
        return;
      }

      // Create payment intent
      const intentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const intentData = await intentResponse.json();
      setClientSecret(intentData.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/bookings/${bookingId}/confirmation`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'FLIGHT':
        return <Plane className="w-6 h-6" />;
      case 'HOTEL':
        return <Hotel className="w-6 h-6" />;
      case 'CAR_RENTAL':
        return <Car className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout Error
          </h1>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Link
            href="/trips"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Return to Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/trips/${booking.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Booking
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your booking payment securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Booking Summary
            </h2>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {/* Booking Type */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  {getBookingIcon(booking.bookingType)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Type</p>
                  <p className="font-medium text-gray-900">
                    {booking.bookingType.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Supplier */}
              {booking.supplierName && (
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-900">{booking.supplierName}</p>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Travel Dates</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString()}
                    {booking.endDate && (
                      <> - {new Date(booking.endDate).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {booking.startLocation}
                    {booking.endLocation && <> → {booking.endLocation}</>}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-start gap-2 pt-4 border-t border-gray-200">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.currency} {Number(booking.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    {booking.status}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                    Payment {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>

            <div className="bg-white rounded-lg shadow-md p-6">
              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    amount={Number(booking.totalAmount)}
                    currency={booking.currency}
                    bookingId={booking.id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
