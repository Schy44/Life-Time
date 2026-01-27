-- ==================== SUPABASE REALTIME TRIGGERS ====================
-- Enable real-time messaging with Supabase Realtime

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE api_message;

-- Create trigger function to broadcast new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast notification for new message
    -- This will be picked up by Supabase Realtime subscriptions
    PERFORM pg_notify(
        'new_message',
        json_build_object(
            'chat_room_id', NEW.chat_room_id,
            'sender_id', NEW.sender_id,
            'receiver_id', NEW.receiver_id,
            'message_id', NEW.id,
            'sent_at', NEW.sent_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to message table
DROP TRIGGER IF EXISTS on_message_insert ON api_message;
CREATE TRIGGER on_message_insert
AFTER INSERT ON api_message
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();


-- ==================== MESSAGE READ STATUS TRIGGER ====================
-- Automatically update chat room's updated_at when new message is sent

CREATE OR REPLACE FUNCTION update_chatroom_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE api_chatroom
    SET updated_at = NOW()
    WHERE id = NEW.chat_room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_update_chatroom ON api_message;
CREATE TRIGGER on_message_update_chatroom
AFTER INSERT ON api_message
FOR EACH ROW
EXECUTE FUNCTION update_chatroom_timestamp();
