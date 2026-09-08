// Stub route kept for backwards compatibility.
// New store links use /tienda/ver?id=xxx — no dynamic segment needed.
// revalidate=0 bypasses the Next.js static-export generateStaticParams check
// (the check runs only when revalidate !== 0, per build/index.js:1362).
// The .htaccess on Hostinger handles direct /tienda/* navigation.

export const revalidate = 0;
export const dynamicParams = false;

export default function TiendaLegacyPage() {
  return null;
}
