-- Create function to get a single chat by ID or URL ID
CREATE OR REPLACE FUNCTION public.get_chat(p_id TEXT)
RETURNS TABLE (
  id UUID,
  url_id TEXT,
  description TEXT,
  messages JSONB,
  current_iteration INTEGER,
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
    ch.current_iteration,
    ch.updated_at
  FROM
    public.chat_history ch
  WHERE
    (ch.id::TEXT = p_id OR ch.url_id = p_id)
    AND ch.user_id = auth.uid()
    AND ch.deleted_at IS NULL;
END;
$$;

-- Create function to get all chats for current user
CREATE OR REPLACE FUNCTION public.get_all_chats()
RETURNS TABLE (
  id UUID,
  url_id TEXT,
  description TEXT,
  messages JSONB,
  current_iteration INTEGER,
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
    ch.current_iteration,
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

-- Create function to store chat messages
CREATE OR REPLACE FUNCTION public.store_chat(
  p_id UUID,
  p_url_id TEXT,
  p_description TEXT,
  p_messages JSONB,
  p_current_iteration INTEGER DEFAULT 1
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
    messages,
    current_iteration
  )
  VALUES (
    p_id,
    auth.uid(),
    p_url_id,
    p_description,
    p_messages,
    p_current_iteration
  )
  ON CONFLICT (id)
  DO UPDATE SET
    url_id = EXCLUDED.url_id,
    description = EXCLUDED.description,
    messages = EXCLUDED.messages,
    current_iteration = EXCLUDED.current_iteration,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Create function to soft delete a chat
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
