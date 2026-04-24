export type VaultItem = {
  id: string;
  type: 'link' | 'note' | 'file' | 'snippet' | 'video';
  title: string;
  body: string | null;
  url: string | null;
  fileName: string | null;
  filePath: string | null;
  fileMime: string | null;
  fileSize: number | null;
  sourceHost: string | null;
  previewImageUrl: string | null;
  status: 'none' | 'queued' | 'processing' | 'done' | 'failed';
  processingError: string | null;
  extractedText: string | null;
  aiSummary: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { tag: { id: string; name: string } }[];
  collections: { collection: { id: string; name: string } }[];
};

export type Tag = { id: string; name: string };
export type Collection = { id: string; name: string; _count?: { items: number } };
