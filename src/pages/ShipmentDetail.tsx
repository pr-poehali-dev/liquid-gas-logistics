import { useState, useEffect } from 'react';
import { api, ShipmentDetail as ShipmentDetailType } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Props {
  id: number;
  onBack: () => void;
  onPrint: () => void;
}

export default function ShipmentDetail({ id, onBack, onPrint }: Props) {
  const [data, setData] = useState<ShipmentDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ShipmentDetailType>(`/shipments/${id}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Icon name="Loader2" size={20} className="animate-spin mr-2" />Загрузка...
    </div>
  );
  if (!data) return <div className="text-center py-20 text-muted-foreground">Отгрузка не найдена</div>;

  const d = new Date(data.shipment_date);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="h-8 text-xs">
          <Icon name="ArrowLeft" size={12} className="mr-1" />Реестр
        </Button>
        <Button onClick={onPrint} className="h-8 text-xs ml-auto" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Icon name="Printer" size={12} className="mr-1" />Печать ТН
        </Button>
      </div>

      {/* ТН Document */}
      <div className="bg-white border border-border rounded overflow-hidden" id="tn-print">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Транспортная накладная</div>
              <div className="text-lg font-bold font-mono-nums text-foreground">{data.shipment_number}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                утв. Постановлением Правительства РФ от 21.12.2020 №2200
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Дата составления</div>
              <div className="font-mono-nums font-semibold">{d.toLocaleDateString('ru-RU')}</div>
              <div className="font-mono-nums text-sm text-muted-foreground">{d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Section 1 — Стороны */}
        <div className="px-6 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">1. Стороны</div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Грузоотправитель</div>
              <div className="text-sm font-medium border-b border-dashed border-border pb-1">{data.sender_org || '___________________________'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Грузополучатель</div>
              <div className="text-sm font-medium border-b border-dashed border-border pb-1">{data.receiver_org || '___________________________'}</div>
            </div>
          </div>
        </div>

        {/* Section 2 — Груз */}
        <div className="px-6 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">3. Груз</div>
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-3 py-2 text-xs border-r border-border font-medium">Наименование</th>
                <th className="text-left px-3 py-2 text-xs border-r border-border font-medium">Ед. изм.</th>
                <th className="text-right px-3 py-2 text-xs border-r border-border font-medium">Количество</th>
                <th className="text-left px-3 py-2 text-xs border-r border-border font-medium">Кл. опасности</th>
                <th className="text-left px-3 py-2 text-xs font-medium">Номер ООН</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2.5 font-medium border-r border-border">{data.product_name}</td>
                <td className="px-3 py-2.5 border-r border-border">{data.unit}</td>
                <td className="px-3 py-2.5 text-right font-mono-nums font-semibold border-r border-border">{data.quantity?.toLocaleString('ru-RU')}</td>
                <td className="px-3 py-2.5 border-r border-border">{data.danger_class || '—'}</td>
                <td className="px-3 py-2.5">{data.un_number || '—'}</td>
              </tr>
            </tbody>
          </table>
          {data.cargo_description && (
            <div className="mt-2 text-xs text-muted-foreground">Характеристика груза: {data.cargo_description}</div>
          )}
        </div>

        {/* Section 3 — Транспорт */}
        <div className="px-6 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">6. Транспортное средство</div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Тип ТС</div>
              <div className="text-sm border-b border-dashed border-border pb-1">{data.vehicle_brand || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Гос. регистр. номер ТС</div>
              <div className="text-sm font-mono-nums font-semibold border-b border-dashed border-border pb-1">{data.vehicle_reg}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Гос. регистр. номер прицепа</div>
              <div className="text-sm font-mono-nums font-semibold border-b border-dashed border-border pb-1">{data.trailer_reg || '—'}</div>
            </div>
          </div>
        </div>

        {/* Section 4 — Маршрут */}
        <div className="px-6 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">4. Сопроводительные документы</div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Пункт погрузки</div>
              <div className="text-sm border-b border-dashed border-border pb-1">{data.loading_point || '___________________________'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Пункт разгрузки</div>
              <div className="text-sm border-b border-dashed border-border pb-1">{data.unloading_point || '___________________________'}</div>
            </div>
            {data.cert_number && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Сертификат качества</div>
                <div className="text-sm">{data.cert_number} — {data.cert_type}</div>
              </div>
            )}
            {data.special_conditions && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Особые условия</div>
                <div className="text-sm">{data.special_conditions}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5 — Подписи */}
        <div className="px-6 py-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">Подписи сторон</div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Водитель</div>
              <div className="text-sm font-medium mb-6">{data.driver_name || '___________________________'}</div>
              <div className="text-[10px] text-muted-foreground">Удостоверение: {data.license_number || '—'}</div>
              <div className="border-t border-border mt-3 pt-1 text-[10px] text-muted-foreground text-center">подпись</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Рабочий по отгрузке</div>
              <div className="text-sm font-medium mb-6">{data.worker_name || '___________________________'}</div>
              <div className="border-t border-border mt-9 pt-1 text-[10px] text-muted-foreground text-center">подпись</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Ответственное лицо</div>
              <div className="text-sm font-medium mb-6">{data.responsible_name || '___________________________'}</div>
              <div className="border-t border-border mt-9 pt-1 text-[10px] text-muted-foreground text-center">подпись</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
