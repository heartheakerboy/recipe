'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF7F2] font-sans p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-[#211A16]">Fatal Application Error</h1>
          <p className="text-sm text-[#665952]">
            An unexpected error stopped the application from rendering.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#C85A32] text-white font-semibold rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
