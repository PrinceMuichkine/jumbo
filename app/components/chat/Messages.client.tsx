import type { Message } from 'ai';
import React, { useEffect } from 'react';
import { classNames } from '@/utils/classNames';
import type { ChatMessage } from '@/lib/persistence';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { logger } from '@/utils/logger';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: ChatMessage[];
  availableSnapshots?: Array<{ message_id: string; created_at: string }>;
  handleRestoreSnapshot?: (messageId: string) => Promise<void>;
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [], availableSnapshots = [], handleRestoreSnapshot } = props;

  useEffect(() => {
    logger.debug('[Messages] availableSnapshots:', availableSnapshots);
    logger.debug('[Messages] messages:', messages);
  }, [availableSnapshots, messages]);

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => {
          const { role, content } = message;
          const isUserMessage = role === 'user';
          const isFirst = index === 0;
          const isLast = index === messages.length - 1;

          const snapshotExists = !isUserMessage && availableSnapshots.some(snap => {
            const match = snap.message_id === message.id;
            if (!isUserMessage && match) {
              logger.debug(`[Messages] Snapshot MATCH found for message ${message.id}`);
            }
            return match;
          });
          if (!isUserMessage && !snapshotExists) {
            logger.debug(`[Messages] No snapshot found for assistant message ${message.id}`);
          }

          const hasSnapshot = snapshotExists;

          return (
            <div
              key={index}
              className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)]', {
                'bg-jumbo-elements-messages-background': isUserMessage || !isStreaming || (isStreaming && !isLast),
                'bg-gradient-to-b from-jumbo-elements-messages-background from-30% to-transparent':
                  isStreaming && isLast,
                'mt-4': !isFirst,
              })}
            >
              {isUserMessage && (
                <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
                  <div className="i-ph:user-fill text-xl"></div>
                </div>
              )}
              <div className="grid grid-col-1 w-full">
                {isUserMessage ? (
                  <UserMessage content={content} />
                ) : (
                  <div className="flex items-start gap-2">
                    <AssistantMessage content={content} />
                    {hasSnapshot && handleRestoreSnapshot && (
                      <button
                        onClick={() => handleRestoreSnapshot(message.id)}
                        title={`Restore state from this point (${new Date(availableSnapshots.find(s => s.message_id === message.id)!.created_at).toLocaleString()})`}
                        className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0 mt-1"
                        aria-label="Restore snapshot"
                      >
                        <div className="i-ph:clock-counter-clockwise text-sm" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
        : null}
      {isStreaming && (
        <div className="text-center w-full text-jumbo-elements-textSecondary i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
      )}
    </div>
  );
});
