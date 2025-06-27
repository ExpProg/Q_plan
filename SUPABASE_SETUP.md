# Настройка Supabase для QPlan

## Инструкции по настройке базы данных

### 1. Создание структуры БД

1. Войдите в консоль Supabase: https://xtvtofvxkqvovcfuoudq.supabase.co
2. Перейдите в раздел **SQL Editor**
3. Скопируйте содержимое файла `supabase-schema.sql` и выполните его

Этот скрипт создаст:
- 9 таблиц со всеми необходимыми связями
- Индексы для оптимизации запросов
- Триггеры для автоматического обновления `updated_at`
- Row Level Security политики
- Функции для автоматизации

### 2. Заполнение начальными данными

1. В том же **SQL Editor** выполните содержимое файла `supabase-seed.sql`

Этот скрипт добавит:
- 3 команды (Frontend, Backend, DevOps)
- 4 квартала на 2025 год (Q1'25 - Q4'25)
- 5 ролей (Frontend Developer, Backend Developer, DevOps Engineer, Team Lead, QA Engineer)
- 4 участника команд
- Capacity настройки для всех участников и команд
- 24 основных варианта планирования (3 команды × 4 квартала × 2 режима)
- 2 примерные задачи

### 3. Структура таблиц

#### teams
- `id` (UUID, PK)
- `name` (VARCHAR)
- `color` (VARCHAR) - HEX цвет команды
- `created_at` (TIMESTAMP)

#### quarters
- `id` (UUID, PK)
- `name` (VARCHAR) - название квартала
- `start_date` (DATE) - дата начала
- `end_date` (DATE) - дата окончания
- `created_at` (TIMESTAMP)

#### roles
- `id` (UUID, PK)
- `name` (VARCHAR) - название роли
- `description` (TEXT) - описание роли
- `created_at` (TIMESTAMP)

#### team_members
- `id` (UUID, PK)
- `name` (VARCHAR) - имя участника
- `email` (VARCHAR, UNIQUE) - email участника
- `team_id` (UUID, FK → teams.id)
- `role_id` (UUID, FK → roles.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### plan_variants
- `id` (UUID, PK)
- `name` (VARCHAR) - название варианта
- `team_id` (UUID, FK → teams.id)
- `quarter_id` (UUID, FK → quarters.id)
- `is_express` (BOOLEAN) - экспресс/детальный режим
- `is_main` (BOOLEAN) - основной вариант
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### tasks
- `id` (UUID, PK)
- `title` (VARCHAR) - название задачи
- `description` (TEXT) - описание задачи
- `team_id` (UUID, FK → teams.id)
- `quarter_id` (UUID, FK → quarters.id, nullable)
- `plan_variant_id` (UUID, FK → plan_variants.id, nullable)
- `is_planned` (BOOLEAN) - запланирована или в бэклоге
- `impact` (INTEGER 1-10) - оценка Impact
- `confidence` (INTEGER 1-10) - оценка Confidence
- `ease` (INTEGER 1-10) - оценка Ease
- `express_estimate` (DECIMAL) - экспресс-оценка
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### member_capacities
- `id` (UUID, PK)
- `member_id` (UUID, FK → team_members.id)
- `quarter_id` (UUID, FK → quarters.id)
- `capacity` (DECIMAL) - capacity участника в человеко-спринтах
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE(member_id, quarter_id)

#### team_capacities (legacy)
- `id` (UUID, PK)
- `team_id` (UUID, FK → teams.id)
- `quarter_id` (UUID, FK → quarters.id)
- `capacity` (DECIMAL) - capacity команды в человеко-спринтах
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE(team_id, quarter_id)

#### task_role_capacities
- `id` (UUID, PK)
- `task_id` (UUID, FK → tasks.id)
- `role_id` (UUID, FK → roles.id)
- `capacity` (DECIMAL) - требуемый capacity роли для задачи
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE(task_id, role_id)

### 4. Безопасность

Все таблицы настроены с Row Level Security (RLS). Текущие политики разрешают все операции для анонимных пользователей (anon роль). 

**Важно**: В продакшене следует настроить более строгие политики безопасности.

### 5. Индексы

Созданы индексы для оптимизации наиболее частых запросов:
- Поиск задач по команде, кварталу, варианту планирования
- Поиск участников команд по команде и роли
- Поиск вариантов планирования по команде и кварталу
- И другие оптимизации

### 6. Автоматизация

- Автоматическое обновление `updated_at` при изменении записей
- UUID генерация для всех первичных ключей
- Проверочные ограничения для оценок ICE (1-10)

## Подключение к приложению

Приложение использует:
- **Project URL**: https://xtvtofvxkqvovcfuoudq.supabase.co
- **API Key**: Anon public key для клиентских запросов

Все настройки подключения находятся в файле `src/lib/supabase.ts`.

Сервисы для работы с данными находятся в `src/services/supabaseService.ts`. 