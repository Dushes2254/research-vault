import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCollections, useItems, useTags } from '../api/hooks';
import { apiFetch } from '../api/client';
import { Layout } from '../components/Layout';
import type { VaultItem } from '../types';

function statusLabel(s: VaultItem['status']) {
  const map: Record<string, string> = {
    none: '—',
    queued: 'в очереди',
    processing: 'обработка',
    done: 'готово',
    failed: 'ошибка',
  };
  return map[s] || s;
}

export function Dashboard() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('');
  const [tagId, setTagId] = useState<string>('');
  const [collId, setCollId] = useState<string>('');
  const qc = useQueryClient();
  const items = useItems({ q, type: type || undefined, tagId: tagId || undefined, collectionId: collId || undefined });
  const tags = useTags();
  const cols = useCollections();
  const list = items.data;

  const pretty = useMemo(() => {
    if (!list) return [];
    return list;
  }, [list]);

  return (
    <Layout>
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Материалы</h1>
            <div className="muted">Поиск, теги, коллекции, обработка ссылок в фоне</div>
          </div>
          <Link to="/new">
            <button className="primary" type="button">
              Добавить
            </button>
          </Link>
        </div>

        <div className="card stack" style={{ marginBottom: 12 }}>
          <div className="row">
            <input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} />
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="">Все типы</option>
              <option value="link">link</option>
              <option value="note">note</option>
              <option value="file">file</option>
              <option value="snippet">snippet</option>
              <option value="video">video</option>
            </select>
            <select value={tagId} onChange={(e) => setTagId(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="">Все теги</option>
              {(tags.data || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select value={collId} onChange={(e) => setCollId(e.target.value)} style={{ maxWidth: 240 }}>
              <option value="">Все коллекции</option>
              {(cols.data || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                qc.invalidateQueries({ queryKey: ['items'] });
              }}
            >
              Обновить
            </button>
          </div>
        </div>

        {items.isLoading && <div className="muted">Загрузка…</div>}
        {items.error && <div style={{ color: 'var(--danger)' }}>Ошибка: {String((items.error as Error).message)}</div>}

        <div className="itemList">
          {pretty.map((it) => (
            <div className="item" key={it.id}>
              <div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      <Link to={`/items/${it.id}`}>{it.title}</Link>
                    </div>
                    <div className="row" style={{ marginTop: 8 }}>
                      <span className="badge">{it.type}</span>
                      <span className="badge">status: {statusLabel(it.status)}</span>
                      {it.sourceHost && <span className="badge">host: {it.sourceHost}</span>}
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Удалить материал?')) return;
                        await apiFetch(`/items/${it.id}`, { method: 'DELETE' });
                        qc.invalidateQueries({ queryKey: ['items'] });
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                {it.url && (
                  <div className="muted" style={{ marginTop: 8, wordBreak: 'break-all' }}>
                    {it.url}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {pretty.length === 0 && !items.isLoading && <div className="muted">Пока пусто. Добавь ссылку или заметку.</div>}
      </div>
    </Layout>
  );
}
