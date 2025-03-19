import * as React from 'react';
import { motion } from 'framer-motion';

type SettingsTabType = 'general' | 'tokens' | 'applications' | 'knowledge';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>('general');

  React.useEffect(() => {
    if (open) {
      // Reset to default tab when opening
      setActiveTab('general');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const settingsTabs = [
    { id: 'general', icon: 'i-ph:gear-six-duotone', label: 'General' },
    { id: 'tokens', icon: 'i-ph:key-duotone', label: 'Tokens' },
    { id: 'applications', icon: 'i-ph:link-duotone', label: 'Applications' },
    { id: 'knowledge', icon: 'i-ph:lightbulb-duotone', label: 'Knowledge' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-[800px] flex bg-jumbo-elements-background dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-[220px] border-r border-jumbo-elements-borderColor bg-jumbo-elements-bg-depth-1 dark:bg-gray-850">
          <nav className="flex flex-col gap-1 p-4">
            {settingsTabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as SettingsTabType)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text'
                  : 'text-jumbo-elements-textPrimary hover:text-jumbo-elements-textTertiary bg-transparent dark:bg-transparent'
                  }`}
              >
                <span className={`${tab.icon} text-lg`} />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-h-[550px] overflow-auto bg-transparent dark:bg-gray-900">
          <div className="relative h-full">
            <div className="flex items-center justify-between border-b border-jumbo-elements-borderColor p-4 bg-jumbo-elements-bg-depth-1 dark:bg-gray-850">
              <h1 className="text-xl font-semibold text-jumbo-elements-textPrimary">
                {activeTab === 'general' && 'General'}
                {activeTab === 'tokens' && 'Tokens'}
                {activeTab === 'applications' && 'Applications'}
                {activeTab === 'knowledge' && 'Knowledge'}
              </h1>
            </div>

            <div className="p-6 bg-transparent dark:bg-gray-900">
              {/* General Content */}
              {activeTab === 'general' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-jumbo-elements-textPrimary">Delete all chats</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-danger-background text-jumbo-elements-button-danger-text text-sm font-medium hover:bg-jumbo-elements-button-danger-backgroundHover transition-colors">
                      Delete all
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-jumbo-elements-textPrimary">Show token usage in chat</span>
                    <div className="w-10 h-5 bg-jumbo-elements-button-primary-background rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens Content */}
              {activeTab === 'tokens' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-jumbo-elements-textPrimary">Per day</span>
                    <span className="text-jumbo-elements-textPrimary">0 / 150,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-jumbo-elements-button-primary-background h-2.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-jumbo-elements-textPrimary">Per month</span>
                    <span className="text-jumbo-elements-textPrimary">0 / 1,000,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-jumbo-elements-button-primary-background h-2.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-jumbo-elements-textPrimary">Tokens obtained through referrals</span>
                    <span className="text-jumbo-elements-textPrimary">0 / 0</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-jumbo-elements-button-primary-background h-2.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>

                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors">
                      Upgrade for more tokens
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Applications Content */}
              {activeTab === 'applications' && (
                <div className="flex flex-col gap-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-jumbo-elements-textPrimary mb-1">Netlify</h3>
                      <p className="text-sm text-jumbo-elements-textSecondary">
                        Deploy your app seamlessly with your own Netlify account. Use custom domains, optimize performance, and take advantage of powerful deployment tools.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors ml-4">
                      Connect
                    </motion.button>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-jumbo-elements-textPrimary mb-1">Supabase</h3>
                      <p className="text-sm text-jumbo-elements-textSecondary">
                        Integrate Supabase to enable authentication or sync your app with a robust and scalable database effortlessly.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors ml-4">
                      Connect
                    </motion.button>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-jumbo-elements-textPrimary mb-1">Figma</h3>
                      <p className="text-sm text-jumbo-elements-textSecondary">
                        Integrate Figma to import your designs as code ready to be analyzed by Bolt.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors ml-4">
                      Connect
                    </motion.button>
                  </div>

                  <div className="mt-6 text-center">
                    <a href="#" className="text-jumbo-elements-button-primary-text hover:underline">
                      Visit StackBlitz to manage how you log in
                    </a>
                  </div>
                </div>
              )}

              {/* Knowledge Content */}
              {activeTab === 'knowledge' && (
                <div className="flex flex-col gap-4">
                  <p className="text-jumbo-elements-textSecondary mb-4">
                    Manage your uploaded knowledge sources
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 w-fit rounded-md bg-jumbo-elements-button-secondary-background text-jumbo-elements-button-secondary-text text-sm font-medium hover:bg-jumbo-elements-button-secondary-backgroundHover transition-colors">
                    Archive
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
