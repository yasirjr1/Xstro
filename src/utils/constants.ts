export function isPath(text: string): boolean {
  if (typeof text !== 'string' || text.trim() === '') return false;

  return /^(?:\.|\.\.|[a-zA-Z]:)?[\/\\]?[a-zA-Z0-9_\-.]+(?:[\/\\][a-zA-Z0-9_\-.]+)*(?:\.[a-zA-Z0-9]+)?$/.test(
    text.trim(),
  );
}

export function isText(text: string): boolean {
  if (typeof text !== 'string' || text.trim() === '') return false;

  const trimmedText = text.trim();
  const bufferPattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)$/;
  const hexPattern = /^(?:0x)?[0-9a-fA-F]+$/;

  return !bufferPattern.test(trimmedText) && !hexPattern.test(trimmedText);
}

export function formatDate(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatRuntime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100}${units[unitIndex]}`;
}

export function parseJid(jid: string): string | undefined {
  if (!jid) return undefined;
  const parsed = Array.isArray(jid)
    ? jid[0]
    : typeof jid === 'object'
      ? String(Object.values(jid)[0])
      : String(jid);
  const numbers = parsed.replace(/\D/g, '');
  if (!numbers) return undefined;
  const num = numbers.slice(0, 12);
  if (num.length < 11) return undefined;
  return `${num}@whatsapp.net`;
}
