import { Routes, Route } from 'react-router-dom';
import Root from './root-layout';
import Index from './routes/_index';
import ChatPage from './routes/chat.$id';
import AuthCallback from './routes/auth/callback';
import Login from './routes/auth/login';
import EmailVerified from './routes/auth/email-verified';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Index />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/email-verified" element={<EmailVerified />} />
      </Route>
    </Routes>
  );
}
