'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest, authService } from '@/services/apiClient';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);

      await authService.verifyEmail(email, otp);
      router.push('/login');

    } catch (err) {
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("unreachable") || err.message.includes("timeout") || err.message.includes("NetworkError"))) {
        router.push('/login');
      } else {
        setError(err.message || 'Email verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">

      {/* Heading */}
      <div className="text-center mb-8">

        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-teal-50 flex items-center justify-center">
          <span className="text-2xl">?</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Verify Your Email
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Enter the 6-digit OTP sent to your email.
        </p>

        {email && (
          <p className="text-teal-600 text-sm font-medium mt-2 break-all">
            {email}
          </p>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form
        onSubmit={handleVerify}
        className="space-y-5"
      >

        {/* OTP */}
        <div>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Enter OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ''))
            }
            placeholder="Enter 6-digit OTP"
            autoFocus
            className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-800 text-center tracking-[0.5em] text-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

        </div>

        {/* Verify */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-sm"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>

      </form>

      {/* Back */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-sm text-teal-600 font-semibold hover:text-teal-700"
        >
          Back to Sign In
        </button>
      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
