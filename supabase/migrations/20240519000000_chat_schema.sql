-- Migration: Consolidated Chat History & Snapshots Schema
-- Timestamp: 20240519000000 (Example)

BEGIN;

-- Section 1: Chat History Table & Trigger --

-- Create the chat_history table (without current_iteration)
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url_id TEXT UNIQUE, -- Kept for potential direct linking
  description TEXT,    -- Title of the chat
  messages JSONB NOT NULL DEFAULT '[]'::JSONB, -- Full message history
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

COMMENT ON TABLE public.chat_history IS 'Stores the main conversation history for chats.';
COMMENT ON COLUMN public.chat_history.url_id IS 'Optional unique URL-friendly ID for sharing/linking.';
COMMENT ON COLUMN public.chat_history.description IS 'User-defined or auto-generated title for the chat.';
COMMENT ON COLUMN public.chat_history.messages IS 'JSONB array containing the full sequence of messages in the chat.';

-- Create indexes for faster querying by user_id and url_id
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_history_url_id ON public.chat_history(url_id) WHERE deleted_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only access their own chat history
CREATE POLICY "Users can access their own chat history"
  ON public.chat_history
  FOR ALL
  USING (auth.uid() = user_id);

-- Create function to automatically set updated_at on row updates
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER -- Can be DEFINER if needed, but INVOKER is safer if function only uses NOW()
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to set updated_at automatically
CREATE TRIGGER set_chat_history_updated_at
BEFORE UPDATE ON public.chat_history
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- Section 2: Chat Snapshots Table --

-- Create the chat_snapshots table
CREATE TABLE public.chat_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_history_id UUID NOT NULL REFERENCES public.chat_history(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- ID of the assistant message this snapshot corresponds to
  workbench_files JSONB NOT NULL DEFAULT '{}'::JSONB, -- Stores the FileMap state
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comments
COMMENT ON TABLE public.chat_snapshots IS 'Stores snapshots of the workbench file state associated with specific messages in a chat history.';
COMMENT ON COLUMN public.chat_snapshots.message_id IS 'ID of the assistant message in the chat_history.messages array this snapshot corresponds to.';
COMMENT ON COLUMN public.chat_snapshots.workbench_files IS 'JSONB representation of the workbench file map at the time of the snapshot.';

-- Create indexes
CREATE INDEX idx_chat_snapshots_chat_history_id ON public.chat_snapshots(chat_history_id);
CREATE INDEX idx_chat_snapshots_message_id ON public.chat_snapshots(message_id);
CREATE INDEX idx_chat_snapshots_user_id ON public.chat_snapshots(user_id);

-- Enable RLS
ALTER TABLE public.chat_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can access their own snapshots
CREATE POLICY "Users can access their own snapshots"
  ON public.chat_snapshots
  FOR ALL
  USING (auth.uid() = user_id);

-- Section 3: RPC Functions --

-- Function: get_chat (modified - no current_iteration)
CREATE OR REPLACE FUNCTION public.get_chat(p_id TEXT)
RETURNS TABLE (
  id UUID,
  url_id TEXT,
  description TEXT,
  messages JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ch.id,
    ch.url_id,
    ch.description,
    ch.messages,
    ch.updated_at
  FROM
    public.chat_history ch
  WHERE
    (ch.id::TEXT = p_id OR ch.url_id = p_id)
    AND ch.user_id = auth.uid()
    AND ch.deleted_at IS NULL;
END;
$$;

-- Function: get_all_chats (modified - no current_iteration)
CREATE OR REPLACE FUNCTION public.get_all_chats()
RETURNS TABLE (
  id UUID,
  url_id TEXT,
  description TEXT,
  messages JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ch.id,
    ch.url_id,
    ch.description,
    ch.messages,
    ch.updated_at
  FROM
    public.chat_history ch
  WHERE
    ch.user_id = auth.uid()
    AND ch.deleted_at IS NULL
  ORDER BY
    ch.updated_at DESC;
END;
$$;

-- Function: store_chat (modified - no current_iteration)
CREATE OR REPLACE FUNCTION public.store_chat(
  p_id UUID,
  p_url_id TEXT,
  p_description TEXT,
  p_messages JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.chat_history (
    id,
    user_id,
    url_id,
    description,
    messages
  )
  VALUES (
    p_id,
    auth.uid(),
    p_url_id,
    p_description,
    p_messages
  )
  ON CONFLICT (id)
  DO UPDATE SET
    url_id = EXCLUDED.url_id,
    description = EXCLUDED.description,
    messages = EXCLUDED.messages,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Function: soft_delete_chat
CREATE OR REPLACE FUNCTION public.soft_delete_chat(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.chat_history
  SET deleted_at = NOW()
  WHERE id = p_id AND user_id = auth.uid() AND deleted_at IS NULL
  RETURNING TRUE INTO success;

  RETURN COALESCE(success, FALSE);
END;
$$;

-- Function: create_snapshot
CREATE OR REPLACE FUNCTION public.create_snapshot(
  p_chat_history_id UUID,
  p_message_id TEXT,
  p_workbench_files JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_snapshot_id UUID;
BEGIN
  INSERT INTO public.chat_snapshots (chat_history_id, message_id, workbench_files, user_id)
  VALUES (p_chat_history_id, p_message_id, p_workbench_files, auth.uid())
  ON CONFLICT (chat_history_id, message_id) DO UPDATE SET
    workbench_files = EXCLUDED.workbench_files,
    created_at = NOW() -- Update timestamp on modification
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$;

-- Function: get_snapshot_by_message_id
CREATE OR REPLACE FUNCTION public.get_snapshot_by_message_id(p_message_id TEXT)
RETURNS TABLE (
  id UUID,
  chat_history_id UUID,
  message_id TEXT,
  workbench_files JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.chat_history_id,
    cs.message_id,
    cs.workbench_files,
    cs.created_at
  FROM
    public.chat_snapshots cs
  WHERE
    cs.message_id = p_message_id
    AND cs.user_id = auth.uid();
END;
$$;

-- Function: get_snapshots_for_chat
CREATE OR REPLACE FUNCTION public.get_snapshots_for_chat(p_chat_history_id UUID)
RETURNS TABLE (
  id UUID,
  chat_history_id UUID,
  message_id TEXT,
  workbench_files JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.chat_history_id,
    cs.message_id,
    cs.workbench_files,
    cs.created_at
  FROM
    public.chat_snapshots cs
  WHERE
    cs.chat_history_id = p_chat_history_id
    AND cs.user_id = auth.uid()
  ORDER BY
    cs.created_at ASC; -- Order snapshots chronologically
END;
$$;

-- Add unique constraint to enforce the conflict logic at the DB level
ALTER TABLE public.chat_snapshots
  ADD CONSTRAINT unique_chat_message_snapshot UNIQUE (chat_history_id, message_id);

COMMIT;
