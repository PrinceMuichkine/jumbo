import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '@/components/chat/BaseChat';
import { Chat } from '@/components/chat/Chat.client';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { useTranslation } from '@/lib/contexts/TranslationContext';
import { t } from '@/lib/i18n/translations';
import { useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Jumbo by lomi.' },
    { name: 'description', content: t('en', 'meta.description') }
  ];
};

export const loader = () => json({});

export default function Index() {
  const { currentLanguage } = useTranslation();

  // Set app height for mobile browsers
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Set initial height
    setAppHeight();

    // Update height on resize
    window.addEventListener('resize', setAppHeight);

    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <div className="static-layout flex flex-col h-screen max-h-screen w-full bg-jumbo-elements-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
      <Footer />
    </div>
  );
}
