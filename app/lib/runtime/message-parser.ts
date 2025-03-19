import type { ActionType, JumboAction, JumboActionData, FileAction, ShellAction } from '@/types/actions';
import type { JumboArtifactData } from '@/types/artifact';
import { createScopedLogger } from '@/utils/logger';
import { unreachable } from '@/utils/unreachable';

const ARTIFACT_TAG_OPEN = '<jumboArtifact';
const ARTIFACT_TAG_CLOSE = '</jumboArtifact>';
const ARTIFACT_ACTION_TAG_OPEN = '<jumboAction';
const ARTIFACT_ACTION_TAG_CLOSE = '</jumboAction>';

// Special partial tags that should be handled
const SPECIAL_PARTIAL_TAGS = ['<b', '<bol', '<jumbo', '<jumboA'];

const logger = createScopedLogger('MessageParser');

export interface ArtifactCallbackData extends JumboArtifactData {
  messageId: string;
}

export interface ActionCallbackData {
  artifactId: string;
  messageId: string;
  actionId: string;
  action: JumboAction;
}

export type ArtifactCallback = (data: ArtifactCallbackData) => void;
export type ActionCallback = (data: ActionCallbackData) => void;

export interface ParserCallbacks {
  onArtifactOpen?: ArtifactCallback;
  onArtifactClose?: ArtifactCallback;
  onActionOpen?: ActionCallback;
  onActionClose?: ActionCallback;
}

interface ElementFactoryProps {
  messageId: string;
}

type ElementFactory = (props: ElementFactoryProps) => string;

export interface StreamingMessageParserOptions {
  callbacks?: ParserCallbacks;
  artifactElement?: ElementFactory;
}

interface MessageState {
  position: number;
  insideArtifact: boolean;
  insideAction: boolean;
  currentArtifact?: JumboArtifactData;
  currentAction: JumboActionData;
  actionId: number;
}

export class StreamingMessageParser {
  #messages = new Map<string, MessageState>();

  constructor(private _options: StreamingMessageParserOptions = {}) {}

  parse(messageId: string, input: string) {
    let state = this.#messages.get(messageId);

    if (!state) {
      state = {
        position: 0,
        insideAction: false,
        insideArtifact: false,
        currentAction: { content: '' },
        actionId: 0,
      };

      this.#messages.set(messageId, state);
    }

    let output = '';
    let i = state.position;
    let earlyBreak = false;

    while (i < input.length) {
      if (state.insideArtifact) {
        const currentArtifact = state.currentArtifact;

        if (currentArtifact === undefined) {
          unreachable('Artifact not initialized');
        }

        if (state.insideAction) {
          const closeIndex = input.indexOf(ARTIFACT_ACTION_TAG_CLOSE, i);

          const currentAction = state.currentAction;

          if (closeIndex !== -1) {
            currentAction.content += input.slice(i, closeIndex);

            let content = currentAction.content.trim();

            if ('type' in currentAction && currentAction.type === 'file') {
              content += '\n';
            }

            currentAction.content = content;

            this._options.callbacks?.onActionClose?.({
              artifactId: currentArtifact.id,
              messageId,

              /**
               * We decrement the id because it's been incremented already
               * when `onActionOpen` was emitted to make sure the ids are
               * the same.
               */
              actionId: String(state.actionId - 1),

              action: currentAction as JumboAction,
            });

            state.insideAction = false;
            state.currentAction = { content: '' };

            i = closeIndex + ARTIFACT_ACTION_TAG_CLOSE.length;
          } else {
            break;
          }
        } else {
          const actionOpenIndex = input.indexOf(ARTIFACT_ACTION_TAG_OPEN, i);
          const artifactCloseIndex = input.indexOf(ARTIFACT_TAG_CLOSE, i);

          if (actionOpenIndex !== -1 && (artifactCloseIndex === -1 || actionOpenIndex < artifactCloseIndex)) {
            const actionEndIndex = input.indexOf('>', actionOpenIndex);

            if (actionEndIndex !== -1) {
              state.insideAction = true;

              state.currentAction = this.#parseActionTag(input, actionOpenIndex, actionEndIndex);

              this._options.callbacks?.onActionOpen?.({
                artifactId: currentArtifact.id,
                messageId,
                actionId: String(state.actionId++),
                action: state.currentAction as JumboAction,
              });

              i = actionEndIndex + 1;
            } else {
              break;
            }
          } else if (artifactCloseIndex !== -1) {
            this._options.callbacks?.onArtifactClose?.({ messageId, ...currentArtifact });

            state.insideArtifact = false;
            state.currentArtifact = undefined;

            i = artifactCloseIndex + ARTIFACT_TAG_CLOSE.length;
          } else {
            break;
          }
        }
      } else if (input[i] === '<' && input[i + 1] !== '/') {
        let j = i;
        let potentialTag = '';

        // Check if we have enough characters to potentially have a complete tag
        if (i + ARTIFACT_TAG_OPEN.length <= input.length) {
          while (j < input.length && potentialTag.length < ARTIFACT_TAG_OPEN.length) {
            potentialTag += input[j];
            j++;
          }

          // If we have a complete jumboArtifact tag opening
          if (potentialTag === ARTIFACT_TAG_OPEN) {
            const nextChar = input[j];

            if (nextChar && nextChar !== '>' && nextChar !== ' ') {
              // Not a valid tag opening (e.g., "<jumboArtifacts")
              output += input.slice(i, j);
              i = j;
              continue;
            }

            const openTagEnd = input.indexOf('>', j - 1);

            if (openTagEnd !== -1) {
              const artifactTag = input.slice(i, openTagEnd + 1);

              const artifactTitle = this.#extractAttribute(artifactTag, 'title') as string;
              const artifactId = this.#extractAttribute(artifactTag, 'id') as string;

              if (!artifactTitle) {
                logger.warn('Artifact title missing');
              }

              if (!artifactId) {
                logger.warn('Artifact id missing');
              }

              state.insideArtifact = true;

              const currentArtifact = {
                id: artifactId,
                title: artifactTitle,
              } satisfies JumboArtifactData;

              state.currentArtifact = currentArtifact;

              this._options.callbacks?.onArtifactOpen?.({ messageId, ...currentArtifact });

              const artifactFactory = this._options.artifactElement ?? createArtifactElement;

              output += artifactFactory({ messageId });

              i = openTagEnd + 1;
              continue;
            } else {
              // Incomplete tag
              earlyBreak = true;
              break;
            }
          } else {
            // Check if it's the start of a potential jumboArtifact tag but incomplete
            if (ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
              // This is a potential artifact tag start that's incomplete
              // Let's break and wait for more data
              earlyBreak = true;
              break;
            } else {
              // If it's not a potential jumboArtifact tag, just add it to output
              // Only add the opening < since we need to check character by character
              output += input[i];
              i++;
              continue;
            }
          }
        } else {
          // Not enough characters to form a complete artifact tag
          // Check if what we have so far matches the start of the artifact tag
          potentialTag = input.slice(i, input.length);

          if (ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
            // This looks like it could be the start of an artifact tag, but we need more characters
            earlyBreak = true;
            break;
          } else {
            // This is definitely not an artifact tag
            output += input[i];
            i++;
            continue;
          }
        }
      } else {
        // Check for special partial tags that should be stripped
        let isSpecialPartialTag = false;

        for (const partialTag of SPECIAL_PARTIAL_TAGS) {
          if (i + partialTag.length <= input.length) {
            const potentialPartialTag = input.substring(i, i + partialTag.length);

            if (potentialPartialTag === partialTag) {
              // We found a special partial tag
              const restOfInput = input.substring(i + partialTag.length);
              // If it's at the end or not followed by a valid tag character, it's a partial tag
              if (restOfInput.length === 0 || !/^[a-zA-Z0-9]/.test(restOfInput[0])) {
                // Skip this partial tag entirely - don't include it in output
                i += partialTag.length;
                isSpecialPartialTag = true;
                break;
              }
            }
          }
        }

        if (isSpecialPartialTag) {
          continue;
        }

        output += input[i];
        i++;
      }
    }

    state.position = i;

    return output;
  }

  reset() {
    this.#messages.clear();
  }

  #parseActionTag(input: string, actionOpenIndex: number, actionEndIndex: number) {
    const actionTag = input.slice(actionOpenIndex, actionEndIndex + 1);

    const actionType = this.#extractAttribute(actionTag, 'type') as ActionType;

    const actionAttributes = {
      type: actionType,
      content: '',
    };

    if (actionType === 'file') {
      const filePath = this.#extractAttribute(actionTag, 'filePath');

      if (filePath) {
        (actionAttributes as FileAction).filePath = filePath;
      }
    } else if (actionType === 'shell') {
      // Shell action doesn't have any additional attributes beyond type
    } else {
      logger.warn(`Unknown action type: ${actionType}`);
    }

    return actionAttributes;
  }

  #extractAttribute(tag: string, attrName: string) {
    // Find the attribute name in the tag
    const nameIndex = tag.indexOf(` ${attrName}="`);

    if (nameIndex === -1) {
      return undefined;
    }

    // Find where the attribute value starts
    const valueStartIndex = nameIndex + attrName.length + 3; // +3 for ' ="'

    // Find where the attribute value ends
    let valueEndIndex = tag.indexOf('"', valueStartIndex);

    if (valueEndIndex === -1) {
      return undefined;
    }

    // Extract attribute value
    return tag.slice(valueStartIndex, valueEndIndex);
  }
}

const createArtifactElement: ElementFactory = (props) => {
  const elementProps = [
    'class="__jumboArtifact__"',
    ...Object.entries(props).map(([key, value]) => {
      return `data-${camelToDashCase(key)}=${JSON.stringify(value)}`;
    }),
  ];

  return `<div ${elementProps.join(' ')}></div>`;
};

function camelToDashCase(input: string) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
