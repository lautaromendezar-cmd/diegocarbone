// Recibe una consulta de reserva del formulario del home y la manda por mail con Brevo.
// Usa las mismas variables que send-review.mjs:
//   BREVO_API_KEY   clave de la API de Brevo
//   REVIEW_FROM     remitente verificado en Brevo
//   REVIEW_FROM_NAME  opcional, nombre visible del remitente
// y el destinatario:
//   BOOKING_TO      casilla que recibe las consultas; si no está, usa REVIEW_TO

const SERVICES = {
  city:       'City Tour Buenos Aires',
  tigre:      'Tigre y San Isidro',
  gaucho:     'Día de Gaucho en la estancia',
  ezeiza:     'Traslado aeropuerto Ezeiza',
  aeroparque: 'Traslado Aeroparque',
  otro:       'Otro / todavía no sé'
};

const LANGS = { es: 'Español', en: 'Inglés', fr: 'Francés' };

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 2026-11-03 → 03/11/2026, para que Diego lo lea como siempre
function fechaLegible(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
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

  const destinatarios = emails(process.env.BOOKING_TO);
  const cfg = {
    key:  String(process.env.BREVO_API_KEY || '').trim(),
    to:   destinatarios.length ? destinatarios : emails(process.env.REVIEW_TO),
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

  const name     = String(body.name || '').trim().slice(0, 60);
  const email    = String(body.email || '').trim().slice(0, 80);
  const phone    = String(body.phone || '').trim().slice(0, 30);
  const date     = String(body.date || '').trim().slice(0, 10);
  const people   = String(body.people || '').trim().slice(0, 4);
  const message  = String(body.message || '').trim().slice(0, 900);
  const lang     = ['es', 'en', 'fr'].includes(body.lang) ? body.lang : 'en';
  const service  = SERVICES[body.service] || SERVICES.otro;

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const digits  = phone.replace(/\D/g, '');
  const phoneOk = digits.length >= 7;

  // Sin un mail o un teléfono válido, Diego no tiene cómo contestar.
  if (name.length < 2 || (!emailOk && !phoneOk)) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // Los bots de spam meten varios enlaces; una consulta real casi nunca.
  if ((message.match(/https?:\/\//gi) || []).length > 1) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const asunto = `Consulta de reserva: ${service} — ${name}` + (date ? ` (${fechaLegible(date)})` : '');

  const filas = [
    ['Nombre', name],
    ['Servicio', service],
    ['Fecha', date ? fechaLegible(date) : '—'],
    ['Personas', people || '—'],
    ['Mail', emailOk ? email : '—'],
    ['WhatsApp / teléfono', phoneOk ? phone : '—'],
    ['Idioma del visitante', LANGS[lang]]
  ];

  // Botón para contestarle por WhatsApp sin copiar el número a mano
  const waCliente = phoneOk ? `https://wa.me/${digits}` : '';
  const botones = [
    waCliente && `<a href="${waCliente}" style="display:inline-block;background:#c9a96e;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;margin:0 8px 8px 0">Responder por WhatsApp</a>`,
    emailOk && `<a href="mailto:${escapeHtml(email)}" style="display:inline-block;border:1px solid #c9a96e;color:#c9a96e;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;margin:0 8px 8px 0">Responder por mail</a>`
  ].filter(Boolean).join('');

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;background:#0a0a0a;padding:28px;color:#f5f2ed">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-top:3px solid #c9a96e;padding:28px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e">Transfer Buenos Aires City</p>
    <h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#f5f2ed">Nueva consulta de reserva</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${filas.map(([k, v]) => `
      <tr>
        <td style="padding:7px 0;color:rgba(245,242,237,.6);width:170px;vertical-align:top">${escapeHtml(k)}</td>
        <td style="padding:7px 0;color:#f5f2ed">${escapeHtml(v)}</td>
      </tr>`).join('')}
    </table>
    ${message ? `
    <p style="margin:22px 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e">Mensaje</p>
    <div style="background:#1a1a1a;border-left:2px solid #c9a96e;padding:16px 18px;font-size:15px;line-height:1.7;white-space:pre-wrap">${escapeHtml(message)}</div>` : ''}
    <div style="margin-top:24px">${botones}</div>
    <p style="margin:14px 0 0;font-size:12px;color:rgba(245,242,237,.55);line-height:1.6">
      Le escribió en ${escapeHtml(LANGS[lang].toLowerCase())}: conviene contestarle en el mismo idioma y rápido.
    </p>
  </div>
</div>`.trim();

  const texto =
    'Nueva consulta de reserva desde la web\n\n' +
    filas.map(([k, v]) => `${k}: ${v}`).join('\n') +
    (message ? `\n\nMensaje:\n${message}` : '') +
    (waCliente ? `\n\nResponder por WhatsApp: ${waCliente}` : '');

  const payload = {
    sender: { name: cfg.fromName, email: cfg.from },
    to: cfg.to.map(email => ({ email: email })),
    subject: asunto,
    htmlContent: html,
    textContent: texto
  };
  // Responder el mail va directo al cliente, no al remitente técnico.
  if (emailOk) payload.replyTo = { email, name: name };

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

    console.log('Consulta enviada', { service, lang, to: cfg.to.length });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error llamando a Brevo', err);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
}
