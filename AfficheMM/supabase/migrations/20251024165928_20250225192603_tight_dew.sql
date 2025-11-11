/*
  # Initial schema setup for counter application

  1. New Tables
    - `counters`
      - `id` (uuid, primary key)
      - `value` (integer, current counter value)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `counter_actions`
      - `id` (uuid, primary key)
      - `counter_id` (uuid, foreign key to counters)
      - `action_type` (text, one of: 'increment', 'decrement', 'reset')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and modify their own data
*/

-- Create counters table
CREATE TABLE IF NOT EXISTS counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create counter_actions table
CREATE TABLE IF NOT EXISTS counter_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_id uuid REFERENCES counters(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('increment', 'decrement', 'reset')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for counters table
CREATE POLICY "Users can read their own counters"
  ON counters
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT counter_id FROM counter_actions WHERE counter_id = id
  ));

CREATE POLICY "Users can insert their own counters"
  ON counters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own counters"
  ON counters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT counter_id FROM counter_actions WHERE counter_id = id
  ));

-- Create policies for counter_actions table
CREATE POLICY "Users can read their own counter actions"
  ON counter_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = counter_id);

CREATE POLICY "Users can insert their own counter actions"
  ON counter_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = counter_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_counters_updated_at
  BEFORE UPDATE ON counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();