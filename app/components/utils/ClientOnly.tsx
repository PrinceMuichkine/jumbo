import React, { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders its children only on the client-side,
 * with an optional fallback for server-side rendering.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children()}</>;
}
