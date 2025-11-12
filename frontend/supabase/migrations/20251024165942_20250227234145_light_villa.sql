/*
  # Update RLS policies for public access

  1. Changes
    - Update RLS policies to allow public access to counters and counter_actions
    - Remove authentication requirements from policies
  
  2. Security
    - Allow public read/write access to counters and counter_actions
    - This is necessary for the application to work without authentication
*/

-- Drop existing policies for counters
DROP POLICY IF EXISTS "Users can read their own counters" ON counters;
DROP POLICY IF EXISTS "Users can insert their own counters" ON counters;
DROP POLICY IF EXISTS "Users can update their own counters" ON counters;

-- Create new public policies for counters
CREATE POLICY "Public can read counters"
  ON counters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert counters"
  ON counters
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update counters"
  ON counters
  FOR UPDATE
  TO public
  USING (true);

-- Drop existing policies for counter_actions
DROP POLICY IF EXISTS "Users can read their own counter actions" ON counter_actions;
DROP POLICY IF EXISTS "Users can insert their own counter actions" ON counter_actions;

-- Create new public policies for counter_actions
CREATE POLICY "Public can read counter actions"
  ON counter_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert counter actions"
  ON counter_actions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can delete counter actions"
  ON counter_actions
  FOR DELETE
  TO public
  USING (true);