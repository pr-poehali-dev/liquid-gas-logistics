import { useState } from 'react';
import Layout from '@/components/Layout';
import Registry from '@/pages/Registry';
import NewShipment from '@/pages/NewShipment';
import ShipmentDetail from '@/pages/ShipmentDetail';
import Reports from '@/pages/Reports';
import Directories from '@/pages/Directories';
import Certificates from '@/pages/Certificates';

type Page = 'registry' | 'new-shipment' | 'view-shipment' | 'reports' | 'directories' | 'certificates';

export default function App() {
  const [page, setPage] = useState<Page>('registry');
  const [viewId, setViewId] = useState<number | null>(null);

  const navigate = (p: string) => setPage(p as Page);

  const handleViewShipment = (id: number) => {
    setViewId(id);
    setPage('view-shipment');
  };

  const handleNewSuccess = (id: number) => {
    setViewId(id);
    setPage('view-shipment');
  };

  const handlePrint = () => {
    window.print();
  };

  const layoutPage = page === 'view-shipment' ? 'registry' : page;

  return (
    <Layout currentPage={layoutPage} onNavigate={navigate}>
      {page === 'registry' && (
        <Registry onViewShipment={handleViewShipment} onNewShipment={() => setPage('new-shipment')} />
      )}
      {page === 'new-shipment' && (
        <NewShipment onSuccess={handleNewSuccess} onCancel={() => setPage('registry')} />
      )}
      {page === 'view-shipment' && viewId !== null && (
        <ShipmentDetail id={viewId} onBack={() => setPage('registry')} onPrint={handlePrint} />
      )}
      {page === 'reports' && <Reports />}
      {page === 'directories' && <Directories />}
      {page === 'certificates' && <Certificates />}
    </Layout>
  );
}
