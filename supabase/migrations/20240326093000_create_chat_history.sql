-- Create the chat_history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url_id TEXT UNIQUE,
  description TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::JSONB,
  current_iteration INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create index for faster querying by user_id
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_history_url_id ON chat_history(url_id);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only access their own chat history
CREATE POLICY "Users can only access their own chat history"
  ON chat_history
  FOR ALL
  USING (auth.uid() = user_id);

-- Create a function to automatically set updated_at on row updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set updated_at automatically
CREATE TRIGGER set_chat_history_updated_at
BEFORE UPDATE ON chat_history
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
