import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '@/lib/stores/workbench';
import { supabase } from '@/lib/supabase/client';
import { createScopedLogger } from '@/utils/logger';
import type { FileMap } from '@/lib/stores/files';

const logger = createScopedLogger('ChatHistory');

// Extend Message type with iteration metadata
export interface ChatMessage extends Message {
  iteration?: number;
  timestamp?: string;
  workbenchState?: {
    files?: Record<string, { content: string; type: 'file'; isBinary: boolean }>;
    selectedFile?: string;
    previews?: Array<{ port: number; baseUrl: string; title?: string; }>;
  };
}

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: ChatMessage[];
  currentIteration?: number;
  timestamp: string;
}

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);
export const currentIteration = atom<number>(1);

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();

  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  useEffect(() => {
    if (mixedId) {
      getChat(mixedId)
        .then((storedChat) => {
          if (storedChat && storedChat.messages.length > 0) {
            setInitialMessages(storedChat.messages);
            setUrlId(storedChat.urlId);
            description.set(storedChat.description);
            chatId.set(storedChat.id);

            // Set the current iteration from stored chat
            if (storedChat.currentIteration) {
              currentIteration.set(storedChat.currentIteration);
            }
          } else {
            navigate(`/`, { replace: true });
          }

          setReady(true);
        })
        .catch((error) => {
          toast.error(error.message);
          setReady(true);
        });
    } else {
      setReady(true);
    }
  }, [mixedId, navigate]);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory: async (messages: ChatMessage[]) => {
      if (messages.length === 0) {
        return;
      }

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        try {
          const generatedUrlId = await generateUrlId(firstArtifact.id);
          navigateChat(generatedUrlId);
          setUrlId(generatedUrlId);
        } catch (error) {
          toast.error('Failed to generate URL ID');
          logger.error(error);
          return;
        }
      }

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      if (initialMessages.length === 0 && !chatId.get()) {
        try {
          const newId = await generateId();
          chatId.set(newId);

          if (!urlId) {
            navigateChat(newId);
          }
        } catch (error) {
          toast.error('Failed to generate chat ID');
          logger.error(error);
          return;
        }
      }

      // Tag new messages with iteration information and capture workbench state
      const iterationNumber = currentIteration.get();
      const messagesWithIteration = messages.map(msg => {
        if (!msg.iteration) {
          // Capture workbench state for assistant messages
          const workbenchState = msg.role === 'assistant' ? {
            files: captureWorkbenchFiles(),
            selectedFile: workbenchStore.selectedFile.get(),
            previews: workbenchStore.previews.get(),
          } : undefined;

          return {
            ...msg,
            iteration: iterationNumber,
            timestamp: msg.timestamp || new Date().toISOString(),
            workbenchState
          };
        }
        return msg;
      });

      try {
        await storeMessages(
          chatId.get() as string,
          messagesWithIteration,
          urlId,
          description.get(),
          iterationNumber
        );
      } catch (error) {
        toast.error('Failed to save chat');
        logger.error(error);
      }
    },

    // Add function to navigate to a specific iteration
    navigateToIteration: (iteration: number) => {
      currentIteration.set(iteration);
      const filteredMessages = initialMessages.filter(msg => !msg.iteration || msg.iteration <= iteration);

      // Restore workbench state from the last assistant message in this iteration
      const lastAssistantMessage = [...filteredMessages]
        .reverse()
        .find(msg => msg.role === 'assistant' && msg.workbenchState);

      if (lastAssistantMessage?.workbenchState) {
        restoreWorkbenchState(lastAssistantMessage.workbenchState);
      }

      return filteredMessages;
    },

    // Start a new iteration from a previous one
    startNewIteration: () => {
      const nextIteration = currentIteration.get() + 1;
      currentIteration.set(nextIteration);
      return nextIteration;
    }
  };
}

// Helper function to capture current workbench files
function captureWorkbenchFiles() {
  const files = workbenchStore.files.get();
  const result: Record<string, { content: string; type: 'file'; isBinary: boolean }> = {};

  Object.entries(files).forEach(([path, dirent]) => {
    if (dirent?.type === 'file') {
      result[path] = {
        content: dirent.content,
        type: 'file',
        isBinary: dirent.isBinary
      };
    }
  });

  return result;
}

// Helper function to restore workbench state
function restoreWorkbenchState(state: ChatMessage['workbenchState']) {
  if (!state) return;

  // Set view to code if we're restoring files
  if (state.files && Object.keys(state.files).length > 0) {
    workbenchStore.currentView.set('code');
    workbenchStore.setShowWorkbench(true);

    // Create file map in the format expected by setDocuments
    const fileMap: FileMap = {};

    // Add files from the saved state
    Object.entries(state.files).forEach(([path, file]) => {
      fileMap[path] = file;
    });

    // Set documents (which will load them into the editor)
    workbenchStore.setDocuments(fileMap);

    // Set selected file
    if (state.selectedFile) {
      workbenchStore.setSelectedFile(state.selectedFile);
    }

    // Restore previews if available
    if (state.previews && state.previews.length > 0) {
      // Switch to preview view if there are previews
      workbenchStore.currentView.set('preview');
    }
  }
}

// Get chat by ID or URL ID
async function getChat(id: string): Promise<ChatHistoryItem | null> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      return null;
    }

    // Use RPC function to get chat by ID or URL ID
    const { data, error } = await supabase
      .rpc('get_chat', { p_id: id });

    if (error) {
      logger.error('Error fetching chat:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const chatData = data[0];
    return {
      id: chatData.id,
      urlId: chatData.url_id,
      description: chatData.description,
      messages: chatData.messages,
      currentIteration: chatData.current_iteration || 1,
      timestamp: chatData.updated_at,
    };
  } catch (error) {
    logger.error('Failed to get chat:', error);
    throw error;
  }
}

// Store messages
async function storeMessages(
  id: string,
  messages: ChatMessage[],
  urlId?: string,
  description?: string,
  currentIteration: number = 1
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // Use RPC function to store messages
    const { error } = await supabase
      .rpc('store_chat', {
        p_id: id,
        p_url_id: urlId,
        p_description: description,
        p_messages: messages,
        p_current_iteration: currentIteration
      });

    if (error) {
      logger.error('Error storing messages:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Failed to store messages:', error);
    throw error;
  }
}

// Generate a new unique ID for a chat
async function generateId(): Promise<string> {
  return crypto.randomUUID();
}

// Generate a unique URL ID based on a suggested ID
async function generateUrlId(suggestedId: string): Promise<string> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      return suggestedId;
    }

    // Check if the suggested ID is already in use
    const { data, error } = await supabase
      .from('chat_history')
      .select('url_id')
      .eq('url_id', suggestedId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // If not in use, return the suggested ID
    if (!data) {
      return suggestedId;
    }

    // Otherwise, add a suffix and try again
    let counter = 2;
    let newUrlId = `${suggestedId}-${counter}`;

    while (true) {
      const { data, error } = await supabase
        .from('chat_history')
        .select('url_id')
        .eq('url_id', newUrlId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return newUrlId;
      }

      counter++;
      newUrlId = `${suggestedId}-${counter}`;
    }
  } catch (error) {
    logger.error('Failed to generate URL ID:', error);
    // Fall back to suggestedId with timestamp to ensure uniqueness
    return `${suggestedId}-${Date.now()}`;
  }
}

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}
