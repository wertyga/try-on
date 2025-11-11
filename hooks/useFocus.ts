import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const useFocus = (callback: () => void, deps?: any[]) => {
  useFocusEffect(useCallback(callback, deps || []));
};
