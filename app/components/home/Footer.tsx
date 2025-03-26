import FeedbackForm from './feedback-form';
import { XICON } from '@/components/icons/XIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';
import { PHICON } from '@/components/icons/PHIcon';
import { cn } from '@/lib/actions/utils';
import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);


export function Footer({ className }: { className?: string }) {
  const { currentLanguage } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileMediaQuery.matches);

    // Listen for changes
    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mobileMediaQuery.addEventListener('change', handleMobileChange);

    return () => {
      mobileMediaQuery.removeEventListener('change', handleMobileChange);
    };
  }, []);

  return (
    <nav
      className={cn(
        "bg-jumbo-elements-background-depth-1 relative z-50 h-7 flex items-center justify-center",
        "border-t-0 shadow-none",
        className
      )}
      style={{ boxShadow: 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center justify-between lg:justify-between">
          <div className="hidden lg:flex items-center text-xs text-jumbo-elements-textSecondary font-inter">
            <Link
              to="https://lomi.africa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs"
            >
              {t(currentLanguage, 'footer.copyright')}
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor mx-4" />
            <Link
              to="https://lomi.africa/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs font-medium"
            >
              {t(currentLanguage, 'footer.blog')}
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor mx-4" />
            <FeedbackForm />
            <div className="h-4 w-px bg-jumbo-elements-borderColor mx-4" />
            <Link
              to="https://www.producthunt.com/products/lomi/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs"
            >
              {t(currentLanguage, 'footer.recommend')}
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor mx-4" />
            <LanguageSwitcher />
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4 ml-auto">
            <Link
              to="https://github.com/lomiafrica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-jumbo-elements-textSecondary hover:text-[#6e5494] transition-colors px-1.5"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor"></div>
            <Link
              to="https://x.com/lomiafrica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-black dark:hover:text-white transition-colors px-1.5"
              aria-label="X/Twitter"
            >
              <XICON className="h-3.5 w-3.5 fill-current -translate-y-[0.5px]" />
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor"></div>
            <Link
              to="https://www.producthunt.com/products/lomi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-[#DA552F] transition-colors px-1.5"
              aria-label="Product Hunt"
            >
              <PHICON className="h-4 w-4 fill-current -translate-y-[0.5px]" />
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor"></div>
            <Link
              to="https://www.linkedin.com/company/lomiafri"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jumbo-elements-textSecondary hover:text-[#0A66C2] transition-colors px-1.5"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </Link>
            <div className="h-4 w-px bg-jumbo-elements-borderColor"></div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="https://lomi.africa/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs font-medium px-1.5"
              >
                {isMobile ? "FAQ" : t(currentLanguage, 'footer.faq')}
              </Link>
              <div className="h-4 w-px bg-jumbo-elements-borderColor"></div>
              <Link
                to="https://lomi.africa/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs font-medium px-1.5"
              >
                {isMobile ? "Privacy" : t(currentLanguage, 'footer.privacy')}
              </Link>
              <div className="h-4 w-px bg-jumbo-elements-borderColor hidden lg:block"></div>
              <div className="hidden lg:block">
                <Link
                  to="https://lomi.africa/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors text-xs font-medium px-1.5"
                >
                  {t(currentLanguage, 'footer.terms')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
