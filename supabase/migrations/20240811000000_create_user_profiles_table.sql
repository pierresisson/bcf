-- Fonction pour le trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 120),
  occupation TEXT,
  living_arrangement TEXT CHECK (living_arrangement IN ('Appartement', 'Maison', 'Colocation', 'Autre')),
  family_status TEXT CHECK (family_status IN ('Célibataire', 'En couple', 'Marié(e)', 'Avec enfants')),
  wake_up_time TIME,
  sleep_time TIME,
  work_hours TEXT,
  diet_preference TEXT CHECK (diet_preference IN ('Omnivore', 'Végétarien', 'Végétalien', 'Autre')),
  hobbies TEXT,
  sports_activities TEXT[],
  health_goal TEXT,
  career_goal TEXT,
  personal_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);