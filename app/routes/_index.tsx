import { BaseChat } from '@/components/chat/BaseChat';
import { Chat } from '@/components/chat/Chat.client';
import { Header } from '@/components/header/Header';
import { ClientOnly } from '@/components/utils/ClientOnly';
import { Helmet } from '@/components/utils/Helmet';

export default function Index() {
  return (
    <>
      <Helmet
        title="Jumbo by lomi."
        description="Chat and build apps with Jumbo, a full-stack AI agent from lomi."
      />
      <div className="flex flex-col h-full w-full bg-transparent">
        <Header />
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
    </>
  );
}
