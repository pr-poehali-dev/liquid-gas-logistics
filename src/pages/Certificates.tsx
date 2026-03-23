import { useState, useEffect } from 'react';
import { api, Certificate, Product } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = async () => {
    const [c, p] = await Promise.all([
      api.get<Certificate[]>('/certificates'),
      api.get<Product[]>('/products'),
    ]);
    setCerts(c); setProducts(p);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/certificates', {
        product_id: Number(form.product_id),
        cert_number: form.cert_number,
        cert_type: form.cert_type,
        issued_by: form.issued_by,
        issued_date: form.issued_date,
        expires_date: form.expires_date,
        notes: form.notes,
      });
      await load();
      setDialogOpen(false);
      setForm({});
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const isExpired = (date: string) => date && new Date(date) < new Date();
  const isSoonExpiring = (date: string) => {
    if (!date) return false;
    const d = new Date(date);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff < 30;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Сертификаты качества и документы безопасности для опасных грузов
        </div>
        <Button onClick={() => { setForm({}); setDialogOpen(true); }} className="h-8 text-xs" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          <Icon name="Plus" size={12} className="mr-1" />Добавить сертификат
        </Button>
      </div>

      <div className="bg-white border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Номер</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Тип документа</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Товар</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Выдан</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата выдачи</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Действителен до</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
            </tr>
          </thead>
          <tbody>
            {certs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  <Icon name="ShieldOff" size={28} className="mx-auto mb-2 opacity-20" />
                  <div>Сертификатов нет</div>
                </td>
              </tr>
            )}
            {certs.map(c => {
              const expired = isExpired(c.expires_date);
              const soon = isSoonExpiring(c.expires_date);
              return (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono-nums text-xs font-medium">{c.cert_number}</td>
                  <td className="px-4 py-2.5 text-xs">{c.cert_type}</td>
                  <td className="px-4 py-2.5 text-xs">{c.product_name}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.issued_by || '—'}</td>
                  <td className="px-4 py-2.5 font-mono-nums text-xs">
                    {c.issued_date ? new Date(c.issued_date).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono-nums text-xs">
                    <span className={expired ? 'text-red-600 font-medium' : soon ? 'text-amber-600 font-medium' : ''}>
                      {c.expires_date ? new Date(c.expires_date).toLocaleDateString('ru-RU') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {expired && <span className="status-badge bg-red-100 text-red-700">Просрочен</span>}
                    {soon && !expired && <span className="status-badge bg-amber-100 text-amber-700">Истекает</span>}
                    {!expired && !soon && c.expires_date && <span className="status-badge bg-emerald-100 text-emerald-700">Действителен</span>}
                    {!c.expires_date && <span className="status-badge bg-gray-100 text-gray-600">Бессрочный</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Новый сертификат / документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Товар *</Label>
              <Select value={form.product_id || ''} onValueChange={v => setF('product_id', v)}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Выберите товар" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Тип документа *</Label>
              <Select value={form.cert_type || ''} onValueChange={v => setF('cert_type', v)}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Сертификат качества">Сертификат качества</SelectItem>
                  <SelectItem value="Паспорт безопасности">Паспорт безопасности</SelectItem>
                  <SelectItem value="Свидетельство о поверке">Свидетельство о поверке</SelectItem>
                  <SelectItem value="Разрешение на перевозку">Разрешение на перевозку</SelectItem>
                  <SelectItem value="Аварийная карточка">Аварийная карточка</SelectItem>
                  <SelectItem value="Прочий документ">Прочий документ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Номер документа *</Label>
              <Input className="h-8 text-sm mt-1 font-mono-nums" placeholder="СК-2024-001" value={form.cert_number || ''} onChange={e => setF('cert_number', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Выдан организацией</Label>
              <Input className="h-8 text-sm mt-1" placeholder="Наименование органа" value={form.issued_by || ''} onChange={e => setF('issued_by', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Дата выдачи</Label>
                <Input type="date" className="h-8 text-sm mt-1" value={form.issued_date || ''} onChange={e => setF('issued_date', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Действителен до</Label>
                <Input type="date" className="h-8 text-sm mt-1" value={form.expires_date || ''} onChange={e => setF('expires_date', e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Примечания</Label>
              <Textarea className="text-sm mt-1 resize-none" rows={2} value={form.notes || ''} onChange={e => setF('notes', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-8 text-xs">Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="h-8 text-xs" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              {saving ? <Icon name="Loader2" size={12} className="animate-spin mr-1" /> : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
