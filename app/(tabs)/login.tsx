import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LoginRedirect() {
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;

  return (
    <Redirect
      href={{
        pathname: '/signin',
        params: redirectTo ? { redirectTo } : undefined,
      }}
    />
  );
}
