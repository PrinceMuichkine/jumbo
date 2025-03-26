import type { Message } from 'ai';
import React, { type RefCallback, useState, useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '@/components/sidebar/Menu.client';
import { IconButton } from '@/components/ui/IconButton';
import { Workbench } from '@/components/workbench/Workbench.client';
import { classNames } from '@/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';

// Import module CSS
import styles from './BaseChat.module.scss';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

// Disclaimer Modal component
const DisclaimerModal = ({ isOpen, onClose, currentLanguage }: { isOpen: boolean; onClose: () => void; currentLanguage: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-jumbo-elements-background-depth-1 rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 border border-jumbo-elements-borderColor">
        <h2 className="text-lg font-bold mb-3 text-jumbo-elements-textPrimary">
          {t(currentLanguage, 'disclaimer.title') || "We're under development"}
        </h2>
        <p className="mb-4 text-sm text-jumbo-elements-textSecondary">
          {t(currentLanguage, 'disclaimer.message') || "Jumbo is still in development. We're working hard to bring you the best experience possible. Please check back in a few hours."}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 bg-jumbo-elements-item-backgroundAccent text-jumbo-elements-textPrimary rounded hover:bg-opacity-80 transition-colors text-sm"
          >
            {t(currentLanguage, 'disclaimer.button') || "Gotcha"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EXAMPLE_PROMPTS = [
  {
    text: 'Create an app with lomi. payment stack',
    color: 'bg-jumbo-elements-button-primary-background hover:bg-jumbo-elements-button-primary-backgroundHover text-jumbo-elements-button-primary-text'
  },
  {
    text: 'Create an awesome checkout form',
    color: 'bg-jumbo-elements-button-primary-background hover:bg-jumbo-elements-button-primary-backgroundHover text-jumbo-elements-button-primary-text'
  },
  {
    text: 'Set up lomi. for end customers',
    color: 'bg-jumbo-elements-button-primary-background hover:bg-jumbo-elements-button-primary-backgroundHover text-jumbo-elements-button-primary-text'
  },
  {
    text: 'Build a todo app in React using Tailwind',
    color: 'bg-jumbo-elements-button-primary-background hover:bg-jumbo-elements-button-primary-backgroundHover text-jumbo-elements-button-primary-text'
  },
  {
    text: 'Develop a Space Invaders-style game',
    color: 'bg-jumbo-elements-button-primary-background hover:bg-jumbo-elements-button-primary-backgroundHover text-jumbo-elements-button-primary-text'
  },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { currentLanguage } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    // Detect dark mode and screen size
    useEffect(() => {
      // Check initial color scheme
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeMediaQuery.matches);

      // Check if mobile
      const mobileMediaQuery = window.matchMedia('(max-width: 640px)');
      setIsMobile(mobileMediaQuery.matches);

      // Listen for changes
      const handleDarkModeChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      const handleMobileChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };

      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
      mobileMediaQuery.addEventListener('change', handleMobileChange);

      return () => {
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
        mobileMediaQuery.removeEventListener('change', handleMobileChange);
      };
    }, []);

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      // Show disclaimer instead of sending message
      setDisclaimerOpen(true);
    };

    // Get only 3 example prompts for mobile
    const displayPrompts = isMobile ? EXAMPLE_PROMPTS.slice(0, 3) : EXAMPLE_PROMPTS;

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-jumbo-elements-background-depth-1 max-w-[100vw]',
        )}
        data-chat-visible={showChat}
      >
        <DisclaimerModal isOpen={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} currentLanguage={currentLanguage} />
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full justify-center overflow-x-hidden">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow w-full max-w-full sm:max-w-3xl min-w-0 h-full px-2 sm:px-0')}>
            {!chatStarted && (
              <>
                <div className="flex justify-center mt-16 sm:mt-12 md:mt-10">
                  <ClientOnly>
                    {() => (
                      <img
                        src={isDarkMode ? "/icons/transparent.webp" : "/icons/transparent_dark.webp"}
                        alt="Lomi Logo"
                        className="h-16 sm:h-24 w-auto"
                      />
                    )}
                  </ClientOnly>
                </div>
                <div id="intro" className="mt-8 sm:mt-6 max-w-[98%] sm:max-w-xl mx-auto px-0 text-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl text-center font-bold text-jumbo-elements-textPrimary mb-8 sm:mb-6 mx-auto leading-tight">
                    {t(currentLanguage, 'chat.heading')}
                  </h1>
                </div>
              </>
            )}
            <div
              className={classNames('pt-2 sm:pt-6 px-0 sm:px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-2 sm:px-4 pb-4 sm:pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full max-w-chat mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <div
                  className={classNames(
                    'shadow-sm border border-jumbo-elements-borderColor bg-jumbo-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden mx-0',
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-3 sm:pl-4 pt-3 sm:pt-4 pr-12 sm:pr-16 focus:outline-none resize-none text-sm sm:text-md text-jumbo-elements-textPrimary placeholder-jumbo-elements-textTertiary bg-transparent`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        handleSendMessage(event);
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder={t(currentLanguage, 'chat.placeholder')}
                    translate="no"
                  />
                  <ClientOnly>
                    {() => (
                      <SendButton
                        show={input.length > 0 || isStreaming}
                        isStreaming={isStreaming}
                        onClick={(event) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          handleSendMessage(event);
                        }}
                      />
                    )}
                  </ClientOnly>
                  <div className="flex justify-between text-sm p-3 sm:p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton
                        title={enhancingPrompt ? "Enhancing..." : "Enhance prompt"}
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-jumbo-elements-item-contentAccent! pr-1 sm:pr-1.5 enabled:hover:bg-jumbo-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => {
                          setDisclaimerOpen(true);
                        }}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-jumbo-elements-loader-progress text-lg sm:text-xl"></div>
                            <div className="ml-1 sm:ml-1.5 text-xs sm:text-sm">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-jumbo:stars text-lg sm:text-xl"></div>
                            {promptEnhanced && <div className="ml-1 sm:ml-1.5 text-xs sm:text-sm">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-jumbo-elements-textTertiary">
                        <span className="hidden sm:inline">Use </span>
                        <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd>
                        <span className="hidden sm:inline"> for a new line</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="bg-jumbo-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-full sm:max-w-xl mx-auto mt-8 sm:mt-5 flex flex-col items-center pb-10 sm:pb-4">
                <div className="flex flex-wrap gap-2 justify-center px-0 sm:px-2 mx-auto w-full">
                  {displayPrompts.map((examplePrompt, index) => {
                    return (
                      <button
                        key={index}
                        onClick={(event) => {
                          handleSendMessage(event, examplePrompt.text);
                        }}
                        className={`${examplePrompt.color} px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-medium transition-colors text-[11px] sm:text-xs`}
                      >
                        {examplePrompt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
