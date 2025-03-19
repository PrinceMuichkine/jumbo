import * as React from 'react';
import { motion } from 'framer-motion';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
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
          <h1 className="text-xl font-semibold text-jumbo-elements-textPrimary">My Subscription</h1>
        </div>
        <div className="p-6 dark:bg-gray-900 bg-transparent">
          <div className="space-y-4">
            <div className="p-4 border border-jumbo-elements-borderColor rounded-lg bg-jumbo-elements-bg-depth-1 dark:bg-gray-850">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium text-jumbo-elements-textPrimary">Current Plan</h3>
                <span className="text-sm font-semibold text-green-500">Free</span>
              </div>
              <p className="text-sm text-jumbo-elements-textSecondary">
                You are currently on the Free plan with 150,000 tokens per day.
              </p>
            </div>

            <div className="p-4 border border-jumbo-elements-borderColor rounded-lg bg-jumbo-elements-bg-depth-1 dark:bg-gray-850">
              <h3 className="text-md font-medium text-jumbo-elements-textPrimary mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-jumbo-elements-textSecondary mb-4">
                Get 1,000,000 tokens per month, priority support, and more.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-jumbo-elements-textPrimary">$9.99/month</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors">
                  Upgrade
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
