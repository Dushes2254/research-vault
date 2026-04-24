import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Collection, Tag, VaultItem } from '../types';

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ['me'],
    enabled,
    queryFn: () => apiFetch('/auth/me') as Promise<{ id: string; email: string }>,
  });
}

export function useItems(params: {
  q?: string;
  type?: string;
  tagId?: string;
  collectionId?: string;
  archived?: boolean;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.type) sp.set('type', params.type);
  if (params.tagId) sp.set('tagId', params.tagId);
  if (params.collectionId) sp.set('collectionId', params.collectionId);
  if (params.archived) sp.set('archived', '1');
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => apiFetch(`/items?${sp.toString()}`) as Promise<VaultItem[]>,
  });
}

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['item', id],
    enabled: Boolean(id),
    queryFn: () => apiFetch(`/items/${id}`) as Promise<VaultItem>,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiFetch('/tags') as Promise<Tag[]>,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => apiFetch('/collections') as Promise<Collection[]>,
  });
}

export function useCollection(id: string | undefined) {
  return useQuery({
    queryKey: ['collection', id],
    enabled: Boolean(id),
    queryFn: () => apiFetch(`/collections/${id}`) as Promise<{
      id: string;
      name: string;
      items: { item: VaultItem }[];
    }>,
  });
}
