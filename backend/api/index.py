"""
API для системы управления отгрузками жидкого азота и кислорода.
Поддерживает операции с отгрузками, справочниками и формирование ТН.
"""
import json
import os
import psycopg2
from datetime import datetime, date

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Content-Type': 'application/json'
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f'Type {type(obj)} not serializable')

def resp(status, data):
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps(data, default=json_serial, ensure_ascii=False)
    }

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()

    try:
        # ===== СПРАВОЧНИКИ =====

        # GET /drivers
        if path == '/drivers' and method == 'GET':
            cur.execute("SELECT id, full_name, license_number, phone, is_active FROM drivers WHERE is_active = TRUE ORDER BY full_name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'full_name': r[1], 'license_number': r[2], 'phone': r[3], 'is_active': r[4]} for r in rows])

        # POST /drivers
        if path == '/drivers' and method == 'POST':
            cur.execute("INSERT INTO drivers (full_name, license_number, phone) VALUES (%s, %s, %s) RETURNING id",
                        (body['full_name'], body.get('license_number', ''), body.get('phone', '')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Водитель добавлен'})

        # GET /workers
        if path == '/workers' and method == 'GET':
            cur.execute("SELECT id, full_name, position, is_active FROM workers WHERE is_active = TRUE ORDER BY full_name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'full_name': r[1], 'position': r[2], 'is_active': r[3]} for r in rows])

        # POST /workers
        if path == '/workers' and method == 'POST':
            cur.execute("INSERT INTO workers (full_name, position) VALUES (%s, %s) RETURNING id",
                        (body['full_name'], body.get('position', 'Рабочий по отгрузке')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Рабочий добавлен'})

        # GET /responsible
        if path == '/responsible' and method == 'GET':
            cur.execute("SELECT id, full_name, position, is_active FROM responsible_persons WHERE is_active = TRUE ORDER BY full_name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'full_name': r[1], 'position': r[2], 'is_active': r[3]} for r in rows])

        # POST /responsible
        if path == '/responsible' and method == 'POST':
            cur.execute("INSERT INTO responsible_persons (full_name, position) VALUES (%s, %s) RETURNING id",
                        (body['full_name'], body.get('position', 'Ответственное лицо')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Ответственное лицо добавлено'})

        # GET /vehicles
        if path == '/vehicles' and method == 'GET':
            cur.execute("SELECT id, reg_number, brand, vehicle_type, is_active FROM vehicles WHERE is_active = TRUE ORDER BY reg_number")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'reg_number': r[1], 'brand': r[2], 'vehicle_type': r[3], 'is_active': r[4]} for r in rows])

        # POST /vehicles
        if path == '/vehicles' and method == 'POST':
            cur.execute("INSERT INTO vehicles (reg_number, brand, vehicle_type) VALUES (%s, %s, %s) RETURNING id",
                        (body['reg_number'], body.get('brand', ''), body.get('vehicle_type', 'Грузовой автомобиль')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'ТС добавлено'})

        # GET /trailers
        if path == '/trailers' and method == 'GET':
            cur.execute("SELECT id, reg_number, brand, capacity_liters, is_active FROM trailers WHERE is_active = TRUE ORDER BY reg_number")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'reg_number': r[1], 'brand': r[2], 'capacity_liters': float(r[3]) if r[3] else None, 'is_active': r[4]} for r in rows])

        # POST /trailers
        if path == '/trailers' and method == 'POST':
            cur.execute("INSERT INTO trailers (reg_number, brand, capacity_liters) VALUES (%s, %s, %s) RETURNING id",
                        (body['reg_number'], body.get('brand', ''), body.get('capacity_liters')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Прицеп добавлен'})

        # GET /products
        if path == '/products' and method == 'GET':
            cur.execute("SELECT id, name, product_code, unit, danger_class, un_number FROM products WHERE is_active = TRUE ORDER BY name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'name': r[1], 'product_code': r[2], 'unit': r[3], 'danger_class': r[4], 'un_number': r[5]} for r in rows])

        # POST /products
        if path == '/products' and method == 'POST':
            cur.execute("INSERT INTO products (name, product_code, unit, danger_class, un_number) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (body['name'], body.get('product_code', ''), body.get('unit', 'л'), body.get('danger_class', ''), body.get('un_number', '')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Товар добавлен'})

        # GET /senders
        if path == '/senders' and method == 'GET':
            cur.execute("SELECT id, name, inn, address, phone, is_active FROM senders WHERE is_active = TRUE ORDER BY name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'name': r[1], 'inn': r[2], 'address': r[3], 'phone': r[4], 'is_active': r[5]} for r in rows])

        # POST /senders
        if path == '/senders' and method == 'POST':
            cur.execute("INSERT INTO senders (name, inn, address, phone) VALUES (%s, %s, %s, %s) RETURNING id",
                        (body['name'], body.get('inn', ''), body.get('address', ''), body.get('phone', '')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Грузоотправитель добавлен'})

        # GET /receivers
        if path == '/receivers' and method == 'GET':
            cur.execute("SELECT id, name, inn, address, phone, is_active FROM receivers WHERE is_active = TRUE ORDER BY name")
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'name': r[1], 'inn': r[2], 'address': r[3], 'phone': r[4], 'is_active': r[5]} for r in rows])

        # POST /receivers
        if path == '/receivers' and method == 'POST':
            cur.execute("INSERT INTO receivers (name, inn, address, phone) VALUES (%s, %s, %s, %s) RETURNING id",
                        (body['name'], body.get('inn', ''), body.get('address', ''), body.get('phone', '')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Грузополучатель добавлен'})

        # ===== СЕРТИФИКАТЫ =====

        # GET /certificates
        if path == '/certificates' and method == 'GET':
            cur.execute("""
                SELECT c.id, c.cert_number, c.cert_type, c.issued_by, c.issued_date, c.expires_date,
                       c.notes, c.is_active, p.name as product_name, c.product_id
                FROM certificates c
                LEFT JOIN products p ON p.id = c.product_id
                ORDER BY c.issued_date DESC
            """)
            rows = cur.fetchall()
            return resp(200, [{'id': r[0], 'cert_number': r[1], 'cert_type': r[2], 'issued_by': r[3],
                               'issued_date': r[4], 'expires_date': r[5], 'notes': r[6],
                               'is_active': r[7], 'product_name': r[8], 'product_id': r[9]} for r in rows])

        # POST /certificates
        if path == '/certificates' and method == 'POST':
            cur.execute("""INSERT INTO certificates (product_id, cert_number, cert_type, issued_by, issued_date, expires_date, notes)
                           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                        (body.get('product_id'), body['cert_number'], body['cert_type'],
                         body.get('issued_by', ''), body.get('issued_date'), body.get('expires_date'), body.get('notes', '')))
            new_id = cur.fetchone()[0]
            conn.commit()
            return resp(201, {'id': new_id, 'message': 'Сертификат добавлен'})

        # ===== ОТГРУЗКИ =====

        # GET /shipments
        if path == '/shipments' and method == 'GET':
            search = params.get('search', '')
            product_id = params.get('product_id', '')
            date_from = params.get('date_from', '')
            date_to = params.get('date_to', '')

            where_clauses = []
            q_params = []

            if search:
                where_clauses.append("(s.shipment_number ILIKE %s OR d.full_name ILIKE %s OR v.reg_number ILIKE %s)")
                q_params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
            if product_id:
                where_clauses.append("s.product_id = %s")
                q_params.append(product_id)
            if date_from:
                where_clauses.append("s.shipment_date >= %s")
                q_params.append(date_from)
            if date_to:
                where_clauses.append("s.shipment_date <= %s")
                q_params.append(date_to + ' 23:59:59')

            where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            query = f"""
                SELECT s.id, s.shipment_number, s.shipment_date, s.quantity, s.status,
                       p.name as product_name, p.unit,
                       v.reg_number as vehicle_reg, t.reg_number as trailer_reg,
                       d.full_name as driver_name, w.full_name as worker_name,
                       r.full_name as responsible_name,
                       s.sender_org, s.receiver_org
                FROM shipments s
                LEFT JOIN products p ON p.id = s.product_id
                LEFT JOIN vehicles v ON v.id = s.vehicle_id
                LEFT JOIN trailers t ON t.id = s.trailer_id
                LEFT JOIN drivers d ON d.id = s.driver_id
                LEFT JOIN workers w ON w.id = s.worker_id
                LEFT JOIN responsible_persons r ON r.id = s.responsible_id
                {where_sql}
                ORDER BY s.shipment_date DESC
                LIMIT 200
            """
            cur.execute(query, q_params)
            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    'id': r[0], 'shipment_number': r[1], 'shipment_date': r[2],
                    'quantity': float(r[3]), 'status': r[4],
                    'product_name': r[5], 'unit': r[6],
                    'vehicle_reg': r[7], 'trailer_reg': r[8],
                    'driver_name': r[9], 'worker_name': r[10],
                    'responsible_name': r[11],
                    'sender_org': r[12], 'receiver_org': r[13]
                })
            return resp(200, result)

        # GET /shipments/{id}
        if path.startswith('/shipments/') and method == 'GET':
            ship_id = path.split('/')[-1]
            cur.execute("""
                SELECT s.*, p.name as product_name, p.unit, p.danger_class, p.un_number,
                       v.reg_number as vehicle_reg, v.brand as vehicle_brand,
                       t.reg_number as trailer_reg, t.brand as trailer_brand,
                       d.full_name as driver_name, d.license_number,
                       w.full_name as worker_name,
                       r.full_name as responsible_name,
                       c.cert_number, c.cert_type, c.issued_date, c.expires_date
                FROM shipments s
                LEFT JOIN products p ON p.id = s.product_id
                LEFT JOIN vehicles v ON v.id = s.vehicle_id
                LEFT JOIN trailers t ON t.id = s.trailer_id
                LEFT JOIN drivers d ON d.id = s.driver_id
                LEFT JOIN workers w ON w.id = s.worker_id
                LEFT JOIN responsible_persons r ON r.id = s.responsible_id
                LEFT JOIN certificates c ON c.id = s.certificate_id
                WHERE s.id = %s
            """, (ship_id,))
            row = cur.fetchone()
            if not row:
                return resp(404, {'error': 'Отгрузка не найдена'})
            cols = [desc[0] for desc in cur.description]
            data = dict(zip(cols, row))
            return resp(200, data)

        # POST /shipments
        if path == '/shipments' and method == 'POST':
            now = datetime.now()
            ship_num = body.get('shipment_number') or f"ТН-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"
            cur.execute("""
                INSERT INTO shipments (shipment_number, shipment_date, product_id, quantity,
                    vehicle_id, trailer_id, driver_id, worker_id, responsible_id, certificate_id,
                    sender_org, receiver_org, loading_point, unloading_point,
                    cargo_description, special_conditions, status, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, shipment_number
            """, (
                ship_num, body.get('shipment_date', now.isoformat()),
                body.get('product_id'), body.get('quantity', 0),
                body.get('vehicle_id'), body.get('trailer_id'),
                body.get('driver_id'), body.get('worker_id'),
                body.get('responsible_id'), body.get('certificate_id'),
                body.get('sender_org', ''), body.get('receiver_org', ''),
                body.get('loading_point', ''), body.get('unloading_point', ''),
                body.get('cargo_description', ''), body.get('special_conditions', ''),
                body.get('status', 'completed'), body.get('notes', '')
            ))
            row = cur.fetchone()
            conn.commit()
            return resp(201, {'id': row[0], 'shipment_number': row[1], 'message': 'Отгрузка зарегистрирована'})

        # PUT /shipments/{id}
        if path.startswith('/shipments/') and method == 'PUT':
            ship_id = path.split('/')[-1]
            cur.execute("""
                UPDATE shipments SET
                    shipment_date = %s, product_id = %s, quantity = %s,
                    vehicle_id = %s, trailer_id = %s, driver_id = %s,
                    worker_id = %s, responsible_id = %s, certificate_id = %s,
                    sender_org = %s, receiver_org = %s,
                    loading_point = %s, unloading_point = %s,
                    cargo_description = %s, special_conditions = %s,
                    status = %s, notes = %s, updated_at = NOW()
                WHERE id = %s
            """, (
                body.get('shipment_date'), body.get('product_id'), body.get('quantity'),
                body.get('vehicle_id'), body.get('trailer_id'), body.get('driver_id'),
                body.get('worker_id'), body.get('responsible_id'), body.get('certificate_id'),
                body.get('sender_org', ''), body.get('receiver_org', ''),
                body.get('loading_point', ''), body.get('unloading_point', ''),
                body.get('cargo_description', ''), body.get('special_conditions', ''),
                body.get('status', 'completed'), body.get('notes', ''),
                ship_id
            ))
            conn.commit()
            return resp(200, {'message': 'Отгрузка обновлена'})

        # DELETE /shipments/{id}
        if path.startswith('/shipments/') and method == 'DELETE':
            ship_id = path.split('/')[-1]
            cur.execute("DELETE FROM shipments WHERE id = %s", (ship_id,))
            conn.commit()
            return resp(200, {'message': 'Отгрузка удалена'})

        # ===== СТАТИСТИКА =====

        # GET /stats
        if path == '/stats' and method == 'GET':
            cur.execute("""
                SELECT p.name, SUM(s.quantity), COUNT(s.id), p.unit
                FROM shipments s
                JOIN products p ON p.id = s.product_id
                GROUP BY p.id, p.name, p.unit
                ORDER BY p.name
            """)
            rows = cur.fetchall()
            by_product = [{'product': r[0], 'total_quantity': float(r[1]), 'count': r[2], 'unit': r[3]} for r in rows]

            cur.execute("""
                SELECT DATE(shipment_date) as dt, p.name, SUM(s.quantity)
                FROM shipments s
                JOIN products p ON p.id = s.product_id
                WHERE shipment_date >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(shipment_date), p.id, p.name
                ORDER BY dt DESC
            """)
            rows = cur.fetchall()
            by_date = [{'date': r[0], 'product': r[1], 'quantity': float(r[2])} for r in rows]

            cur.execute("SELECT COUNT(*) FROM shipments")
            total = cur.fetchone()[0]

            return resp(200, {'by_product': by_product, 'by_date': by_date, 'total_shipments': total})

        return resp(404, {'error': 'Метод не найден'})

    except Exception as e:
        conn.rollback()
        return resp(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()