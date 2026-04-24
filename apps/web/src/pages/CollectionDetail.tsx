import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCollection } from '../api/hooks';
import { apiFetch } from '../api/client';
import { Layout } from '../components/Layout';

export function CollectionDetail() {
  const { id } = useParams();
  const q = useCollection(id);
  const qc = useQueryClient();
  const [itemId, setItemId] = useState('');

  if (q.isLoading) {
    return (
      <Layout>
        <div className="container muted">Загрузка…</div>
      </Layout>
    );
  }
  if (q.error || !q.data) {
    return (
      <Layout>
        <div className="container" style={{ color: 'var(--danger)' }}>
          Не найдено
        </div>
      </Layout>
    );
  }

  const col = q.data;
  return (
    <Layout>
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{col.name}</h1>
          <Link to="/">← к материалам</Link>
        </div>

        <div className="card row" style={{ marginTop: 12 }}>
          <input
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="vaultItemId"
            style={{ maxWidth: 420 }}
          />
          <button
            className="primary"
            type="button"
            onClick={async () => {
              if (!id) return;
              const v = itemId.trim();
              if (!v) return;
              await apiFetch(`/collections/${id}/items`, { method: 'POST', body: JSON.stringify({ vaultItemId: v }) });
              setItemId('');
              await qc.invalidateQueries({ queryKey: ['collection', id] });
            }}
          >
            Добавить материал
          </button>
        </div>

        <div className="itemList" style={{ marginTop: 12 }}>
          {col.items.map((x) => (
            <div className="item" key={x.item.id} style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  <Link to={`/items/${x.item.id}`}>{x.item.title}</Link>
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <span className="badge">{x.item.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {col.items.length === 0 && <div className="muted" style={{ marginTop: 12 }}>Пока пусто</div>}
      </div>
    </Layout>
  );
}
