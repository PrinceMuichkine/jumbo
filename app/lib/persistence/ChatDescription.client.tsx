import { useStore } from '@nanostores/react';
import { description } from './useChatHistory';

/**
 * Component to display the current chat description
 * Uses the nanostores atom for real-time updates
 */
export function ChatDescription(): string | undefined {
  return useStore(description);
}
