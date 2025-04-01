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

// Extend Message type with iteration metadata -> remove iteration if not needed?
// Keep timestamp and workbenchState as they relate to the message itself
export interface ChatMessage extends Message {
  // iteration?: number; // Removed as versioning is snapshot based
  timestamp?: string;
  workbenchState?: { // We might still store this temporarily on the message before snapshotting
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
  // currentIteration?: number; // Removed
  timestamp: string; // Represents last updated time of the chat history row
}

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);
// export const currentIteration = atom<number>(1); // Removed

// --- Helper function to capture current workbench files ---
function captureWorkbenchFiles(): Record<string, { content: string; type: 'file'; isBinary: boolean }> {
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

// --- Helper function to restore workbench state from snapshot data ---
// TODO: Adapt this to work with our workbenchStore and WebContainer if needed
function restoreWorkbenchStateFromSnapshot(snapshotFiles: Record<string, { content: string; type: 'file'; isBinary: boolean }>) {
  if (!snapshotFiles) return;

  // Clear existing files? Or merge? Decide on strategy.
  // For now, let's assume we replace the current state.
  workbenchStore.setDocuments({});

  // Set view to code if we're restoring files
  if (Object.keys(snapshotFiles).length > 0) {
    workbenchStore.currentView.set('code');
    workbenchStore.setShowWorkbench(true);

    const fileMap: FileMap = {};
    Object.entries(snapshotFiles).forEach(([path, file]) => {
      // Assuming snapshotFiles directly contains the needed structure
      fileMap[path] = file;
    });

    // Set documents (which will load them into the editor)
    workbenchStore.setDocuments(fileMap);

    // Maybe set selected file to the first one? Or leave it null?
    const firstFilePath = Object.keys(fileMap)[0];
    if (firstFilePath) {
      workbenchStore.setSelectedFile(firstFilePath);
    }
  }
  // TODO: Handle preview restoration if needed and possible from snapshot data
}

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();

  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();
  // Add state to hold available snapshots for the current chat
  const [availableSnapshots, setAvailableSnapshots] = useState<Array<{ message_id: string; created_at: string }>>([]);

  // Fetch chat data and snapshots on load
  useEffect(() => {
    if (mixedId) {
      Promise.all([
        getChat(mixedId),
        getSnapshotsForChat(mixedId) // Fetch snapshots for this chat
      ]).then(([storedChat, snapshots]) => {
          // Add logging here
          logger.debug('[useChatHistory] Raw snapshots received:', snapshots);

          if (storedChat && storedChat.messages.length > 0) {
            setInitialMessages(storedChat.messages);
            setUrlId(storedChat.urlId);
            description.set(storedChat.description);
            chatId.set(storedChat.id);
            // Store snapshot info (message_id, created_at) for UI display
            const snapshotInfo = snapshots.map(s => ({ message_id: s.message_id, created_at: s.created_at }));
            logger.debug('[useChatHistory] Setting availableSnapshots:', snapshotInfo);
            setAvailableSnapshots(snapshotInfo);
          } else {
            // If chat not found, clear snapshots and navigate
            logger.debug('[useChatHistory] Chat not found or empty, clearing snapshots.');
            setAvailableSnapshots([]);
            navigate(`/`, { replace: true });
          }
          setReady(true);
        })
        .catch((error) => {
          toast.error(`Failed to load chat or snapshots: ${error.message}`);
          logger.error('[useChatHistory] Error loading chat/snapshots:', error);
          setAvailableSnapshots([]);
          setReady(true);
        });
    } else {
      logger.debug('[useChatHistory] No chat ID (mixedId) provided.');
      setReady(true);
      setAvailableSnapshots([]); // Clear snapshots if no chat ID
    }
  }, [mixedId, navigate]);

  // Function to save a snapshot
  const saveSnapshot = async (chatHistoryId: string, messageId: string) => {
    if (!chatHistoryId || !messageId) {
      logger.warn('Cannot save snapshot without chat ID or message ID');
      return;
    }

    const filesToSave = captureWorkbenchFiles();
    if (Object.keys(filesToSave).length === 0) {
      logger.debug('No files in workbench, skipping snapshot.');
      return; // Don't save empty snapshots
    }

    try {
      logger.debug(`Creating snapshot for message ${messageId} in chat ${chatHistoryId}`);
      const { data, error } = await supabase.rpc('create_snapshot', {
        p_chat_history_id: chatHistoryId,
        p_message_id: messageId,
        p_workbench_files: filesToSave
      });

      if (error) throw error;
      logger.info(`Snapshot created successfully with ID: ${data}`);
      // Optionally update availableSnapshots state here immediately
      // Or rely on the initial load/refresh to pick it up
    } catch (error) {
      toast.error('Failed to save snapshot');
      logger.error('Failed to save snapshot:', error);
    }
  };

  // Function to restore from a snapshot
  const restoreSnapshot = async (messageIdToRestore: string) => {
    try {
      logger.debug(`Restoring snapshot for message ${messageIdToRestore}`);
      const { data: snapshotData, error } = await supabase.rpc('get_snapshot_by_message_id', {
        p_message_id: messageIdToRestore
      });

      if (error) throw error;

      if (!snapshotData || snapshotData.length === 0) {
        toast.error('Snapshot not found for this message.');
        logger.warn(`Snapshot not found for message ID: ${messageIdToRestore}`);
        return null; // Indicate failure or handle appropriately
      }

      const snapshot = snapshotData[0]; // Assuming message IDs are unique per user
      restoreWorkbenchStateFromSnapshot(snapshot.workbench_files);

      // Find the index of the message we restored to
      const chat = await getChat(chatId.get() as string); // Re-fetch potentially?
      if (!chat) return null;

      const messageIndex = chat.messages.findIndex(m => m.id === messageIdToRestore);
      if (messageIndex === -1) {
        toast.error('Could not find the corresponding message in history.');
        return null;
      }

      // Return the messages up to and including the snapshot message
      return chat.messages.slice(0, messageIndex + 1);

    } catch (error) {
      toast.error('Failed to restore snapshot');
      logger.error('Failed to restore snapshot:', error);
      return null;
    }
  };

  return {
    ready: !mixedId || ready,
    initialMessages,
    availableSnapshots, // Expose snapshot list for UI
    restoreSnapshot,    // Expose restore function
    storeMessageHistory: async (messages: ChatMessage[]) => {
      const currentChatId = chatId.get();
      const currentDescription = description.get(); // Get current description
      const currentUrlId = urlId; // Get current URL ID

      // --- Determine Chat ID ---
      let finalChatId = currentChatId;
      let isNewChat = false;
      if (!finalChatId) {
        try {
          finalChatId = await generateId();
          chatId.set(finalChatId); // Update atom immediately
          isNewChat = true;
          logger.debug('Generated new chat ID:', finalChatId);
        } catch (error) {
          toast.error('Failed to generate chat ID');
          logger.error(error);
          return; // Stop if we can't get an ID
        }
      }
      // -------------------------

      if (messages.length === 0 || !finalChatId) {
        logger.warn('storeMessageHistory called with no messages or no chat ID.');
        return;
      }

      // --- Determine Chat Description ---
      let finalDescription = currentDescription;
      const { firstArtifact } = workbenchStore; // Get artifact info

      // If it's a new chat and the description isn't set yet...
      if (isNewChat && !finalDescription) {
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage?.content) {
          // Try to generate title from first user message
          finalDescription = firstUserMessage.content.substring(0, 50).trim();
          if (firstUserMessage.content.length > 50) {
            finalDescription += '...';
          }
          description.set(finalDescription); // Update atom
          logger.debug('Generated chat description from first message:', finalDescription);
        } else if (firstArtifact?.title) {
          // Fallback to artifact title if no user message content
          finalDescription = firstArtifact.title;
          description.set(finalDescription);
          logger.debug('Using artifact title for new chat description:', finalDescription);
        } else {
          // Final fallback if no user message and no artifact title
          finalDescription = 'New Chat'; // Or generate a timestamp-based title
          description.set(finalDescription);
          logger.debug('Using default title for new chat description:', finalDescription);
        }
      }
      // If not a new chat, but description was previously empty, try artifact title
      else if (!finalDescription && firstArtifact?.title) {
         finalDescription = firstArtifact.title;
         description.set(finalDescription);
         logger.debug('Setting chat description from artifact title:', finalDescription);
      }
      // ------------------------------

      // --- Determine URL ID ---
      let finalUrlId = currentUrlId;
       if (!finalUrlId && firstArtifact?.id) {
         try {
           const generatedUrlId = await generateUrlId(firstArtifact.id);
           // Only navigate if it's a *new* chat being assigned a URL ID
           if (isNewChat) {
                navigateChat(generatedUrlId);
           }
           setUrlId(generatedUrlId); // Update state
           finalUrlId = generatedUrlId;
           logger.debug('Generated URL ID:', finalUrlId);
         } catch (error) {
           toast.error('Failed to generate URL ID');
           logger.error(error);
           // Decide if we should proceed without URL ID or stop
         }
       }
      // ----------------------

      // --- Save Main Chat History ---
      try {
        logger.debug(`Storing messages for chat ${finalChatId} with description: ${finalDescription}`);
        await storeMessages(
          finalChatId,
          messages,
          finalUrlId, // Use the determined URL ID
          finalDescription // Use the determined description
        );
        // If it was a new chat, trigger navigation *after* successful save
        if (isNewChat && !finalUrlId) {
            navigateChat(finalChatId); // Navigate using the main chat ID if no URL ID was generated
        }

      } catch (error) {
        toast.error('Failed to save chat history');
        logger.error('storeMessages error:', error);
        // If storing failed, revert chat ID atom if it was newly generated
        if (isNewChat) {
            chatId.set(undefined);
        }
        return; // Don't proceed to snapshot if history save failed
      }

      // --- Save Snapshot ---
      // We need the chat ID used for saving the history, which is finalChatId
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage?.id) {
          // Call saveSnapshot with the correct chat ID and message ID
          await saveSnapshot(finalChatId, lastAssistantMessage.id);
      } else {
        logger.debug('No assistant message found in the latest batch, skipping snapshot.');
      }
    },
    // Add function to navigate to a specific iteration -> REMOVED
    // Start a new iteration from a previous one -> REMOVED
  };
}

// Helper function to restore workbench state -> MOVED & RENAMED restoreWorkbenchStateFromSnapshot

// Get chat by ID or URL ID - updated return type
async function getChat(id: string): Promise<ChatHistoryItem | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return null; // Return null if not authenticated

    const { data, error } = await supabase.rpc('get_chat', { p_id: id });
    if (error) {
      logger.error('Error fetching chat:', error);
      throw error;
    }
    if (!data || data.length === 0) return null;

    const chatData = data[0];
    return {
      id: chatData.id,
      urlId: chatData.url_id,
      description: chatData.description,
      messages: chatData.messages, // Assuming messages are already ChatMessage[] type
      timestamp: chatData.updated_at,
    };
  } catch (error) {
    // Don't re-throw here, return null to indicate chat not found/error
    logger.error('Failed to get chat:', error);
    return null;
  }
}

// Get all snapshots for a chat
async function getSnapshotsForChat(chatHistoryId: string): Promise<Array<{ id: string; message_id: string; created_at: string; workbench_files: any }>> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data, error } = await supabase.rpc('get_snapshots_for_chat', { p_chat_history_id: chatHistoryId });
    if (error) {
      logger.error('Error fetching snapshots:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    logger.error('Failed to get snapshots:', error);
    return [];
  }
}

// Store messages - updated parameters
async function storeMessages(
  id: string,
  messages: ChatMessage[],
  urlId?: string,
  description?: string
  // currentIteration removed
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    const params = {
      p_id: id,
      p_url_id: urlId ?? null,
      p_description: description ?? null,
      p_messages: messages,
      // p_current_iteration removed
    };
    logger.debug('Calling store_chat with params:', params);

    const { error } = await supabase.rpc('store_chat', params);
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
