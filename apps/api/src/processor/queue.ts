export const VAULT_PROCESS_QUEUE = 'vault-process';

export type VaultProcessJob = {
  itemId: string;
  userId: string;
  kind: 'link' | 'file';
};
