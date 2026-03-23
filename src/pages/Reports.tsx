import { useState, useEffect } from 'react';
import { api, Stats } from '@/lib/api';
import Icon from '@/components/ui/icon';

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/stats').then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Icon name="Loader2" size={20} className="animate-spin mr-2" />Загрузка...
    </div>
  );

  const byDate = stats?.by_date || [];
  const byProduct = stats?.by_product || [];

  const groupedByDate: Record<string, Record<string, number>> = {};
  byDate.forEach(row => {
    const d = typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date);
    if (!groupedByDate[d]) groupedByDate[d] = {};
    groupedByDate[d][row.product] = row.quantity;
  });
  const sortedDates = Object.keys(groupedByDate).sort().reverse().slice(0, 14);
  const productNames = byProduct.map(p => p.product);

  const maxQty = Math.max(...byProduct.map(p => p.total_quantity), 1);

  return (
    <div className="space-y-5">
      {/* Карточки итогов */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Всего отгрузок</div>
          <div className="text-3xl font-bold font-mono-nums">{stats?.total_shipments ?? 0}</div>
        </div>
        {byProduct.map(p => (
          <div key={p.product} className="bg-white border border-border rounded p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.product}</div>
            <div className="text-3xl font-bold font-mono-nums">{p.total_quantity.toLocaleString('ru-RU')}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{p.unit} / {p.count} отгрузок</div>
          </div>
        ))}
      </div>

      {/* Диаграмма по товарам */}
      {byProduct.length > 0 && (
        <div className="bg-white border border-border rounded p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Объёмы по товарам</div>
          <div className="space-y-4">
            {byProduct.map(p => (
              <div key={p.product}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{p.product}</span>
                  <span className="font-mono-nums text-sm text-muted-foreground">{p.total_quantity.toLocaleString('ru-RU')} {p.unit}</span>
                </div>
                <div className="h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${(p.total_quantity / maxQty) * 100}%`,
                      background: p.product.includes('Азот') ? 'hsl(215 60% 35%)' : 'hsl(200 85% 42%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица по датам */}
      {sortedDates.length > 0 && (
        <div className="bg-white border border-border rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Отгрузки за 30 дней</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата</th>
                  {productNames.map(name => (
                    <th key={name} className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{name}, л</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDates.map(date => (
                  <tr key={date} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono-nums text-xs">
                      {new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    {productNames.map(name => (
                      <td key={name} className="px-4 py-2.5 text-right font-mono-nums text-sm">
                        {groupedByDate[date][name] ? groupedByDate[date][name].toLocaleString('ru-RU') : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedDates.length === 0 && byProduct.length === 0 && (
        <div className="bg-white border border-border rounded p-12 text-center text-muted-foreground">
          <Icon name="BarChart3" size={32} className="mx-auto mb-3 opacity-20" />
          <div className="text-sm">Данных пока нет — начните регистрировать отгрузки</div>
        </div>
      )}
    </div>
  );
}
