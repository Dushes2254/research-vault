import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Layout } from '../components/Layout';

const schema = z
  .object({
    type: z.enum(['link', 'note', 'file', 'snippet', 'video']),
    title: z.string().min(1),
    body: z.string().optional(),
    url: z.string().url().optional().or(z.literal('')),
    tagNames: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'link' || v.type === 'video') {
      if (!v.url) ctx.addIssue({ code: 'custom', path: ['url'], message: 'URL обязателен' });
    }
  });

export function NewItem() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const f = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'link', title: '' },
  });
  const type = f.watch('type');

  return (
    <Layout>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ marginTop: 0 }}>Новый материал</h1>
        <form
          className="card stack"
          onSubmit={f.handleSubmit(async (v) => {
            const tagNames = v.tagNames
              ? v.tagNames
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined;
            const payload: Record<string, unknown> = {
              type: v.type,
              title: v.title,
              body: v.body || undefined,
              url: v.url || undefined,
              tagNames,
            };
            if (!payload.url) delete payload.url;
            const r = (await apiFetch('/items', { method: 'POST', body: JSON.stringify(payload) })) as {
              id: string;
            };
            await qc.invalidateQueries({ queryKey: ['items'] });
            nav(`/items/${r.id}`);
          })}
        >
          <div className="row">
            <div className="stack" style={{ flex: 1, minWidth: 200 }}>
              <label className="muted">Тип</label>
              <select {...f.register('type')}>
                <option value="link">link</option>
                <option value="note">note</option>
                <option value="snippet">snippet</option>
                <option value="video">video</option>
                <option value="file" disabled>
                  file (через загрузку)
                </option>
              </select>
            </div>
            <div className="stack" style={{ flex: 2, minWidth: 260 }}>
              <label className="muted">Заголовок</label>
              <input {...f.register('title')} />
            </div>
          </div>
          {(type === 'link' || type === 'video') && (
            <div className="stack">
              <label className="muted">URL</label>
              <input placeholder="https://…" {...f.register('url')} />
            </div>
          )}
          {(type === 'note' || type === 'snippet') && (
            <div className="stack">
              <label className="muted">Текст</label>
              <textarea {...f.register('body')} />
            </div>
          )}

          <div className="stack">
            <label className="muted">Теги (через запятую)</label>
            <input placeholder="react, performance, research" {...f.register('tagNames')} />
          </div>

          <div className="row">
            <button className="primary" type="submit" disabled={f.formState.isSubmitting}>
              Сохранить
            </button>
            <div className="muted">
              Для <b>file</b> открой детальную карточку — загрузка появится на странице (или добавь `POST
              /items/upload`).
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
