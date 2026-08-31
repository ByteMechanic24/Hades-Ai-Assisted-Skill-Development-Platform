ALTER TABLE learning_path_nodes ADD COLUMN IF NOT EXISTS resources_json TEXT DEFAULT '[]';
