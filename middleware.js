// Negociación de contenido para agentes de IA.
//
// Quien pide la home con `Accept: text/markdown` recibe index.md; el resto, el HTML
// de siempre. Es el check "Content / Markdown content negotiation" del Agent Readiness.
//
// POR QUÉ MIDDLEWARE Y NO `routes` EN vercel.json:
// en Vercel el sistema de archivos gana a `rewrites`, así que una regla sobre la
// cabecera nunca llega a evaluarse — `/` resuelve a index.html antes. La alternativa
// documentada es `routes`, pero `routes` NO convive con el bloque `headers`, y ahí
// viven el noindex, el no-referrer y el no-store que protegen /radar/.
// El middleware corre ANTES del sistema de archivos y deja `headers` intacto.
//
// El matcher lo limita a la home: /radar/ y las demás rutas no pasan por aquí.

export const config = { matcher: '/' };

export default async function middleware(request) {
  const accept = request.headers.get('accept') || '';

  if (!accept.includes('text/markdown')) {
    return; // sigue el flujo normal: index.html
  }

  const md = await fetch(new URL('/index.md', request.url));

  if (!md.ok) {
    return; // si index.md no está, se sirve el HTML antes que un error
  }

  return new Response(await md.text(), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Link': '<https://www.directoria.pe/index.md>; rel="alternate"; type="text/markdown"',
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
