'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
      onError?.(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            {currency.toUpperCase()} {amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay {currency.toUpperCase()} {amount.toFixed(2)}</>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
}
