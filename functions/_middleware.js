const CANONICAL_HOST = 'saucytits.com';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function shouldRedirect(hostname) {
  if (LOCAL_HOSTS.has(hostname)) {
    return false;
  }

  if (hostname === CANONICAL_HOST) {
    return false;
  }

  if (hostname === `www.${CANONICAL_HOST}`) {
    return true;
  }

  return hostname === 'tiwib-site.pages.dev' || hostname.endsWith('.tiwib-site.pages.dev');
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (shouldRedirect(url.hostname) || url.protocol !== 'https:') {
    url.protocol = 'https:';
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
