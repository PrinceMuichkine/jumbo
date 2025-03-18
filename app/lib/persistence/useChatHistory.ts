import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '@/lib/stores/workbench';
import { getMessages, getNextId, getUrlId, openDatabase, setMessages } from './db';

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

export const db = persistenceEnabled ? await openDatabase() : undefined;

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);

export function useChatHistory() {
  const navigate = useNavigate();
  const params = useParams();
  const mixedId = params.id;

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  useEffect(() => {
    if (!db) {
      setReady(true);

      if (persistenceEnabled) {
        toast.error(`Chat persistence is unavailable`);
      }

      return;
    }

    if (mixedId) {
      getMessages(db, mixedId)
        .then((storedMessages) => {
          if (storedMessages && storedMessages.messages.length > 0) {
            setInitialMessages(storedMessages.messages);
            setUrlId(storedMessages.urlId);
            description.set(storedMessages.description);
            chatId.set(storedMessages.id);
          } else {
            navigate(`/`, { replace: true });
          }

          setReady(true);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } else {
      setReady(true);
    }
  }, [mixedId, navigate]);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory: async (messages: Message[]) => {
      if (!db || messages.length === 0) {
        return;
      }

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        const urlId = await getUrlId(db, firstArtifact.id);

        navigateChat(urlId);
        setUrlId(urlId);
      }

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      if (initialMessages.length === 0 && !chatId.get()) {
        const nextId = await getNextId(db);

        chatId.set(nextId);

        if (!urlId) {
          navigateChat(nextId);
        }
      }

      await setMessages(db, chatId.get() as string, messages, urlId, description.get());
    },
  };
}

/**
 * Updates the URL without triggering a re-render of the Chat component
 */
function navigateChat(nextId: string) {
  // Using the history API directly to avoid triggering re-renders
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}
