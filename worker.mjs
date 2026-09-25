const USER_ID = '1067928829148020736';

function history(env) {
  return env.PRESENCE_HISTORY.get(env.PRESENCE_HISTORY.idFromName(USER_ID));
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/api/last-online') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      return history(env).fetch('https://history/');
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, env) {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Presence check failed: ${response.status}`);
    const result = await response.json();
    const status = result.data?.discord_status;
    if (!result.success || !['online', 'idle', 'dnd', 'offline'].includes(status)) {
      throw new Error('Invalid presence response');
    }
    const saved = await history(env).fetch('https://history/', {
      method: 'POST',
      body: JSON.stringify({ status, checkedAt: Date.now() }),
    });
    if (!saved.ok) throw new Error('Could not save presence history');
  },
};

// Only the scheduled handler can write; visitors receive a read-only endpoint.
export class PresenceHistory {
  constructor(state) { this.state = state; }

  async fetch(request) {
    if (request.method === 'POST') {
      const sample = await request.json();
      await this.state.storage.transaction(async storage => {
        const previous = await storage.get('history');
        if (previous && sample.checkedAt <= previous.checkedAt) return;
        await storage.put('history', {
          userId: USER_ID,
          status: sample.status,
          checkedAt: sample.checkedAt,
          lastOnlineAt: sample.status === 'offline'
            ? previous?.lastOnlineAt ?? null
            : sample.checkedAt,
        });
      });
      return new Response(null, { status: 204 });
    }
    return Response.json(await this.state.storage.get('history') ?? {
      userId: USER_ID, lastOnlineAt: null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
