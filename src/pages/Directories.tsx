import { useState, useEffect } from 'react';
import { api, Driver, Worker, Responsible, Vehicle, Trailer, Product, Sender, Receiver } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Tab = 'products' | 'senders' | 'receivers' | 'drivers' | 'workers' | 'responsible' | 'vehicles' | 'trailers';

export default function Directories() {
  const [products, setProducts] = useState<Product[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [responsible, setResponsible] = useState<Responsible[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [tab, setTab] = useState<Tab>('products');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const loadAll = async () => {
    const [pr, sn, rv, d, w, r, v, t] = await Promise.all([
      api.get<Product[]>('/products'),
      api.get<Sender[]>('/senders'),
      api.get<Receiver[]>('/receivers'),
      api.get<Driver[]>('/drivers'),
      api.get<Worker[]>('/workers'),
      api.get<Responsible[]>('/responsible'),
      api.get<Vehicle[]>('/vehicles'),
      api.get<Trailer[]>('/trailers'),
    ]);
    setProducts(pr); setSenders(sn); setReceivers(rv);
    setDrivers(d); setWorkers(w); setResponsible(r); setVehicles(v); setTrailers(t);
  };

  useEffect(() => { loadAll().catch(console.error); }, []);

  const openAdd = () => { setForm({}); setDialogOpen(true); };
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'products') await api.post('/products', { name: form.name, product_code: form.product_code, unit: form.unit || 'л', danger_class: form.danger_class, un_number: form.un_number });
      if (tab === 'senders') await api.post('/senders', { name: form.name, inn: form.inn, address: form.address, phone: form.phone });
      if (tab === 'receivers') await api.post('/receivers', { name: form.name, inn: form.inn, address: form.address, phone: form.phone });
      if (tab === 'drivers') await api.post('/drivers', { full_name: form.full_name, license_number: form.license_number, phone: form.phone });
      if (tab === 'workers') await api.post('/workers', { full_name: form.full_name, position: form.position });
      if (tab === 'responsible') await api.post('/responsible', { full_name: form.full_name, position: form.position });
      if (tab === 'vehicles') await api.post('/vehicles', { reg_number: form.reg_number, brand: form.brand, vehicle_type: form.vehicle_type });
      if (tab === 'trailers') await api.post('/trailers', { reg_number: form.reg_number, brand: form.brand, capacity_liters: Number(form.capacity_liters) });
      await loadAll();
      setDialogOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const TableWrap = ({ cols, rows }: { cols: string[]; rows: React.ReactNode[] }) => (
    <div className="bg-white border border-border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 border-b border-border">
            {cols.map(c => <th key={c} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} className="text-center py-8 text-muted-foreground text-sm">Пусто</td></tr>
            : rows}
        </tbody>
      </table>
    </div>
  );

  const Tr = ({ cells }: { cells: React.ReactNode[] }) => (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/30">
      {cells.map((c, i) => <td key={i} className="px-4 py-2.5 text-sm">{c}</td>)}
    </tr>
  );

  const dialogTitle: Record<Tab, string> = {
    products: 'Новый товар (груз)',
    senders: 'Новый грузоотправитель',
    receivers: 'Новый грузополучатель',
    drivers: 'Новый водитель',
    workers: 'Новый рабочий',
    responsible: 'Новое ответственное лицо',
    vehicles: 'Новое транспортное средство',
    trailers: 'Новый прицеп',
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="h-8 flex-wrap">
            <TabsTrigger value="products" className="text-xs px-3">Наименование груза</TabsTrigger>
            <TabsTrigger value="senders" className="text-xs px-3">Грузоотправители</TabsTrigger>
            <TabsTrigger value="receivers" className="text-xs px-3">Грузополучатели</TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs px-3">Водители</TabsTrigger>
            <TabsTrigger value="workers" className="text-xs px-3">Рабочие</TabsTrigger>
            <TabsTrigger value="responsible" className="text-xs px-3">Ответственные</TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs px-3">Транспорт</TabsTrigger>
            <TabsTrigger value="trailers" className="text-xs px-3">Прицепы</TabsTrigger>
          </TabsList>
          <Button onClick={openAdd} className="h-8 text-xs" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
            <Icon name="Plus" size={12} className="mr-1" />Добавить
          </Button>
        </div>

        <TabsContent value="products" className="mt-4">
          <TableWrap cols={['Наименование', 'Код', 'Ед. изм.', 'Кл. опасности', 'Номер ООН']}
            rows={products.map(p => <Tr key={p.id} cells={[
              <span className="font-medium">{p.name}</span>,
              <span className="font-mono-nums text-xs">{p.product_code || '—'}</span>,
              p.unit,
              p.danger_class || '—',
              p.un_number || '—',
            ]} />)} />
        </TabsContent>

        <TabsContent value="senders" className="mt-4">
          <TableWrap cols={['Наименование организации', 'ИНН', 'Адрес', 'Телефон']}
            rows={senders.map(s => <Tr key={s.id} cells={[
              <span className="font-medium">{s.name}</span>,
              <span className="font-mono-nums text-xs">{s.inn || '—'}</span>,
              <span className="text-muted-foreground text-xs">{s.address || '—'}</span>,
              s.phone || '—',
            ]} />)} />
        </TabsContent>

        <TabsContent value="receivers" className="mt-4">
          <TableWrap cols={['Наименование организации', 'ИНН', 'Адрес', 'Телефон']}
            rows={receivers.map(r => <Tr key={r.id} cells={[
              <span className="font-medium">{r.name}</span>,
              <span className="font-mono-nums text-xs">{r.inn || '—'}</span>,
              <span className="text-muted-foreground text-xs">{r.address || '—'}</span>,
              r.phone || '—',
            ]} />)} />
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <TableWrap cols={['ФИО водителя', 'Удостоверение', 'Телефон']}
            rows={drivers.map(d => <Tr key={d.id} cells={[d.full_name, d.license_number || '—', d.phone || '—']} />)} />
        </TabsContent>

        <TabsContent value="workers" className="mt-4">
          <TableWrap cols={['ФИО рабочего', 'Должность']}
            rows={workers.map(w => <Tr key={w.id} cells={[w.full_name, w.position]} />)} />
        </TabsContent>

        <TabsContent value="responsible" className="mt-4">
          <TableWrap cols={['ФИО ответственного лица', 'Должность']}
            rows={responsible.map(r => <Tr key={r.id} cells={[r.full_name, r.position]} />)} />
        </TabsContent>

        <TabsContent value="vehicles" className="mt-4">
          <TableWrap cols={['Гос. рег. номер', 'Марка / модель', 'Тип ТС']}
            rows={vehicles.map(v => <Tr key={v.id} cells={[
              <span className="font-mono-nums font-medium">{v.reg_number}</span>,
              v.brand || '—',
              v.vehicle_type,
            ]} />)} />
        </TabsContent>

        <TabsContent value="trailers" className="mt-4">
          <TableWrap cols={['Гос. рег. номер прицепа', 'Марка / модель', 'Объём, л']}
            rows={trailers.map(t => <Tr key={t.id} cells={[
              <span className="font-mono-nums font-medium">{t.reg_number}</span>,
              t.brand || '—',
              t.capacity_liters ? t.capacity_liters.toLocaleString('ru-RU') : '—',
            ]} />)} />
        </TabsContent>
      </Tabs>

      {/* Диалог добавления */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">{dialogTitle[tab]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">

            {/* Товар */}
            {tab === 'products' && (
              <>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Наименование *</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="Азот жидкий" value={form.name || ''} onChange={e => setF('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Код товара</Label>
                    <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="N2-L" value={form.product_code || ''} onChange={e => setF('product_code', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ед. измерения</Label>
                    <Input className="h-8 text-sm mt-1" placeholder="л" value={form.unit || ''} onChange={e => setF('unit', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Класс опасности</Label>
                    <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="2.2" value={form.danger_class || ''} onChange={e => setF('danger_class', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Номер ООН</Label>
                    <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="UN1977" value={form.un_number || ''} onChange={e => setF('un_number', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Грузоотправитель / Грузополучатель */}
            {(tab === 'senders' || tab === 'receivers') && (
              <>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Наименование организации *</Label>
                  <Input className="h-8 text-sm mt-1" placeholder='ООО "Название"' value={form.name || ''} onChange={e => setF('name', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">ИНН</Label>
                  <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="7700000000" value={form.inn || ''} onChange={e => setF('inn', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Адрес</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="г. Москва, ул. ..." value={form.address || ''} onChange={e => setF('address', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Телефон</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="+7-000-000-0000" value={form.phone || ''} onChange={e => setF('phone', e.target.value)} />
                </div>
              </>
            )}

            {/* Персонал */}
            {(tab === 'drivers' || tab === 'workers' || tab === 'responsible') && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Фамилия и инициалы *</Label>
                <Input className="h-8 text-sm mt-1" placeholder="Иванов И.И." value={form.full_name || ''} onChange={e => setF('full_name', e.target.value)} />
              </div>
            )}
            {tab === 'drivers' && (
              <>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Серия и номер удостоверения</Label>
                  <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="АА 123456" value={form.license_number || ''} onChange={e => setF('license_number', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Телефон</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="+7-900-000-0000" value={form.phone || ''} onChange={e => setF('phone', e.target.value)} />
                </div>
              </>
            )}
            {(tab === 'workers' || tab === 'responsible') && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Должность</Label>
                <Input className="h-8 text-sm mt-1" placeholder="Должность" value={form.position || ''} onChange={e => setF('position', e.target.value)} />
              </div>
            )}

            {/* Транспорт */}
            {(tab === 'vehicles' || tab === 'trailers') && (
              <>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Гос. рег. номер *</Label>
                  <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="А 000 ББ 77" value={form.reg_number || ''} onChange={e => setF('reg_number', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Марка / модель</Label>
                  <Input className="h-8 text-sm mt-1" placeholder="МАЗ-5340" value={form.brand || ''} onChange={e => setF('brand', e.target.value)} />
                </div>
              </>
            )}
            {tab === 'vehicles' && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Тип ТС</Label>
                <Input className="h-8 text-sm mt-1" placeholder="Седельный тягач" value={form.vehicle_type || ''} onChange={e => setF('vehicle_type', e.target.value)} />
              </div>
            )}
            {tab === 'trailers' && (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Объём резервуара, л</Label>
                <Input type="number" className="h-8 text-sm mt-1 font-mono-nums" placeholder="50000" value={form.capacity_liters || ''} onChange={e => setF('capacity_liters', e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-8 text-xs">Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="h-8 text-xs" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              {saving && <Icon name="Loader2" size={12} className="animate-spin mr-1" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
