import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { currentIteration } from '@/lib/persistence/useChatHistory';
import type { ChatMessage } from '@/lib/persistence/useChatHistory';

interface IterationNavigationProps {
  messages: ChatMessage[];
  onIterationChange: (iteration: number) => void;
  onStartNewIteration: () => void;
}

interface IterationData {
  number: number;
  timestamp?: string;
  fileCount: number;
}

export function IterationNavigation({
  messages,
  onIterationChange,
  onStartNewIteration
}: IterationNavigationProps) {
  const activeIteration = useStore(currentIteration);
  const [iterationData, setIterationData] = useState<IterationData[]>([]);
  const [hoveredIteration, setHoveredIteration] = useState<number | null>(null);

  useEffect(() => {
    // Extract all unique iterations from messages with their data
    const iterations = new Map<number, IterationData>();

    // First, collect all iterations
    messages
      .filter(msg => msg.iteration !== undefined)
      .forEach(msg => {
        const iterationNum = msg.iteration as number;

        // Initialize iteration if needed
        if (!iterations.has(iterationNum)) {
          iterations.set(iterationNum, {
            number: iterationNum,
            timestamp: msg.timestamp,
            fileCount: 0
          });
        }

        // For assistant messages, count files
        if (msg.role === 'assistant' && msg.workbenchState?.files) {
          const data = iterations.get(iterationNum)!;
          data.fileCount = Object.keys(msg.workbenchState.files).length;
          data.timestamp = msg.timestamp; // Use timestamp of assistant message
          iterations.set(iterationNum, data);
        }
      });

    // Sort by iteration number
    const sortedData = Array.from(iterations.values()).sort((a, b) => a.number - b.number);

    // Always include at least iteration 1
    if (sortedData.length === 0 || sortedData[0].number > 1) {
      sortedData.unshift({ number: 1, fileCount: 0, timestamp: undefined });
    }

    setIterationData(sortedData);
  }, [messages]);

  // Don't render if there's only one iteration
  if (iterationData.length <= 1) {
    return null;
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'HH:mm:ss');
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-jumbo-elements-background-depth-2 dark:bg-gray-800 border-b border-jumbo-elements-borderColor text-sm">
      <div className="flex items-center gap-2">
        <span className="text-jumbo-elements-textTertiary">Iterations:</span>
        <div className="flex gap-1">
          {iterationData.map(iteration => (
            <button
              key={iteration.number}
              onClick={() => onIterationChange(iteration.number)}
              onMouseEnter={() => setHoveredIteration(iteration.number)}
              onMouseLeave={() => setHoveredIteration(null)}
              className={`relative px-2 py-1 rounded-md transition-colors ${activeIteration === iteration.number
                ? 'bg-blue-500 text-white'
                : 'bg-jumbo-elements-background-depth-3 hover:bg-jumbo-elements-background-depth-4 text-jumbo-elements-textPrimary'
                }`}
            >
              {iteration.number}

              {/* Tooltip */}
              {hoveredIteration === iteration.number && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-10">
                  <div>Iteration {iteration.number}</div>
                  {iteration.timestamp && (
                    <div>Time: {formatTimestamp(iteration.timestamp)}</div>
                  )}
                  {iteration.fileCount > 0 && (
                    <div>Files: {iteration.fileCount}</div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartNewIteration}
        className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
      >
        <span className="i-ph:branch-duotone text-lg" />
        New iteration
      </motion.button>
    </div>
  );
}
