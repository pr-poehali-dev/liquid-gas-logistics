import { useState, useEffect } from 'react';
import { api, Product, Driver, Worker, Responsible, Vehicle, Trailer, Certificate } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

export default function NewShipment({ onSuccess, onCancel }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [responsible, setResponsible] = useState<Responsible[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    vehicle_id: '',
    trailer_id: '',
    driver_id: '',
    worker_id: '',
    responsible_id: '',
    certificate_id: '',
    shipment_date: new Date().toISOString().slice(0, 16),
    sender_org: '',
    receiver_org: '',
    loading_point: '',
    unloading_point: '',
    cargo_description: '',
    special_conditions: '',
    notes: '',
    status: 'completed',
  });

  useEffect(() => {
    Promise.all([
      api.get<Product[]>('/products'),
      api.get<Driver[]>('/drivers'),
      api.get<Worker[]>('/workers'),
      api.get<Responsible[]>('/responsible'),
      api.get<Vehicle[]>('/vehicles'),
      api.get<Trailer[]>('/trailers'),
      api.get<Certificate[]>('/certificates'),
    ]).then(([p, d, w, r, v, t, c]) => {
      setProducts(p); setDrivers(d); setWorkers(w);
      setResponsible(r); setVehicles(v); setTrailers(t); setCertificates(c);
    }).catch(console.error);
  }, []);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity || !form.vehicle_id || !form.driver_id) {
      setError('Заполните обязательные поля: товар, количество, транспорт, водитель');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        vehicle_id: Number(form.vehicle_id),
        trailer_id: form.trailer_id ? Number(form.trailer_id) : null,
        driver_id: Number(form.driver_id),
        worker_id: form.worker_id ? Number(form.worker_id) : null,
        responsible_id: form.responsible_id ? Number(form.responsible_id) : null,
        certificate_id: form.certificate_id ? Number(form.certificate_id) : null,
      };
      const res = await api.post<{ id: number }>('/shipments', payload);
      onSuccess(res.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex items-center gap-2">
          <Icon name="AlertCircle" size={14} />
          {error}
        </div>
      )}

      {/* Блок 1: Товар и количество */}
      <div className="bg-white border border-border rounded p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="Package" size={14} />1. Груз
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Наименование товара" required>
              <Select value={form.product_id} onValueChange={v => set('product_id', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите товар" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — кл. {p.danger_class} / {p.un_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Количество, л" required>
            <Input type="number" min="0" step="0.001" value={form.quantity} onChange={e => set('quantity', e.target.value)} className="h-8 text-sm font-mono-nums" placeholder="0.000" />
          </Field>
          <div className="col-span-3">
            <Field label="Сертификат качества">
              <Select value={form.certificate_id} onValueChange={v => set('certificate_id', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Без сертификата" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без сертификата</SelectItem>
                  {certificates.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.cert_number} — {c.cert_type} ({c.product_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </div>

      {/* Блок 2: Транспорт */}
      <div className="bg-white border border-border rounded p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="Truck" size={14} />2. Транспортное средство
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Дата и время отгрузки" required>
            <Input type="datetime-local" value={form.shipment_date} onChange={e => set('shipment_date', e.target.value)} className="h-8 text-sm" />
          </Field>
          <Field label="Государственный рег. номер ТС" required>
            <Select value={form.vehicle_id} onValueChange={v => set('vehicle_id', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите ТС" /></SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={String(v.id)}>{v.reg_number} — {v.brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Государственный рег. номер прицепа">
            <Select value={form.trailer_id} onValueChange={v => set('trailer_id', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Без прицепа" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без прицепа</SelectItem>
                {trailers.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.reg_number} — {t.brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Блок 3: Персонал */}
      <div className="bg-white border border-border rounded p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="Users" size={14} />3. Персонал
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Водитель (ФИО)" required>
            <Select value={form.driver_id} onValueChange={v => set('driver_id', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите водителя" /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Рабочий по отгрузке (ФИО)">
            <Select value={form.worker_id} onValueChange={v => set('worker_id', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите рабочего" /></SelectTrigger>
              <SelectContent>
                {workers.map(w => (
                  <SelectItem key={w.id} value={String(w.id)}>{w.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ответственное лицо (ФИО)">
            <Select value={form.responsible_id} onValueChange={v => set('responsible_id', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Выберите ответственного" /></SelectTrigger>
              <SelectContent>
                {responsible.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.full_name} — {r.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Блок 4: Маршрут */}
      <div className="bg-white border border-border rounded p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="MapPin" size={14} />4. Маршрут и стороны
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Грузоотправитель">
            <Input value={form.sender_org} onChange={e => set('sender_org', e.target.value)} className="h-8 text-sm" placeholder="Наименование организации" />
          </Field>
          <Field label="Грузополучатель">
            <Input value={form.receiver_org} onChange={e => set('receiver_org', e.target.value)} className="h-8 text-sm" placeholder="Наименование организации" />
          </Field>
          <Field label="Пункт погрузки">
            <Input value={form.loading_point} onChange={e => set('loading_point', e.target.value)} className="h-8 text-sm" placeholder="Адрес" />
          </Field>
          <Field label="Пункт разгрузки">
            <Input value={form.unloading_point} onChange={e => set('unloading_point', e.target.value)} className="h-8 text-sm" placeholder="Адрес" />
          </Field>
          <Field label="Особые условия перевозки">
            <Input value={form.special_conditions} onChange={e => set('special_conditions', e.target.value)} className="h-8 text-sm" placeholder="Опасный груз, условия температуры и т.д." />
          </Field>
          <Field label="Примечания">
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="text-sm resize-none" rows={2} />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="h-9 px-6 text-sm"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          {saving ? <Icon name="Loader2" size={14} className="animate-spin mr-2" /> : <Icon name="Save" size={14} className="mr-2" />}
          Зарегистрировать отгрузку
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-5 text-sm">
          Отмена
        </Button>
      </div>
    </form>
  );
}
