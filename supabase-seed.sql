-- Начальные данные для QPlan

-- 1. Добавляем команды
INSERT INTO teams (id, name, color) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Frontend', '#3b82f6'),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Backend', '#10b981'),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'DevOps', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- 2. Добавляем кварталы на 2025 год
INSERT INTO quarters (id, name, start_date, end_date) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Q1''25', '2025-01-01', '2025-03-31'),
('550e8400-e29b-41d4-a716-446655440002', 'Q2''25', '2025-04-01', '2025-06-30'),
('550e8400-e29b-41d4-a716-446655440003', 'Q3''25', '2025-07-01', '2025-09-30'),
('550e8400-e29b-41d4-a716-446655440004', 'Q4''25', '2025-10-01', '2025-12-31')
ON CONFLICT (id) DO NOTHING;

-- 3. Добавляем роли
INSERT INTO roles (id, name, description) VALUES 
('123e4567-e89b-12d3-a456-426614174001', 'Frontend Developer', 'Разработчик пользовательского интерфейса'),
('123e4567-e89b-12d3-a456-426614174002', 'Backend Developer', 'Разработчик серверной части'),
('123e4567-e89b-12d3-a456-426614174003', 'DevOps Engineer', 'Инженер по эксплуатации'),
('123e4567-e89b-12d3-a456-426614174004', 'Team Lead', 'Руководитель команды'),
('123e4567-e89b-12d3-a456-426614174005', 'QA Engineer', 'Инженер по тестированию')
ON CONFLICT (id) DO NOTHING;

-- 4. Добавляем участников команд
INSERT INTO team_members (id, name, email, team_id, role_id) VALUES 
('456e7890-e89b-12d3-a456-426614174001', 'Анна Иванова', 'anna@example.com', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '123e4567-e89b-12d3-a456-426614174001'),
('456e7890-e89b-12d3-a456-426614174002', 'Сергей Петров', 'sergey@example.com', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '123e4567-e89b-12d3-a456-426614174004'),
('456e7890-e89b-12d3-a456-426614174003', 'Елена Сидорова', 'elena@example.com', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '123e4567-e89b-12d3-a456-426614174002'),
('456e7890-e89b-12d3-a456-426614174004', 'Михаил Козлов', 'mikhail@example.com', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', '123e4567-e89b-12d3-a456-426614174003')
ON CONFLICT (email) DO NOTHING;

-- 5. Добавляем capacity участников для всех кварталов
INSERT INTO member_capacities (member_id, quarter_id, capacity) 
SELECT 
    m.id as member_id,
    q.id as quarter_id,
    2.0 as capacity -- Дефолтное capacity 2 человеко-спринта за квартал
FROM team_members m
CROSS JOIN quarters q
ON CONFLICT (member_id, quarter_id) DO NOTHING;

-- 6. Добавляем capacity команд для всех кварталов (legacy)
INSERT INTO team_capacities (team_id, quarter_id, capacity) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440001', 8.0), -- Frontend Q1
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440002', 8.0), -- Frontend Q2
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440003', 8.0), -- Frontend Q3
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440004', 8.0), -- Frontend Q4
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', 10.0), -- Backend Q1
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440002', 10.0), -- Backend Q2
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440003', 10.0), -- Backend Q3
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440004', 10.0), -- Backend Q4
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', 6.0), -- DevOps Q1
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440002', 6.0), -- DevOps Q2
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440003', 6.0), -- DevOps Q3
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440004', 6.0)  -- DevOps Q4
ON CONFLICT (team_id, quarter_id) DO NOTHING;

-- 7. Создаем основные варианты планирования для всех сочетаний команда-квартал-режим
WITH variant_data AS (
  SELECT 
    t.id as team_id,
    q.id as quarter_id,
    'Основной' as name,
    mode.is_express,
    true as is_main
  FROM teams t
  CROSS JOIN quarters q
  CROSS JOIN (VALUES (true), (false)) AS mode(is_express)
)
INSERT INTO plan_variants (team_id, quarter_id, name, is_express, is_main)
SELECT team_id, quarter_id, name, is_express, is_main
FROM variant_data
ON CONFLICT DO NOTHING;

-- 8. Добавляем примерные задачи
INSERT INTO tasks (id, title, description, team_id, quarter_id, is_planned, impact, confidence, ease, express_estimate) VALUES 
('789e0123-e89b-12d3-a456-426614174001', 'Внедрить систему аутентификации', 'Разработать и интегрировать OAuth 2.0', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440001', true, 9, 7, 5, 2.5),
('789e0123-e89b-12d3-a456-426614174002', 'Оптимизировать базу данных', 'Провести анализ и оптимизацию запросов', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', NULL, false, 8, 8, 6, 1.0)
ON CONFLICT (id) DO NOTHING;

-- 9. Добавляем capacity по ролям для задач
INSERT INTO task_role_capacities (task_id, role_id, capacity) VALUES 
('789e0123-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', 1.5), -- OAuth - Frontend Developer
('789e0123-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174004', 0.5)  -- OAuth - Team Lead
ON CONFLICT (task_id, role_id) DO NOTHING; 