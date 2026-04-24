import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCollections } from '../api/hooks';
import { apiFetch } from '../api/client';
import { Layout } from '../components/Layout';

export function CollectionsPage() {
  const c = useCollections();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  return (
    <Layout>
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ marginTop: 0 }}>Коллекции</h1>
        <div className="card row" style={{ marginBottom: 12 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название коллекции"
            style={{ maxWidth: 420 }}
          />
          <button
            className="primary"
            type="button"
            onClick={async () => {
              const n = name.trim();
              if (!n) return;
              await apiFetch('/collections', { method: 'POST', body: JSON.stringify({ name: n }) });
              setName('');
              await qc.invalidateQueries({ queryKey: ['collections'] });
            }}
          >
            Создать
          </button>
        </div>
        {c.isLoading && <div className="muted">Загрузка…</div>}
        <div className="itemList">
          {(c.data || []).map((x) => (
            <div className="item" key={x.id} style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  <Link to={`/collections/${x.id}`}>{x.name}</Link>
                </div>
                <div className="muted">items: {x._count?.items ?? '—'}</div>
              </div>
              <div className="muted">id: {x.id}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
