// Recibe una reseña del formulario de /review y la manda por mail con Brevo.
// Variables de entorno necesarias en Vercel:
//   BREVO_API_KEY   clave de la API de Brevo
//   REVIEW_TO       casilla que recibe las reseñas (hoy Lautaro, después Diego)
//   REVIEW_FROM     remitente verificado en Brevo (un dominio propio, no un Gmail)
//   REVIEW_FROM_NAME  opcional, nombre visible del remitente

const SERVICES = {
  city:       'City Tour Buenos Aires',
  tigre:      'Tigre y San Isidro',
  gaucho:     'Día de Gaucho en la estancia',
  ezeiza:     'Traslado aeropuerto Ezeiza',
  aeroparque: 'Traslado Aeroparque',
  otro:       'Otro servicio'
};

const LANGS = { es: 'Español', en: 'Inglés', fr: 'Francés' };

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Los valores pegados en el panel llegan con saltos de línea, espacios o repetidos:
  // se limpian acá para que un pegado sucio no tire el envío.
  const emails = (raw) => String(raw || '')
    .split(/[\s,;]+/)
    .map(s => s.trim())
    .filter(s => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))
    .filter((s, i, a) => a.indexOf(s) === i);

  const destinatarios = emails(process.env.REVIEW_TO);
  const cfg = {
    key:  String(process.env.BREVO_API_KEY || '').trim(),
    to:   destinatarios,
    from: emails(process.env.REVIEW_FROM)[0],
    fromName: (process.env.REVIEW_FROM_NAME || 'Transfer Buenos Aires City').trim()
  };
  if (!cfg.key || !cfg.to.length || !cfg.from) {
    console.error('Faltan variables de entorno o están mal formadas', {
      key: !!cfg.key, to: cfg.to.length, from: !!cfg.from
    });
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: 'bad_json' }); }
  }
  body = body || {};

  // Trampa para bots: campo oculto que una persona nunca completa.
  if (body.website) return res.status(200).json({ ok: true });

  const name    = String(body.name || '').trim().slice(0, 60);
  const country = String(body.country || '').trim().slice(0, 40);
  const email   = String(body.email || '').trim().slice(0, 80);
  const comment = String(body.comment || '').trim().slice(0, 900);
  const lang    = ['es', 'en', 'fr'].includes(body.lang) ? body.lang : 'en';
  const service = SERVICES[body.service] || SERVICES.otro;
  const rating  = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 0));

  if (name.length < 2 || comment.length < 15 || body.consent !== true) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // Los bots de spam meten varios enlaces; una reseña real casi nunca.
  if ((comment.match(/https?:\/\//gi) || []).length > 1) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const asunto = `Nueva reseña de ${name} — ${stars}`;

  const filas = [
    ['Nombre', name],
    ['País', country || '—'],
    ['Mail', email || '—'],
    ['Servicio', service],
    ['Puntaje', `${stars}  (${rating}/5)`],
    ['Idioma del visitante', LANGS[lang]]
  ];

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;background:#0a0a0a;padding:28px;color:#f5f2ed">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-top:3px solid #c9a96e;padding:28px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e">Transfer Buenos Aires City</p>
    <h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#f5f2ed">Nueva reseña desde la web</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${filas.map(([k, v]) => `
      <tr>
        <td style="padding:7px 0;color:rgba(245,242,237,.6);width:170px;vertical-align:top">${escapeHtml(k)}</td>
        <td style="padding:7px 0;color:#f5f2ed">${escapeHtml(v)}</td>
      </tr>`).join('')}
    </table>
    <p style="margin:22px 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e">Comentario</p>
    <div style="background:#1a1a1a;border-left:2px solid #c9a96e;padding:16px 18px;font-size:15px;line-height:1.7;white-space:pre-wrap">${escapeHtml(comment)}</div>
    <p style="margin:22px 0 0;font-size:12px;color:rgba(245,242,237,.55);line-height:1.6">
      El visitante marcó la casilla autorizando a publicar este comentario con su nombre y país.
    </p>
  </div>
</div>`.trim();

  const texto =
    'Nueva reseña desde la web\n\n' +
    filas.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\nComentario:\n${comment}\n\n` +
    'El visitante autorizó a publicar este comentario con su nombre y país.';

  const payload = {
    sender: { name: cfg.fromName, email: cfg.from },
    to: cfg.to.map(email => ({ email: email })),
    subject: asunto,
    htmlContent: html,
    textContent: texto
  };
  // Responder la reseña va directo al cliente, no al remitente técnico.
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    payload.replyTo = { email, name: name };
  }

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': cfg.key,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Brevo rechazó el envío', r.status, detail, '| remitente usado:', JSON.stringify(cfg.from));
      return res.status(502).json({ ok: false, error: 'send_failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error llamando a Brevo', err);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
}
