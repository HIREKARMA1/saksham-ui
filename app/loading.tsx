import React from 'react';
import { Loader } from '@/components/ui/loader';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <Loader className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Loading Saksham...
        </p>
      </div>
    </div>
  );
}

