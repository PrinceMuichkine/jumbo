import * as React from 'react';
import { motion } from 'framer-motion';

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-[500px] bg-jumbo-elements-background dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-jumbo-elements-borderColor p-4 bg-jumbo-elements-bg-depth-1 dark:bg-gray-850">
          <h1 className="text-xl font-semibold text-jumbo-elements-textPrimary">Get Free Credits</h1>
        </div>
        <div className="p-6 dark:bg-gray-900 bg-transparent">
          <div className="space-y-4">
            <p className="text-jumbo-elements-textPrimary">Share your referral link and get free credits when friends sign up.</p>

            <div className="p-3 bg-jumbo-elements-bg-depth-1 dark:bg-gray-850 rounded-md border border-jumbo-elements-borderColor">
              <p className="text-jumbo-elements-textSecondary mb-2">Your referral link</p>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value="https://jumbo.dev/ref/12345"
                  className="flex-1 bg-jumbo-elements-bg-depth-2 dark:bg-gray-800 border border-jumbo-elements-borderColor rounded-l-md px-3 py-2 text-sm text-jumbo-elements-textPrimary"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text rounded-r-md px-3 text-sm">
                  Copy
                </motion.button>
              </div>
            </div>

            <div className="text-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors">
                Share on Twitter
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
