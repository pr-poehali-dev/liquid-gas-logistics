import { useState, useEffect, useCallback } from 'react';
import { api, Shipment, Product } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegistryProps {
  onViewShipment: (id: number) => void;
  onNewShipment: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Выполнена',
  draft: 'Черновик',
  cancelled: 'Отменена',
};

export default function Registry({ onViewShipment, onNewShipment }: RegistryProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (productFilter && productFilter !== 'all') params.set('product_id', productFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get<Shipment[]>(`/shipments${qs}`);
      setShipments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, productFilter, dateFrom, dateTo]);

  useEffect(() => {
    api.get<Product[]>('/products').then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-border rounded p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Поиск</label>
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Номер ТН, водитель, госномер..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        <div className="min-w-44">
          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Товар</label>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Все товары" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все товары</SelectItem>
              {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-36">
          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Дата с</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="min-w-36">
          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">Дата по</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-sm" />
        </div>
        <Button variant="outline" onClick={() => { setSearch(''); setProductFilter('all'); setDateFrom(''); setDateTo(''); }} className="h-8 text-xs">
          <Icon name="X" size={12} className="mr-1" />Сбросить
        </Button>
        <Button onClick={onNewShipment} className="h-8 text-xs ml-auto" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Icon name="Plus" size={12} className="mr-1" />Новая отгрузка
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">№ ТН</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Дата / Время</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Товар</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Кол-во</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Транспорт</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Водитель</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Получатель</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                    <Icon name="Loader2" size={18} className="inline animate-spin mr-2" />Загрузка...
                  </td>
                </tr>
              )}
              {!loading && shipments.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                    <Icon name="FileX" size={28} className="mx-auto mb-2 opacity-30" />
                    <div>Отгрузки не найдены</div>
                  </td>
                </tr>
              )}
              {!loading && shipments.map(s => (
                <tr key={s.id} className="table-row-hover border-b border-border/50 last:border-0" onClick={() => onViewShipment(s.id)}>
                  <td className="px-4 py-2.5 font-mono-nums text-xs font-medium text-primary">{s.shipment_number}</td>
                  <td className="px-4 py-2.5 font-mono-nums text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(s.shipment_date).toLocaleDateString('ru-RU')}<br />
                    <span className="text-[11px]">{new Date(s.shipment_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${s.product_name?.includes('Азот') ? 'bg-blue-50 text-blue-700' : 'bg-sky-50 text-sky-700'}`}>
                      {s.product_name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono-nums font-medium text-sm">
                    {s.quantity?.toLocaleString('ru-RU')} <span className="text-xs text-muted-foreground">{s.unit}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div className="font-medium">{s.vehicle_reg}</div>
                    {s.trailer_reg && <div className="text-muted-foreground text-[11px]">+ {s.trailer_reg}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.driver_name}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-32 truncate">{s.receiver_org || '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`status-badge status-${s.status}`}>{STATUS_LABELS[s.status] || s.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && shipments.length > 0 && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground font-mono-nums">
            Записей: {shipments.length}
          </div>
        )}
      </div>
    </div>
  );
}
