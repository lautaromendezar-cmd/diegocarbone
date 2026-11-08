// Páginas por servicio: WhatsApp en el idioma de la página, conversiones de Ads y formulario.
// Las mismas etiquetas de Ads que el home (index.html). Si cambian allá, cambiarlas acá.
(function () {
  var LANG = document.documentElement.lang || 'en';
  var WA_NUM = '5491144742207';
  var ADS_WA = ['AW-18299581753/905dCNf6zdMcELnq9ZVE', 'AW-18299581753/v45QCMi3iMscELnq9ZVE'];
  var ADS_FORM_ENVIADO = 'AW-18299581753/a1hQCNuT3qcdELnq9ZVE';   // «Formulario de reserva» (principal)
  var ADS_FORM_INICIADO = 'AW-18299581753/5R_yCPbl1bQdELnq9ZVE';  // «Formulario iniciado» (secundaria, 8-nov)

  var WA_MSG = {
    city: {
      es: 'Hola, quiero reservar el City Tour Buenos Aires (USD 200)',
      en: "Hi! I'd like to book the Buenos Aires City Tour (USD 200).",
      fr: 'Bonjour, je souhaite réserver le City Tour de Buenos Aires (200 USD).'
    },
    tigre: {
      es: 'Hola, quiero reservar el Tour Tigre y San Isidro (USD 350)',
      en: "Hi! I'd like to book the Tigre & San Isidro Tour (USD 350).",
      fr: 'Bonjour, je souhaite réserver la visite de Tigre et San Isidro (350 USD).'
    },
    gaucho: {
      es: 'Hola, quiero reservar el Gaucho Day en la Estancia (USD 550)',
      en: "Hi! I'd like to book the Gaucho Day at the Estancia (USD 550).",
      fr: "Bonjour, je souhaite réserver la journée Gaucho à l'estancia (550 USD)."
    },
    traslado: {
      es: 'Hola, quiero consultar sobre un traslado (aeropuerto o puerto)',
      en: "Hi! I'd like to ask about a transfer (airport or port).",
      fr: 'Bonjour, je souhaite me renseigner sur un transfert (aéroport ou port).'
    },
    consulta: {
      es: 'Hola, quiero hacer una consulta sobre los tours',
      en: 'Hi! I have a question about your tours.',
      fr: 'Bonjour, je souhaite poser une question sur vos visites.'
    }
  };

  function conversion(sendTo) {
    if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: sendTo });
  }
  function clarityEvent(nombre, tags) {
    if (typeof clarity !== 'function') return;
    for (var k in tags) clarity('set', k, tags[k]);
    clarity('event', nombre);
  }

  // WhatsApp: mensaje en el idioma de la página. Sin JS quedan como wa.me pelado y abren igual.
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    var msg = WA_MSG[a.dataset.wa];
    if (msg) a.href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg[LANG] || msg.en);
    a.addEventListener('click', function () {
      clarityEvent('whatsapp_click', { wa_idioma: LANG, wa_boton: a.dataset.wa, pagina: location.pathname });
      if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: ADS_WA, value: 1.0, currency: 'ARS' });
    });
  });

  // Banderas: además de navegar, dejan el idioma elegido para el home
  document.querySelectorAll('.lang-btn[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('tba_lang', a.dataset.lang); } catch (e) {}
    });
  });
  try { localStorage.setItem('tba_lang', LANG); } catch (e) {}

  // Formulario
  var form = document.getElementById('bookingForm');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var btn = $('bf-submit');
  var sendError = $('bf-send-error');

  var hoy = new Date();
  $('bf-date').min = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // «Formulario iniciado»: la primera vez que alguien toca un campo. Separa «nadie lo empieza»
  // de «lo empiezan y lo abandonan».
  var iniciado = false;
  form.addEventListener('focusin', function () {
    if (iniciado) return;
    iniciado = true;
    conversion(ADS_FORM_INICIADO);
    clarityEvent('form_iniciado', { pagina: location.pathname });
  });

  function marcarContacto(on) {
    $('bf-f-contact').classList.toggle('bf-invalid', on);
    $('bf-e-contact').classList.toggle('show', on);
  }
  ['bf-email', 'bf-phone'].forEach(function (id) {
    $(id).addEventListener('input', function () { marcarContacto(false); });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (btn.disabled) return;

    var email = $('bf-email').value.trim();
    var phone = $('bf-phone').value.trim();
    var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    var phoneOk = phone.replace(/\D/g, '').length >= 7;
    marcarContacto(!(emailOk || phoneOk));
    if (!(emailOk || phoneOk)) { (email ? $('bf-email') : $('bf-phone')).focus(); return; }

    sendError.classList.remove('show');
    btn.disabled = true;

    fetch('/api/send-booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: $('bf-name').value.trim(),
        email: email,
        phone: phone,
        service: $('bf-service').value,
        date: $('bf-date').value,
        people: $('bf-people').value,
        message: '',
        lang: LANG,
        page: location.pathname,
        website: $('bf-website').value
      })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        if (!data || !data.ok) return Promise.reject('respuesta_invalida');
        form.style.display = 'none';
        $('bf-thanks').classList.add('show');
        conversion(ADS_FORM_ENVIADO);
        clarityEvent('form_enviado', { form_servicio: $('bf-service').value, pagina: location.pathname });
      })
      .catch(function () {
        btn.disabled = false;
        sendError.classList.add('show');
        clarityEvent('form_error', {});
      });
  });
})();
