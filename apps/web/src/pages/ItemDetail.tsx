import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useItem, useTags } from '../api/hooks';
import { apiFetch } from '../api/client';
import { Layout } from '../components/Layout';

export function ItemDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useItem(id);
  const tags = useTags();
  const [tagName, setTagName] = useState('');
  const [qAi, setQAi] = useState('');

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

  const it = q.data;
  return (
    <Layout>
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{it.title}</h1>
          <div className="row">
            <button
              type="button"
              onClick={async () => {
                if (!id) return;
                await apiFetch(`/items/${id}/reprocess`, { method: 'POST' });
                await qc.invalidateQueries({ queryKey: ['item', id] });
              }}
            >
              Reprocess
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!id) return;
                await apiFetch(`/items/${id}/archive`, {
                  method: 'POST',
                  body: JSON.stringify({ action: it.archivedAt ? 'unarchive' : 'archive' }),
                });
                await qc.invalidateQueries({ queryKey: ['item', id] });
              }}
            >
              {it.archivedAt ? 'Вернуть' : 'В архив'}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!id) return;
                if (!confirm('Удалить?')) return;
                await apiFetch(`/items/${id}`, { method: 'DELETE' });
                await qc.invalidateQueries({ queryKey: ['items'] });
                nav('/');
              }}
            >
              Удалить
            </button>
          </div>
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <span className="badge">{it.type}</span>
          <span className="badge">status: {it.status}</span>
          {it.sourceHost && <span className="badge">host: {it.sourceHost}</span>}
        </div>

        {it.url && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="muted">URL</div>
            <a href={it.url} target="_blank" rel="noreferrer">
              {it.url}
            </a>
            {it.previewImageUrl && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={it.previewImageUrl}
                  alt=""
                  style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid var(--border)' }}
                />
              </div>
            )}
          </div>
        )}

        {it.body && (
          <div className="card stack" style={{ marginTop: 12 }}>
            <div className="muted">Описание / текст</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{it.body}</div>
          </div>
        )}

        {it.type === 'file' && it.fileName && (
          <div className="card stack" style={{ marginTop: 12 }}>
            <div className="muted">Файл</div>
            <div>
              {it.fileName} <span className="muted">({it.fileMime || 'n/a'})</span>
            </div>
            <div className="stack">
              <label className="muted">Заменить файл (multipart `POST /items/upload` из UI-формы)</label>
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !id) return;
                  const fd = new FormData();
                  fd.set('file', file);
                  fd.set('title', it.title);
                  await apiFetch('/items/upload', { method: 'POST', body: fd });
                  await qc.invalidateQueries({ queryKey: ['item', id] });
                  await qc.invalidateQueries({ queryKey: ['items'] });
                }}
              />
            </div>
          </div>
        )}

        {it.type !== 'file' && (
          <div className="card stack" style={{ marginTop: 12 }}>
            <div className="muted">Добавить файл как новый материал (upload)</div>
            <div className="row">
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.set('file', file);
                  const created = (await apiFetch('/items/upload', { method: 'POST', body: fd })) as { id: string };
                  await qc.invalidateQueries({ queryKey: ['items'] });
                  nav(`/items/${created.id}`);
                }}
              />
            </div>
          </div>
        )}

        {it.processingError && (
          <div className="card" style={{ marginTop: 12, borderColor: 'color-mix(in srgb, var(--danger) 35%, var(--border))' }}>
            <div className="muted">Ошибка обработки</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{it.processingError}</pre>
          </div>
        )}

        {it.extractedText && (
          <div className="card stack" style={{ marginTop: 12 }}>
            <div className="muted">Извлечённый текст (фрагмент)</div>
            <div style={{ maxHeight: 360, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {it.extractedText.slice(0, 8000)}
              {it.extractedText.length > 8000 ? '…' : ''}
            </div>
          </div>
        )}

        <div className="card stack" style={{ marginTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="muted" style={{ fontWeight: 700 }}>
                Теги
              </div>
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {it.tags.map((t) => (
                  <span className="badge" key={t.tag.id}>
                    {t.tag.name}
                  </span>
                ))}
                {it.tags.length === 0 && <span className="muted">пока нет</span>}
              </div>
            </div>
          </div>
          <div className="row">
            <input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="новый тег"
              style={{ maxWidth: 360 }}
            />
            <select onChange={(e) => (e.target.value ? setTagName(e.target.value) : null)} value="">
              <option value="">из списка…</option>
              {(tags.data || []).map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="primary"
              type="button"
              onClick={async () => {
                if (!id) return;
                const name = tagName.trim();
                if (!name) return;
                await apiFetch(`/items/${id}/tags`, { method: 'POST', body: JSON.stringify({ name }) });
                setTagName('');
                await qc.invalidateQueries({ queryKey: ['item', id] });
                await qc.invalidateQueries({ queryKey: ['tags'] });
              }}
            >
              Добавить тег
            </button>
          </div>
        </div>

        <div className="card stack" style={{ marginTop: 12 }}>
          <div className="muted" style={{ fontWeight: 700 }}>
            AI
          </div>
          {it.aiSummary && (
            <div>
              <div className="muted">Саммари (сохранено)</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{it.aiSummary}</div>
            </div>
          )}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={async () => {
                if (!id) return;
                await apiFetch('/ai/summary', { method: 'POST', body: JSON.stringify({ itemId: id }) });
                await qc.invalidateQueries({ queryKey: ['item', id] });
              }}
            >
              Сгенерировать саммари
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!id) return;
                const r = (await apiFetch('/ai/suggest-tags', {
                  method: 'POST',
                  body: JSON.stringify({ itemId: id }),
                })) as { tags: string[] };
                alert(`Предложенные теги:\n${r.tags.join(', ')}`);
              }}
            >
              Предложить теги
            </button>
          </div>
          <div className="stack">
            <label className="muted">Спросить по этому материалу (RAG-лайт)</label>
            <input value={qAi} onChange={(e) => setQAi(e.target.value)} placeholder="Вопрос…" />
            <button
              className="primary"
              type="button"
              onClick={async () => {
                if (!id) return;
                const r = (await apiFetch('/ai/ask', {
                  method: 'POST',
                  body: JSON.stringify({ itemIds: [id], question: qAi }),
                })) as { answer: string };
                alert(r.answer);
              }}
            >
              Спросить
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
