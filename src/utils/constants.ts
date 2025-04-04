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
  if (ms < 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // Average days in a month
  const years = Math.floor(days / 365.25); // Account for leap years

  if (years > 0) return `${years}y ${months % 12}mo`;
  if (months > 0) return `${months}mo ${weeks % 4}w`;
  if (weeks > 0) return `${weeks}w ${days % 7}d`;
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
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
