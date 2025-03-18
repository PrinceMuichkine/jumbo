import { useEffect } from 'react';

interface HelmetProps {
  title?: string;
  description?: string;
}

/**
 * A simple component to manage document head metadata
 */
export function Helmet({ title, description }: HelmetProps) {
  useEffect(() => {
    // Update title if provided
    if (title) {
      document.title = title;
    }

    // Update meta description if provided
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');

      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // No cleanup needed - we don't want to reset title during page transitions
    return () => { };
  }, [title, description]);

  // This component doesn't render anything
  return null;
}
