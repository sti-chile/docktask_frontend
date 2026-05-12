/**
 * Link Preview API
 * Llama al endpoint de Obscura para extraer metadata de URLs.
 */

export async function fetchLinkPreview(url) {
  const token = localStorage.getItem('access_token');
  const res = await fetch('/api/v1/preview/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to fetch preview');
  return res.json();
}

/**
 * Detecta URLs en un texto
 */
export function extractFirstUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : null;
}
