import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '@/components/chat/BaseChat';
import { Chat } from '@/components/chat/Chat.client';
import { Header } from '@/components/header/Header';

export const meta: MetaFunction = () => {
  return [{ title: 'Jumbo by lomi.' }, { name: 'description', content: 'Chat and build apps with Jumbo, a full-stack AI agent from lomi.' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
