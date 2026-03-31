import React, { useEffect } from 'react';
import LookupScreen from '@/components/LookupScreen';
import { initializeSampleData } from '@/src/database/sampleData';

export default function HomeScreen() {
  useEffect(() => {
    // Initialize sample data on app start
    initializeSampleData();
  }, []);

  return <LookupScreen />;
}
