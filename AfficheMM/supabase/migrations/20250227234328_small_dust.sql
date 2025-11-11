/*
  # Enable Realtime for counters and counter_actions tables

  1. Changes
    - Enable Realtime functionality for the counters and counter_actions tables
    - This allows clients to subscribe to changes in these tables
  
  2. Security
    - Realtime is enabled for public access
    - This is necessary for the display page to update in real-time
*/

-- Enable realtime for counters table
ALTER PUBLICATION supabase_realtime ADD TABLE counters;

-- Enable realtime for counter_actions table
ALTER PUBLICATION supabase_realtime ADD TABLE counter_actions;