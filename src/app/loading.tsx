import React from 'react';
import { Container } from '@/components/layout/container';

export default function Loading() {
  return (
    <div className="py-12 animate-pulse">
      <Container size="xl">
        <div className="h-8 bg-editorial-surfaceAlt rounded-lg w-48 mb-4" />
        <div className="h-4 bg-editorial-surfaceAlt rounded-md w-96 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-editorial border border-editorial-border bg-white overflow-hidden space-y-4 p-4"
            >
              <div className="aspect-recipe-card bg-editorial-surfaceAlt rounded-lg w-full" />
              <div className="h-5 bg-editorial-surfaceAlt rounded w-3/4" />
              <div className="h-4 bg-editorial-surfaceAlt rounded w-full" />
              <div className="h-4 bg-editorial-surfaceAlt rounded w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
