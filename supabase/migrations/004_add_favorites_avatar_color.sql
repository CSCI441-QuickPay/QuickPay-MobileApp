-- Add avatar_color column to favorites table for consistent color across UI
ALTER TABLE favorites
ADD COLUMN avatar_color TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN favorites.avatar_color IS 'Hex color code for avatar display (e.g., #EF4444). Generated once and kept consistent across the UI.';

-- Create function to generate consistent avatar color based on account number
CREATE OR REPLACE FUNCTION generate_avatar_color(account_number TEXT)
RETURNS TEXT AS $$
DECLARE
  colors TEXT[] := ARRAY['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'];
  hash_value BIGINT := 0;
  char_code INT;
  i INT;
BEGIN
  -- Generate hash from account number
  FOR i IN 1..length(account_number) LOOP
    char_code := ascii(substring(account_number from i for 1));
    hash_value := char_code + ((hash_value << 5) - hash_value);
  END LOOP;

  -- Return color from array using modulo
  RETURN colors[(abs(hash_value) % array_length(colors, 1)) + 1];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing favorites with generated colors based on account_number
UPDATE favorites
SET avatar_color = generate_avatar_color(account_number)
WHERE avatar_color IS NULL;

-- Add trigger to automatically set avatar_color on insert if not provided
CREATE OR REPLACE FUNCTION set_favorite_avatar_color()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_color IS NULL THEN
    NEW.avatar_color := generate_avatar_color(NEW.account_number);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_favorite_avatar_color
BEFORE INSERT ON favorites
FOR EACH ROW
EXECUTE FUNCTION set_favorite_avatar_color();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_avatar_color TO authenticated;
