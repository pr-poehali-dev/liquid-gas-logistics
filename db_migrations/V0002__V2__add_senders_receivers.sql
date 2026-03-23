
-- Справочник грузоотправителей
CREATE TABLE IF NOT EXISTS senders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    inn VARCHAR(20),
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник грузополучателей
CREATE TABLE IF NOT EXISTS receivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    inn VARCHAR(20),
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Начальные данные
INSERT INTO senders (name, inn, address) VALUES
('ООО "АзотСервис"', '7700000001', 'г. Москва, ул. Промышленная, д. 1');

INSERT INTO receivers (name, inn, address) VALUES
('ООО "ХимПром"', '7700000002', 'г. Москва, ул. Заводская, д. 5');
