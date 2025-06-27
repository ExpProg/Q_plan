-- Создание таблиц для QPlan в Supabase

-- 1. Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL, -- HEX цвет
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица кварталов
CREATE TABLE IF NOT EXISTS quarters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Таблица участников команд
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Таблица вариантов планирования
CREATE TABLE IF NOT EXISTS plan_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    is_express BOOLEAN DEFAULT true,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    quarter_id UUID REFERENCES quarters(id) ON DELETE SET NULL,
    plan_variant_id UUID REFERENCES plan_variants(id) ON DELETE SET NULL,
    is_planned BOOLEAN DEFAULT false,
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 10),
    confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 10),
    ease INTEGER NOT NULL CHECK (ease >= 1 AND ease <= 10),
    express_estimate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Таблица capacity участников по кварталам
CREATE TABLE IF NOT EXISTS member_capacities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    capacity DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, quarter_id)
);

-- 8. Таблица capacity команд по кварталам (legacy, для обратной совместимости)
CREATE TABLE IF NOT EXISTS team_capacities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    capacity DECIMAL(5,2) NOT NULL DEFAULT 8.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, quarter_id)
);

-- 9. Таблица capacity задач по ролям
CREATE TABLE IF NOT EXISTS task_role_capacities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    capacity DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, role_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_quarter_id ON tasks(quarter_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plan_variant_id ON tasks(plan_variant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_planned ON tasks(is_planned);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role_id ON team_members(role_id);
CREATE INDEX IF NOT EXISTS idx_plan_variants_team_quarter ON plan_variants(team_id, quarter_id);
CREATE INDEX IF NOT EXISTS idx_member_capacities_member_quarter ON member_capacities(member_id, quarter_id);
CREATE INDEX IF NOT EXISTS idx_team_capacities_team_quarter ON team_capacities(team_id, quarter_id);
CREATE INDEX IF NOT EXISTS idx_task_role_capacities_task_role ON task_role_capacities(task_id, role_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_variants_updated_at BEFORE UPDATE ON plan_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_capacities_updated_at BEFORE UPDATE ON member_capacities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_capacities_updated_at BEFORE UPDATE ON team_capacities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_role_capacities_updated_at BEFORE UPDATE ON task_role_capacities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security для всех таблиц
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_capacities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_capacities ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_role_capacities ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа (пока разрешаем все для anon роли)
-- В продакшене следует настроить более строгие политики

-- Политики для teams
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON teams FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON teams FOR DELETE USING (true);

-- Политики для quarters
CREATE POLICY "Enable read access for all users" ON quarters FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON quarters FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON quarters FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON quarters FOR DELETE USING (true);

-- Политики для roles
CREATE POLICY "Enable read access for all users" ON roles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON roles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON roles FOR DELETE USING (true);

-- Политики для team_members
CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON team_members FOR DELETE USING (true);

-- Политики для plan_variants
CREATE POLICY "Enable read access for all users" ON plan_variants FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON plan_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON plan_variants FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON plan_variants FOR DELETE USING (true);

-- Политики для tasks
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);

-- Политики для member_capacities
CREATE POLICY "Enable read access for all users" ON member_capacities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON member_capacities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON member_capacities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON member_capacities FOR DELETE USING (true);

-- Политики для team_capacities
CREATE POLICY "Enable read access for all users" ON team_capacities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON team_capacities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON team_capacities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON team_capacities FOR DELETE USING (true);

-- Политики для task_role_capacities
CREATE POLICY "Enable read access for all users" ON task_role_capacities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON task_role_capacities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON task_role_capacities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON task_role_capacities FOR DELETE USING (true); 