
-- Справочник водителей
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(50),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник рабочих по отгрузке
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    position VARCHAR(100) DEFAULT 'Рабочий по отгрузке',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник ответственных лиц
CREATE TABLE IF NOT EXISTS responsible_persons (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    position VARCHAR(100) DEFAULT 'Ответственное лицо',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник транспортных средств
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    reg_number VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    vehicle_type VARCHAR(50) DEFAULT 'Грузовой автомобиль',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник прицепов
CREATE TABLE IF NOT EXISTS trailers (
    id SERIAL PRIMARY KEY,
    reg_number VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    capacity_liters NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Справочник товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'л',
    danger_class VARCHAR(10),
    un_number VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Сертификаты качества и документы безопасности
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    cert_number VARCHAR(100) NOT NULL,
    cert_type VARCHAR(100) NOT NULL,
    issued_by VARCHAR(200),
    issued_date DATE,
    expires_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Основная таблица отгрузок
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    shipment_date TIMESTAMP NOT NULL,
    product_id INTEGER REFERENCES products(id),
    quantity NUMERIC(12,3) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    trailer_id INTEGER REFERENCES trailers(id),
    driver_id INTEGER REFERENCES drivers(id),
    worker_id INTEGER REFERENCES workers(id),
    responsible_id INTEGER REFERENCES responsible_persons(id),
    certificate_id INTEGER REFERENCES certificates(id),
    sender_org VARCHAR(300),
    receiver_org VARCHAR(300),
    loading_point TEXT,
    unloading_point TEXT,
    cargo_description TEXT,
    special_conditions TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Начальные данные — товары
INSERT INTO products (name, product_code, unit, danger_class, un_number) VALUES
('Азот жидкий', 'N2-L', 'л', '2.2', 'UN1977'),
('Кислород жидкий', 'O2-L', 'л', '2.2', 'UN1073');

-- Начальные данные — примеры справочников
INSERT INTO drivers (full_name, license_number, phone) VALUES
('Иванов И.И.', 'АА 123456', '+7-900-000-0001'),
('Петров П.П.', 'ВВ 654321', '+7-900-000-0002');

INSERT INTO workers (full_name, position) VALUES
('Сидоров С.С.', 'Рабочий по отгрузке'),
('Кузнецов К.К.', 'Оператор погрузки');

INSERT INTO responsible_persons (full_name, position) VALUES
('Николаев Н.Н.', 'Начальник склада'),
('Морозов М.М.', 'Технический директор');

INSERT INTO vehicles (reg_number, brand, vehicle_type) VALUES
('А 123 БВ 77', 'МАЗ-5340', 'Седельный тягач'),
('В 456 ГД 78', 'КАМАЗ-65116', 'Грузовой автомобиль');

INSERT INTO trailers (reg_number, brand, capacity_liters) VALUES
('АА 1234 77', 'ППЦМ-50', 50000),
('ВВ 5678 78', 'ППЦМ-30', 30000);
