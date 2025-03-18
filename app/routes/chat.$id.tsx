import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BaseChat } from '@/components/chat/BaseChat';
import { Chat } from '@/components/chat/Chat.client';
import { Header } from '@/components/header/Header';
import { ClientOnly } from '@/components/utils/ClientOnly';
import { Helmet } from '@/components/utils/Helmet';
import { description as descriptionStore } from '@/lib/persistence/useChatHistory';
import { useStore } from '@nanostores/react';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id;
  const description = useStore(descriptionStore);
  const [title, setTitle] = useState(`Jumbo | Chat ${chatId ? `#${chatId}` : ''}`);

  useEffect(() => {
    if (description) {
      setTitle(`Jumbo | ${description}`);
    }
  }, [description]);

  return (
    <>
      <Helmet title={title} />
      <div className="flex flex-col h-full w-full bg-transparent">
        <Header />
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
    </>
  );
}
