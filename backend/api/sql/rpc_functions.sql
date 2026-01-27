-- ==================== SECURE MESSAGE FETCHING RPC FUNCTION ====================
-- This function ensures message content is NEVER exposed to the frontend
-- unless the user has paid to unlock the chat.

-- Drop old versions if they exist (to avoid overloading and type mismatch)
DROP FUNCTION IF EXISTS get_chat_messages(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_chat_messages(BIGINT, BIGINT);

CREATE OR REPLACE FUNCTION get_chat_messages(
    p_chat_room_id BIGINT,
    p_user_id BIGINT
)
RETURNS TABLE (
    id BIGINT,
    sender_id BIGINT,
    receiver_id BIGINT,
    content TEXT,
    sent_at TIMESTAMPTZ,
    is_read BOOLEAN
) AS $$
BEGIN
    -- Check if user has unlocked this chat
    IF NOT EXISTS (
        SELECT 1 FROM api_chatunlock
        WHERE chat_room_id = p_chat_room_id
        AND user_id = p_user_id
    ) THEN
        -- Return messages with PLACEHOLDER content (blurred/locked)
        -- This prevents raw message text from reaching the frontend
        RETURN QUERY
        SELECT 
            m.id, 
            m.sender_id,
            m.receiver_id,
            '🔒 Unlock chat to view messages'::TEXT as content,
            m.sent_at, 
            m.is_read
        FROM api_message m
        WHERE m.chat_room_id = p_chat_room_id
        ORDER BY m.sent_at ASC;
    ELSE
        -- User has unlocked - return full message content
        RETURN QUERY
        SELECT 
            m.id, 
            m.sender_id,
            m.receiver_id,
            m.content, 
            m.sent_at, 
            m.is_read
        FROM api_message m
        WHERE m.chat_room_id = p_chat_room_id
        ORDER BY m.sent_at ASC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_chat_messages(BIGINT, BIGINT) TO authenticated;


-- ==================== SEED INITIAL APP CONFIG ====================
-- Insert default configuration values for chat system

INSERT INTO api_appconfig (key, value, description, updated_at) VALUES
('chat_unlock_fee_credits', '10', 'Credits required to unlock a chat with a match', NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO api_appconfig (key, value, description, updated_at) VALUES
('chat_unlock_refund_days', '7', 'Days to wait before refund eligibility if other user doesn''t respond', NOW())
ON CONFLICT (key) DO NOTHING;


-- ==================== ROW LEVEL SECURITY POLICIES ====================
-- Note: Since we're using Django authentication (not Supabase Auth),
-- we'll handle access control at the Django API level instead of RLS.
-- The RPC function provides the security layer for message content.

-- If you want to enable RLS for additional security, you would need to:
-- 1. Set up Supabase Auth integration with Django
-- 2. Store Supabase UUID in Django User model
-- 3. Update these policies to use the correct UUID mapping

-- For now, we rely on Django's permission system and the RPC function
-- to ensure users can only access their own chats and messages.

/*
-- Example RLS policies (commented out - not compatible with Django auth):

ALTER TABLE api_chatroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_chatunlock ENABLE ROW LEVEL SECURITY;

CREATE POLICY chatroom_select_policy ON api_chatroom
    FOR SELECT
    USING (
        participant_1_id IN (SELECT id FROM api_profile WHERE user_id = current_user_id)
        OR participant_2_id IN (SELECT id FROM api_profile WHERE user_id = current_user_id)
    );
*/


-- ==================== PERFORMANCE INDEXES ====================
-- Additional indexes for common queries

CREATE INDEX IF NOT EXISTS idx_chatroom_participants ON api_chatroom(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_message_chatroom_time ON api_message(chat_room_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_unread ON api_message(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_chatunlock_refund ON api_chatunlock(refund_status, unlocked_at) WHERE refund_status = 'eligible';
