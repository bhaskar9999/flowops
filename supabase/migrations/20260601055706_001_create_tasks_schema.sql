/*
  # Create Tasks Schema

  1. New Tables
    - `users` - Stores user profiles
      - `id` (uuid, primary key) - User ID from auth.users
      - `email` (text, unique) - User email
      - `created_at` (timestamp) - Account creation time

    - `tasks` - Stores task data
      - `id` (uuid, primary key) - Task ID
      - `user_id` (uuid, foreign key) - Owner of the task
      - `title` (text) - Task title
      - `description` (text) - Optional task description
      - `status` (text) - Task status: "todo", "in_progress", "done"
      - `priority` (text) - Task priority: "low", "medium", "high"
      - `order` (integer) - Display order within status
      - `created_at` (timestamp) - Task creation time
      - `updated_at` (timestamp) - Last update time

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own data
    - Implement policies for select, insert, update, delete operations

  3. Indexes
    - Index on tasks.user_id and tasks.status for efficient querying
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);