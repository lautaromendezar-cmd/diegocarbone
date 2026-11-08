// Genera las páginas por servicio: /en|/fr|/es + /gaucho-day, /tigre, /city-tour, /airport-transfer.
//
//   node herramientas/generar-paginas.mjs
//
// Por qué existen (8-nov-2026): Google Ads calificaba «por debajo del promedio» la experiencia en la
// página de destino de casi todas las keywords, porque todas caían en el home. Cada keyword de un tour
// apunta ahora a su página (URL final a nivel keyword), en el idioma del grupo de anuncios.
//
// REGLA: todo el contenido sale de lo que ya dice el home (precios, duración, qué incluye, el guía).
// No inventar datos de Diego. Si algo cambia en el home, cambiarlo acá y volver a generar.
// Las páginas salen en HTML estático por idioma (no por JS como el home) para que Google lea el
// contenido del idioma del anuncio sin ejecutar nada.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://www.transferbuenosaires.com';
const LANGS = ['en', 'fr', 'es'];
const SLUGS = ['gaucho-day', 'tigre', 'city-tour', 'airport-transfer'];

const UI = {
  en: {
    htmlLang: 'en', ogLocale: 'en_US',
    brandSub: 'Private Tours &amp; Transfers',
    navCta: 'Book',
    ctaForm: 'Check availability',
    ctaWa: 'WhatsApp',
    noPay: 'Asking is free. Diego replies with availability.',
    fDuration: 'Duration', fRate: 'Rate', fGroup: 'Group', fLangs: 'Your guide speaks', fPay: 'Payment',
    vGroup: 'Private · max. 4 people', vLangs: 'English · French · Spanish', vPay: 'Cash · card +12%',
    aboutEyebrow: 'The experience', highlightsTitle: 'What you’ll see',
    guideEyebrow: 'Your guide', guideTitle: 'Diego, <em>in person</em>',
    guide: [
      ['Every tour, personally guided', 'Diego guides every tour himself — no intermediaries, no surprises.'],
      ['Six years of premium service', 'Six years creating unforgettable experiences in Buenos Aires.'],
      ['Licensed professional driver', 'On time, always. Licensed hybrid vehicle, committed to your comfort and safety.'],
      ['Fluent English and French', 'Every story, anecdote and recommendation comes through exactly as intended.']
    ],
    formEyebrow: 'Availability', formTitle: 'Ask for <em>your date</em>',
    formLead: 'Tell us the date and how many you are. Diego replies by email or WhatsApp, whichever you prefer. No payment, no commitment.',
    lService: 'Tour or transfer', lDate: 'Date', approx: '(approx.)', lPeople: 'Guests',
    lEmail: 'Email', lWa: 'WhatsApp', either: 'Either one is enough.', lName: 'Your name', optional: '(optional)',
    phPhone: '+1 555 123 4567',
    submit: 'Check availability',
    errContact: 'Please leave an email or WhatsApp number so we can reply.',
    note: 'No payment, no commitment. We never share your details.',
    sendErr: 'We couldn’t send your request. Please try again in a moment, or message us on WhatsApp.',
    thanksT: 'Request received', thanksP: 'Diego will get back to you by email or WhatsApp. If it’s urgent, message him directly.',
    or: 'or', waBtn: 'Message us on WhatsApp',
    faqTitle: 'Frequently asked questions',
    faq: [
      ['Is it really private?', 'Yes. Only your group travels — no strangers, no third-party schedules. Pace, stops and route are designed around you. Maximum 4 people per service.'],
      ['How do I pay?', 'Prices are in US dollars, cash. Credit card payments carry a 12% surcharge.'],
      ['Do I have to pay to ask for a date?', 'No. Send the form or a WhatsApp message and Diego replies with availability. No payment, no commitment.'],
      ['Which language is the tour in?', 'English, French or Spanish — Diego speaks all three.']
    ],
    otherTitle: 'Other <em>experiences</em>', see: 'See details',
    homeLabel: 'All tours and transfers',
    rights: '© 2026 Transfer Buenos Aires City. All rights reserved.', design: 'Web Design:',
    services: {
      city: 'Buenos Aires City Tour · USD 200', tigre: 'Tigre &amp; San Isidro · USD 350',
      gaucho: 'Gaucho Day at the Estancia · USD 550', ezeiza: 'Ezeiza Airport transfer',
      aeroparque: 'Aeroparque transfer', otro: 'Something else / not sure yet'
    },
    price: n => `USD ${n}`
  },
  fr: {
    htmlLang: 'fr', ogLocale: 'fr_FR',
    brandSub: 'Visites et transferts privés',
    navCta: 'Réservez',
    ctaForm: 'Vérifiez la disponibilité',
    ctaWa: 'WhatsApp',
    noPay: 'Demander est gratuit. Diego vous répond avec ses disponibilités.',
    fDuration: 'Durée', fRate: 'Tarif', fGroup: 'Groupe', fLangs: 'Votre guide parle', fPay: 'Paiement',
    vGroup: 'Privé · 4 personnes max.', vLangs: 'Français · anglais · espagnol', vPay: 'Espèces · carte +12 %',
    aboutEyebrow: 'L’expérience', highlightsTitle: 'Au programme',
    guideEyebrow: 'Votre guide', guideTitle: 'Diego, <em>en personne</em>',
    guide: [
      ['Chaque visite, guidée personnellement', 'Diego mène chaque visite lui-même — sans intermédiaires, sans surprises.'],
      ['Six ans de services premium', 'Six ans à créer des expériences inoubliables à Buenos Aires.'],
      ['Chauffeur professionnel agréé', 'Ponctuel, toujours. Véhicule hybride agréé, engagé pour votre confort et votre sécurité.'],
      ['Il parle couramment français', 'Chaque histoire, anecdote et recommandation passe exactement comme prévu.']
    ],
    formEyebrow: 'Disponibilités', formTitle: 'Demandez <em>votre date</em>',
    formLead: 'Indiquez la date et le nombre de personnes. Diego vous répond par e-mail ou par WhatsApp, comme vous préférez. Sans paiement ni engagement.',
    lService: 'Visite ou transfert', lDate: 'Date', approx: '(approx.)', lPeople: 'Personnes',
    lEmail: 'E-mail', lWa: 'WhatsApp', either: 'L’un des deux suffit.', lName: 'Votre nom', optional: '(facultatif)',
    phPhone: '+33 6 12 34 56 78',
    submit: 'Demandez la disponibilité',
    errContact: 'Laissez un e-mail ou un numéro WhatsApp pour que nous puissions vous répondre.',
    note: 'Sans paiement ni engagement. Vos données ne sont jamais partagées.',
    sendErr: 'Nous n’avons pas pu envoyer votre demande. Réessayez dans un instant, ou écrivez-nous sur WhatsApp.',
    thanksT: 'Demande reçue', thanksP: 'Diego vous répondra par e-mail ou WhatsApp. Si c’est urgent, écrivez-lui directement.',
    or: 'ou', waBtn: 'Écrivez-nous sur WhatsApp',
    faqTitle: 'Questions fréquentes',
    faq: [
      ['La visite est-elle vraiment privée ?', 'Oui. Seul votre groupe voyage — sans inconnus, sans horaires imposés par des tiers. Rythme, arrêts et itinéraire sont conçus pour vous. 4 personnes maximum par service.'],
      ['Comment payer ?', 'Les prix sont en dollars américains, en espèces. Les paiements par carte de crédit entraînent un supplément de 12 %.'],
      ['Faut-il payer pour demander une date ?', 'Non. Envoyez le formulaire ou un message WhatsApp et Diego vous répond avec ses disponibilités. Sans paiement ni engagement.'],
      ['En quelle langue se déroule la visite ?', 'En français, en anglais ou en espagnol — Diego parle les trois.']
    ],
    otherTitle: 'Autres <em>expériences</em>', see: 'Voir le détail',
    homeLabel: 'Toutes les visites et transferts',
    rights: '© 2026 Transfer Buenos Aires City. Tous droits réservés.', design: 'Conception Web :',
    services: {
      city: 'City Tour Buenos Aires · 200 USD', tigre: 'Tigre et San Isidro · 350 USD',
      gaucho: 'Journée Gaucho à l’estancia · 550 USD', ezeiza: 'Transfert aéroport Ezeiza',
      aeroparque: 'Transfert Aeroparque', otro: 'Autre / je ne sais pas encore'
    },
    price: n => `${n} USD`
  },
  es: {
    htmlLang: 'es', ogLocale: 'es_AR',
    brandSub: 'Tours privados y traslados',
    navCta: 'Reservar',
    ctaForm: 'Consultá disponibilidad',
    ctaWa: 'WhatsApp',
    noPay: 'Consultar no tiene costo. Diego te responde con la disponibilidad.',
    fDuration: 'Duración', fRate: 'Tarifa', fGroup: 'Grupo', fLangs: 'Tu guía habla', fPay: 'Pago',
    vGroup: 'Privado · máx. 4 personas', vLangs: 'Español · inglés · francés', vPay: 'Efectivo · tarjeta +12%',
    aboutEyebrow: 'La experiencia', highlightsTitle: 'Qué vas a ver',
    guideEyebrow: 'Tu guía', guideTitle: 'Diego, <em>en persona</em>',
    guide: [
      ['Cada tour, guiado por él', 'Diego conduce cada tour personalmente — sin intermediarios, sin sorpresas.'],
      ['Seis años de servicio premium', 'Seis años creando experiencias inolvidables en Buenos Aires.'],
      ['Conductor profesional habilitado', 'Puntual, siempre. Vehículo híbrido habilitado, comprometido con tu comodidad y seguridad.'],
      ['Inglés y francés con fluidez', 'Cada historia, anécdota y recomendación llega exactamente como fue pensada.']
    ],
    formEyebrow: 'Disponibilidad', formTitle: 'Consultá <em>tu fecha</em>',
    formLead: 'Contanos la fecha y cuántos son. Diego te responde por mail o por WhatsApp, como prefieras. Sin pago ni compromiso.',
    lService: 'Tour o traslado', lDate: 'Fecha', approx: '(aprox.)', lPeople: 'Personas',
    lEmail: 'Email', lWa: 'WhatsApp', either: 'Con uno de los dos alcanza.', lName: 'Tu nombre', optional: '(opcional)',
    phPhone: '+54 9 11 1234-5678',
    submit: 'Consultar disponibilidad',
    errContact: 'Dejanos un mail o un WhatsApp para poder responderte.',
    note: 'Sin pago ni compromiso. No compartimos tus datos.',
    sendErr: 'No pudimos enviar la consulta. Probá de nuevo en un momento, o escribinos por WhatsApp.',
    thanksT: 'Recibimos tu consulta', thanksP: 'Diego te va a responder por mail o WhatsApp. Si es urgente, escribile directo.',
    or: 'o', waBtn: 'Escribinos por WhatsApp',
    faqTitle: 'Preguntas frecuentes',
    faq: [
      ['¿Es realmente privado?', 'Sí. Viaja solo tu grupo — sin extraños ni horarios de terceros. Ritmo, paradas y recorrido pensados para vos. Máximo 4 personas por servicio.'],
      ['¿Cómo se paga?', 'Los precios son en dólares, en efectivo. Con tarjeta de crédito hay un recargo del 12%.'],
      ['¿Tengo que pagar para consultar una fecha?', 'No. Mandá el formulario o un WhatsApp y Diego te responde con la disponibilidad. Sin pago ni compromiso.'],
      ['¿En qué idioma es el tour?', 'En español, inglés o francés — Diego habla los tres.']
    ],
    otherTitle: 'Otras <em>experiencias</em>', see: 'Ver detalle',
    homeLabel: 'Todos los tours y traslados',
    rights: '© 2026 Transfer Buenos Aires City. Todos los derechos reservados.', design: 'Diseño Web:',
    services: {
      city: 'City Tour Buenos Aires · USD 200', tigre: 'Tigre y San Isidro · USD 350',
      gaucho: 'Gaucho Day en la estancia · USD 550', ezeiza: 'Traslado aeropuerto Ezeiza',
      aeroparque: 'Traslado Aeroparque', otro: 'Otro / todavía no sé'
    },
    price: n => `USD ${n}`
  }
};

// Contenido por servicio. Fuente: tarjetas y tabla de traslados del index.html.
const PAGES = {
  'gaucho-day': {
    service: 'gaucho', wa: 'gaucho', img: 'serv3.webp', price: 550, card: 'gaucho',
    en: {
      title: 'Private Gaucho Day Tour from Buenos Aires · USD 550',
      desc: 'A full private day at a traditional gaucho estancia from Buenos Aires: horseback riding, folk music and asado. English & French-speaking guide. USD 550.',
      eyebrow: 'Private tour · Argentine countryside',
      h1: 'Gaucho Day Tour<br>from Buenos Aires',
      sub: 'A full private day at a traditional estancia: horseback riding, folk music and an asado — with your own English &amp; French-speaking guide.',
      duration: 'Full day', notes: ['Double base', 'Max. 4 people'],
      about: 'Immerse yourself in the Argentine countryside. A traditional gaucho ranch welcomes you with horseback riding, folk music, and a barbecue — a unique and unforgettable experience.',
      highlights: ['A traditional gaucho estancia in the Argentine countryside', 'Horseback riding', 'Folk music', 'Asado (Argentine barbecue) included', 'A full day, just your group'],
      faq: [['What’s included?', 'A full day at a traditional estancia with horseback riding, folk music and an asado (Argentine barbecue).']],
      alt: 'Gaucho on horseback at sunset on the Argentine pampas',
      cardName: 'Gaucho Day at the Estancia'
    },
    fr: {
      title: 'Journée gaucho à l’estancia depuis Buenos Aires · 550 USD',
      desc: 'Une journée privée dans une estancia gaucho traditionnelle depuis Buenos Aires : balade à cheval, musique folklorique et asado. Guide francophone. 550 USD.',
      eyebrow: 'Visite privée · campagne argentine',
      h1: 'Journée gaucho<br>à l’estancia',
      sub: 'Une journée privée dans une estancia traditionnelle : balade à cheval, musique folklorique et asado — avec votre guide francophone.',
      duration: 'Journée complète', notes: ['Base double', '4 personnes max.'],
      about: 'Aventurez-vous dans la campagne argentine. Un ranch gaucho traditionnel vous accueille avec des balades à cheval, de la musique folklorique et un barbecue — une expérience unique et inoubliable.',
      highlights: ['Une estancia gaucho traditionnelle, en pleine campagne argentine', 'Balade à cheval', 'Musique folklorique', 'Asado (barbecue argentin) inclus', 'Une journée complète, rien que pour votre groupe'],
      faq: [['Que comprend la journée ?', 'Une journée complète dans une estancia traditionnelle, avec balade à cheval, musique folklorique et asado (barbecue argentin).']],
      alt: 'Gaucho à cheval au coucher du soleil dans la pampa argentine',
      cardName: 'Journée gaucho à l’estancia'
    },
    es: {
      title: 'Gaucho Day: día de campo en estancia desde Buenos Aires · USD 550',
      desc: 'Un día completo y privado en una estancia gaucha tradicional: cabalgata, música folklórica y asado a las brasas. Guía en español, inglés y francés. USD 550.',
      eyebrow: 'Tour privado · campo argentino',
      h1: 'Gaucho Day<br>en la estancia',
      sub: 'Un día completo y privado en una estancia tradicional: cabalgata, música folklórica y asado a las brasas.',
      duration: 'Día completo', notes: ['Base doble', 'Máx. 4 personas'],
      about: 'Adentrate en el campo argentino. Una estancia gaucha tradicional te recibe con cabalgatas, música folklórica y un asado a las brasas — una experiencia única e irrepetible.',
      highlights: ['Estancia gaucha tradicional, en pleno campo', 'Cabalgata', 'Música folklórica', 'Asado a las brasas incluido', 'Un día completo, solo tu grupo'],
      faq: [['¿Qué incluye?', 'Un día completo en una estancia tradicional, con cabalgata, música folklórica y asado a las brasas.']],
      alt: 'Gaucho a caballo al atardecer en el campo argentino',
      cardName: 'Gaucho Day en la estancia'
    }
  },
  tigre: {
    service: 'tigre', wa: 'tigre', img: 'serv2.webp', price: 350, card: 'tigre',
    en: {
      title: 'Private Tigre Delta & San Isidro Tour from Buenos Aires · USD 350',
      desc: 'Half-day private tour from Buenos Aires to the Tigre Delta and San Isidro, with a boat ride through the delta. Transfers included. English & French-speaking guide.',
      eyebrow: 'Private tour · Tigre Delta',
      h1: 'Tigre Delta &amp;<br>San Isidro Private Tour',
      sub: 'Half a day away from the city: the channels of the Tigre Delta by boat, ending at the San Isidro cathedral. Transfers included.',
      duration: 'Half day', notes: ['Double base', 'Max. 4 people'],
      about: 'Escape the city to the labyrinthine channels of the Tigre Delta. A private excursion that ends at the San Isidro cathedral.',
      highlights: ['The labyrinthine channels of the Tigre Delta', 'A shared boat ride through the delta', 'San Isidro and its cathedral', 'Transfers included'],
      faq: [['What’s included?', 'Transfers and a shared boat ride through the Tigre Delta. The tour ends at the San Isidro cathedral.']],
      alt: 'Wooden passenger boats moored on the river in Tigre',
      cardName: 'Tigre &amp; San Isidro Tour'
    },
    fr: {
      title: 'Excursion privée au Delta du Tigre et à San Isidro · 350 USD',
      desc: 'Excursion privée d’une demi-journée depuis Buenos Aires au Delta du Tigre et à San Isidro, avec promenade en bateau. Transferts compris. Guide francophone.',
      eyebrow: 'Visite privée · Delta du Tigre',
      h1: 'Excursion privée<br>au Delta du Tigre',
      sub: 'Une demi-journée loin de la ville : les canaux du Delta du Tigre en bateau, jusqu’à la cathédrale de San Isidro. Transferts compris.',
      duration: 'Demi-journée', notes: ['Base double', '4 personnes max.'],
      about: 'Échappez-vous de la ville vers les canaux labyrinthiques du Delta du Tigre. Une excursion privée qui se termine à la cathédrale de San Isidro.',
      highlights: ['Les canaux labyrinthiques du Delta du Tigre', 'Une promenade en bateau collectif dans le delta', 'San Isidro et sa cathédrale', 'Transferts compris'],
      faq: [['Que comprend l’excursion ?', 'Les transferts et une promenade en bateau collectif dans le Delta du Tigre. L’excursion se termine à la cathédrale de San Isidro.']],
      alt: 'Bateaux en bois amarrés sur le fleuve à Tigre',
      cardName: 'Circuit Tigre et San Isidro'
    },
    es: {
      title: 'Tour privado Tigre y San Isidro desde Buenos Aires · USD 350',
      desc: 'Medio día privado desde Buenos Aires al Delta del Tigre y San Isidro, con paseo en lancha por el delta. Traslados incluidos.',
      eyebrow: 'Tour privado · Delta del Tigre',
      h1: 'Tour privado<br>Tigre y San Isidro',
      sub: 'Medio día fuera de la ciudad: los canales del Delta del Tigre en lancha, hasta la catedral de San Isidro. Traslados incluidos.',
      duration: 'Medio día', notes: ['Base doble', 'Máx. 4 personas'],
      about: 'Escapate de la ciudad hacia los canales laberínticos del Delta del Tigre. Una excursión privada que termina en la catedral de San Isidro.',
      highlights: ['Los canales laberínticos del Delta del Tigre', 'Paseo en lancha colectiva por el delta', 'San Isidro y su catedral', 'Traslados incluidos'],
      faq: [['¿Qué incluye?', 'Los traslados y un paseo en lancha colectiva por el Delta del Tigre. El tour termina en la catedral de San Isidro.']],
      alt: 'Lanchas de madera amarradas en el río, en Tigre',
      cardName: 'Tour Tigre y San Isidro'
    }
  },
  'city-tour': {
    service: 'city', wa: 'city', img: 'serv1.webp', price: 200, card: 'city',
    en: {
      title: 'Private Buenos Aires City Tour with English & French-speaking Guide · USD 200',
      desc: 'Four-hour private city tour of Buenos Aires: Plaza de Mayo, La Boca, San Telmo, Puerto Madero and Recoleta. Your own English & French-speaking guide. USD 200.',
      eyebrow: 'Private tour · Buenos Aires',
      h1: 'Private Buenos Aires<br>City Tour',
      sub: 'Four hours through the city’s most iconic neighborhoods — Plaza de Mayo, La Boca, San Telmo, Puerto Madero and Recoleta — with your own guide.',
      duration: '4 hours', notes: ['Max. 4 people'],
      about: 'A journey through the city’s most iconic neighborhoods. History, architecture, and culture in a half-day experience.',
      highlights: ['Plaza de Mayo', 'La Boca', 'San Telmo', 'Puerto Madero', 'Recoleta'],
      faq: [['Which neighborhoods does it cover?', 'Plaza de Mayo, La Boca, San Telmo, Puerto Madero and Recoleta, in about four hours.']],
      alt: 'Avenida Corrientes and the Obelisk of Buenos Aires at sunset',
      cardName: 'Buenos Aires City Tour'
    },
    fr: {
      title: 'Visite guidée privée de Buenos Aires en français · 200 USD',
      desc: 'Visite privée de Buenos Aires en quatre heures : Plaza de Mayo, La Boca, San Telmo, Puerto Madero et Recoleta. Votre guide francophone. 200 USD.',
      eyebrow: 'Visite privée · Buenos Aires',
      h1: 'Visite guidée privée<br>de Buenos Aires',
      sub: 'Quatre heures dans les quartiers les plus emblématiques — Plaza de Mayo, La Boca, San Telmo, Puerto Madero et Recoleta — avec votre guide francophone.',
      duration: '4 heures', notes: ['4 personnes max.'],
      about: 'Un parcours à travers les quartiers les plus emblématiques de la ville. Histoire, architecture et culture en une demi-journée.',
      highlights: ['Plaza de Mayo', 'La Boca', 'San Telmo', 'Puerto Madero', 'Recoleta'],
      faq: [['Quels quartiers visite-t-on ?', 'Plaza de Mayo, La Boca, San Telmo, Puerto Madero et Recoleta, en quatre heures environ.']],
      alt: 'L’avenue Corrientes et l’Obélisque de Buenos Aires au coucher du soleil',
      cardName: 'Visite de Buenos Aires'
    },
    es: {
      title: 'City tour privado por Buenos Aires · USD 200',
      desc: 'Cuatro horas de tour privado por Buenos Aires: Plaza de Mayo, La Boca, San Telmo, Puerto Madero y Recoleta. Con tu propio guía. USD 200.',
      eyebrow: 'Tour privado · Buenos Aires',
      h1: 'City tour privado<br>por Buenos Aires',
      sub: 'Cuatro horas por los barrios más icónicos — Plaza de Mayo, La Boca, San Telmo, Puerto Madero y Recoleta — con tu propio guía.',
      duration: '4 horas', notes: ['Máx. 4 personas'],
      about: 'Recorrido por los barrios más icónicos de la ciudad. Historia, arquitectura y cultura en una experiencia de media jornada.',
      highlights: ['Plaza de Mayo', 'La Boca', 'San Telmo', 'Puerto Madero', 'Recoleta'],
      faq: [['¿Qué barrios recorre?', 'Plaza de Mayo, La Boca, San Telmo, Puerto Madero y Recoleta, en unas cuatro horas.']],
      alt: 'Avenida Corrientes y el Obelisco de Buenos Aires al atardecer',
      cardName: 'City Tour Buenos Aires'
    }
  },
  'airport-transfer': {
    service: 'ezeiza', wa: 'traslado', img: 'auto.webp', price: 35, card: 'transfer', transfer: true,
    en: {
      title: 'Private Airport Transfers in Buenos Aires · Ezeiza USD 70 · Aeroparque USD 35',
      desc: 'Private transfers to Ezeiza, Aeroparque and the Buenos Aires cruise terminal. Fixed rate per vehicle, max. 4 people. English & French-speaking driver.',
      eyebrow: 'Private transfer · Buenos Aires',
      h1: 'Private Airport<br>Transfers',
      sub: 'Ezeiza, Aeroparque and the cruise terminal. Fixed rates per vehicle, no surprises — from your door to your destination.',
      from: 'From', rate: 'Fixed, per vehicle', notes: ['Per vehicle', 'Max. 4 people'],
      about: 'Private transfers to airports and the cruise terminal. Fixed rates, no surprises — from your door to your destination. Prices are per vehicle, not per person: a fixed rate regardless of traffic or time of day.',
      tableHead: ['Destination', 'Cash'],
      rows: [['Ezeiza International Airport', 'Ministro Pistarini', 70], ['Aeroparque', 'Jorge Newbery', 35], ['Cruise Terminal → Aeroparque', 'Benito Quinquela Martín', 35], ['Cruise Terminal → Ezeiza', '', 70]],
      tableNote: 'Credit card payments carry a 12% surcharge.',
      faq: [['Is the price per person?', 'No. Prices are per vehicle — a fixed rate regardless of traffic or time of day. Maximum 4 people per service.'], ['Do you also go to the cruise terminal?', 'Yes: cruise terminal to Aeroparque (USD 35) and to Ezeiza (USD 70).']],
      alt: 'White hybrid sedan used for private transfers, parked on a cobblestone street in Buenos Aires',
      cardName: 'Airport Transfers'
    },
    fr: {
      title: 'Transferts privés aéroport à Buenos Aires · Ezeiza 70 USD · Aeroparque 35 USD',
      desc: 'Transferts privés vers Ezeiza, Aeroparque et le terminal de croisières de Buenos Aires. Tarif fixe par véhicule, 4 personnes max. Chauffeur francophone.',
      eyebrow: 'Transfert privé · Buenos Aires',
      h1: 'Transferts privés<br>aéroport',
      sub: 'Ezeiza, Aeroparque et le terminal de croisières. Tarifs fixes par véhicule, sans surprises — de votre porte à votre destination.',
      from: 'À partir de', rate: 'Fixe, par véhicule', notes: ['Par véhicule', '4 personnes max.'],
      about: 'Transferts privés vers les aéroports et le terminal de croisières. Tarifs fixes, sans surprises — de votre porte à votre destination. Les prix sont par véhicule, pas par personne : un tarif fixe quel que soit le trafic ou l’heure.',
      tableHead: ['Destination', 'Espèces'],
      rows: [['Aéroport international Ezeiza', 'Ministro Pistarini', 70], ['Aeroparque', 'Jorge Newbery', 35], ['Terminal de croisière → Aeroparque', 'Benito Quinquela Martín', 35], ['Terminal de croisière → Ezeiza', '', 70]],
      tableNote: 'Les paiements par carte de crédit entraînent un supplément de 12 %.',
      faq: [['Le prix est-il par personne ?', 'Non. Les prix sont par véhicule — un tarif fixe quel que soit le trafic ou l’heure. 4 personnes maximum par service.'], ['Allez-vous aussi au terminal de croisières ?', 'Oui : terminal de croisière vers Aeroparque (35 USD) et vers Ezeiza (70 USD).']],
      alt: 'Berline hybride blanche pour les transferts privés, garée sur une rue pavée de Buenos Aires',
      cardName: 'Transferts aéroport'
    },
    es: {
      title: 'Traslados privados a Ezeiza y Aeroparque · Buenos Aires',
      desc: 'Traslados privados a Ezeiza, Aeroparque y la terminal de cruceros de Buenos Aires. Tarifa fija por vehículo, máx. 4 personas.',
      eyebrow: 'Traslado privado · Buenos Aires',
      h1: 'Traslados privados<br>al aeropuerto',
      sub: 'Ezeiza, Aeroparque y la terminal de cruceros. Tarifa fija por vehículo, sin sorpresas — de tu puerta a tu destino.',
      from: 'Desde', rate: 'Fija, por vehículo', notes: ['Por vehículo', 'Máx. 4 personas'],
      about: 'Traslados privados a aeropuertos y terminal de cruceros. Tarifas fijas, sin sorpresas — de tu puerta a tu destino. Precios por vehículo, no por persona: tarifa fija sin importar el tráfico ni el horario.',
      tableHead: ['Destino', 'Efectivo'],
      rows: [['Aeropuerto Internacional Ezeiza', 'Ministro Pistarini', 70], ['Aeroparque', 'Jorge Newbery', 35], ['Terminal de Cruceros → Aeroparque', 'Benito Quinquela Martín', 35], ['Terminal de Cruceros → Ezeiza', '', 70]],
      tableNote: 'Pagos con tarjeta de crédito tienen un recargo del 12%.',
      faq: [['¿El precio es por persona?', 'No. Es por vehículo — tarifa fija sin importar el tráfico ni el horario. Máximo 4 personas por servicio.'], ['¿También van a la terminal de cruceros?', 'Sí: terminal de cruceros a Aeroparque (USD 35) y a Ezeiza (USD 70).']],
      alt: 'Sedán híbrido blanco para traslados privados, estacionado en una calle empedrada de Buenos Aires',
      cardName: 'Traslados al aeropuerto'
    }
  }
};

const FLAGS = {
  es: '<svg viewBox="0 0 22 15" xmlns="http://www.w3.org/2000/svg"><rect width="22" height="15" fill="#c60b1e"/><rect y="3.75" width="22" height="7.5" fill="#ffc400"/></svg>',
  en: '<svg viewBox="0 0 22 15" xmlns="http://www.w3.org/2000/svg"><rect width="22" height="15" fill="#012169"/><path d="M0,0 L22,15 M22,0 L0,15" stroke="#fff" stroke-width="3"/><path d="M0,0 L22,15 M22,0 L0,15" stroke="#c8102e" stroke-width="1.8"/><rect x="9" width="4" height="15" fill="#fff"/><rect y="5.5" width="22" height="4" fill="#fff"/><rect x="9.8" width="2.4" height="15" fill="#c8102e"/><rect y="6.3" width="22" height="2.4" fill="#c8102e"/></svg>',
  fr: '<svg viewBox="0 0 22 15" xmlns="http://www.w3.org/2000/svg"><rect width="7.33" height="15" fill="#002395"/><rect x="7.33" width="7.34" height="15" fill="#fff"/><rect x="14.67" width="7.33" height="15" fill="#ed2939"/></svg>'
};
const FLAG_NAME = { es: 'Español', en: 'English', fr: 'Français' };
const WA_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

const sinTags = s => s.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
const attr = s => sinTags(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function pagina(lang, slug) {
  const u = UI[lang];
  const p = PAGES[slug];
  const t = p[lang];
  const url = `${SITIO}/${lang}/${slug}`;
  const img = `${SITIO}/img/${p.img}`;

  const alternates = LANGS.map(l => `  <link rel="alternate" hreflang="${l}" href="${SITIO}/${l}/${slug}" />`).join('\n')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITIO}/en/${slug}" />`;

  // Schema: oferta con precio. Sin AggregateRating (ver memoria: las reseñas se moderan).
  const ld = {
    '@context': 'https://schema.org',
    '@type': p.transfer ? 'Service' : 'TouristTrip',
    name: sinTags(t.h1),
    description: sinTags(t.desc),
    url,
    image: img,
    inLanguage: lang,
    provider: { '@type': 'LocalBusiness', name: 'Transfer Buenos Aires City', url: `${SITIO}/`, telephone: '+5491144742207' },
    offers: p.transfer
      ? t.rows.map(r => ({ '@type': 'Offer', name: r[0], price: String(r[2]), priceCurrency: 'USD' }))
      : { '@type': 'Offer', price: String(p.price), priceCurrency: 'USD', url }
  };

  const faq = [...t.faq, ...u.faq];
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };

  const precio = p.transfer
    ? `<span class="price-from">${t.from}</span><span class="price-num">${u.price(p.price)}</span>`
    : `<span class="price-num">${u.price(p.price)}</span>`;

  const hechos = [
    p.transfer ? [u.fRate, t.rate] : [u.fDuration, t.duration],
    [u.fGroup, u.vGroup],
    [u.fLangs, u.vLangs],
    [u.fPay, u.vPay]
  ];

  const detalle = p.transfer
    ? `<table class="t-table">
          <thead><tr><th>${t.tableHead[0]}</th><th>${t.tableHead[1]}</th></tr></thead>
          <tbody>
${t.rows.map(r => `            <tr><td>${r[0]}${r[1] ? `<span>${r[1]}</span>` : ''}</td><td class="t-cell-price">${u.price(r[2])}</td></tr>`).join('\n')}
          </tbody>
        </table>
        <p class="t-note">${t.tableNote}</p>`
    : `<h3 class="t-h3">${u.highlightsTitle}</h3>
        <ul class="t-list">
${t.highlights.map(h => `          <li>${h}</li>`).join('\n')}
        </ul>`;

  const otros = SLUGS.filter(s => s !== slug).map(s => {
    const o = PAGES[s];
    const ot = o[lang];
    const pr = o.transfer ? `${ot.from} ${u.price(o.price)}` : u.price(o.price);
    return `      <a class="o-card" href="/${lang}/${s}">
        <img src="/img/${o.img}" alt="${attr(ot.alt)}" loading="lazy" width="1280" height="956" />
        <span class="o-body">
          <span class="o-name">${ot.cardName}</span>
          <span class="o-meta">${pr} · <span class="o-see">${u.see} →</span></span>
        </span>
      </a>`;
  }).join('\n');

  const opciones = Object.entries(u.services)
    .map(([k, v]) => `              <option value="${k}"${k === p.service ? ' selected' : ''}>${v}</option>`).join('\n');

  const banderas = ['es', 'en', 'fr'].map(l =>
    `  <a class="lang-btn${l === lang ? ' active' : ''}" href="/${l}/${slug}" hreflang="${l}" data-lang="${l}" title="${FLAG_NAME[l]}" aria-label="${FLAG_NAME[l]}">${FLAGS[l]}</a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${u.htmlLang}" translate="no">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18299581753"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18299581753');
  </script>
  <script>
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "z2kd7cgrm0");
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="google" content="notranslate" />
  <title>${attr(t.title)} | Transfer Buenos Aires City</title>
  <meta name="description" content="${attr(t.desc)}" />
  <link rel="canonical" href="${url}" />
${alternates}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="${u.ogLocale}" />
  <meta property="og:title" content="${attr(t.title)}" />
  <meta property="og:description" content="${attr(t.desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${img}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${img}" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%230a0a0a'/><text x='16' y='22' font-family='Georgia,serif' font-size='20' font-weight='bold' fill='%23c9a96e' text-anchor='middle'>T</text></svg>" />
  <link rel="preload" as="image" href="/img/${p.img}" fetchpriority="high" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/tour.css?v=1" />
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
</head>
<body data-service="${p.service}" data-wa-key="${p.wa}">

<nav class="t-nav">
  <a href="/${lang}" class="nav-logo">Transfer Buenos Aires<span>${u.brandSub}</span></a>
  <a href="#book" class="nav-cta">${u.navCta}</a>
</nav>

<header class="t-hero">
  <img class="t-hero-img" src="/img/${p.img}" alt="${attr(t.alt)}" width="1280" height="956" fetchpriority="high" />
  <div class="t-hero-shade"></div>
  <div class="t-hero-inner">
    <span class="t-eyebrow">${t.eyebrow}</span>
    <h1 class="t-h1">${t.h1}</h1>
    <p class="t-sub">${t.sub}</p>
    <div class="t-price">
      ${precio}
      <span class="price-notes">${t.notes.join(' · ')} · ${u.vPay}</span>
    </div>
    <div class="t-ctas">
      <a href="#book" class="btn-gold">${u.ctaForm}</a>
      <a href="https://wa.me/5491144742207" data-wa="${p.wa}" target="_blank" rel="noopener" class="btn-line">${WA_ICON}<span>${u.ctaWa}</span></a>
    </div>
    <p class="t-nopay">${u.noPay}</p>
  </div>
</header>

<section class="t-facts" aria-label="${attr(u.fDuration)}">
${hechos.map(([k, v]) => `  <div class="t-fact"><span class="t-fact-k">${k}</span><span class="t-fact-v">${v}</span></div>`).join('\n')}
</section>

<main>
  <section class="t-sec t-main">
    <div class="t-col">
      <span class="t-label">${t.eyebrow.split(' · ')[0]}</span>
      <h2 class="t-h2">${u.aboutEyebrow}</h2>
      <p class="t-about">${t.about}</p>
      ${detalle}

      <div class="t-guide">
        <span class="t-label">${u.guideEyebrow}</span>
        <h2 class="t-h2">${u.guideTitle}</h2>
        <ul class="t-guide-list">
${u.guide.map(([h, d]) => `          <li><strong>${h}</strong><span>${d}</span></li>`).join('\n')}
        </ul>
        <!-- LUGAR PARA RESEÑAS REALES: cuando Diego mande testimonios o la ficha de Google tenga
             reseñas, van acá (texto tal cual, con nombre y país). No inventar ni corregir. -->
      </div>
    </div>

    <aside class="t-book" id="book">
      <div class="booking-form">
        <span class="t-label">${u.formEyebrow}</span>
        <h2 class="t-form-title">${u.formTitle}</h2>
        <p class="t-form-lead">${u.formLead}</p>
        <form id="bookingForm" novalidate>
          <div class="bf-field">
            <label for="bf-service">${u.lService}</label>
            <select id="bf-service" name="service">
${opciones}
            </select>
          </div>
          <div class="bf-row">
            <div class="bf-field">
              <label for="bf-date">${u.lDate} <span class="opt">${u.approx}</span></label>
              <input type="date" id="bf-date" name="date" />
            </div>
            <div class="bf-field">
              <label for="bf-people">${u.lPeople}</label>
              <select id="bf-people" name="people">
                <option value="1">1</option>
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8+">8+</option>
              </select>
            </div>
          </div>
          <div class="bf-row" id="bf-f-contact">
            <div class="bf-field">
              <label for="bf-email">${u.lEmail}</label>
              <input type="email" id="bf-email" name="email" autocomplete="email" inputmode="email" maxlength="80" />
            </div>
            <div class="bf-field">
              <label for="bf-phone">${u.lWa}</label>
              <input type="tel" id="bf-phone" name="phone" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="${u.phPhone}" />
            </div>
          </div>
          <p class="bf-hint">${u.either}</p>
          <p class="bf-error" id="bf-e-contact">${u.errContact}</p>
          <div class="bf-field">
            <label for="bf-name">${u.lName} <span class="opt">${u.optional}</span></label>
            <input type="text" id="bf-name" name="name" autocomplete="name" maxlength="60" />
          </div>
          <div aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">
            <label for="bf-website">No completar</label>
            <input type="text" id="bf-website" name="website" tabindex="-1" autocomplete="off" />
          </div>
          <button type="submit" class="btn-gold bf-submit" id="bf-submit">${u.submit}</button>
          <p class="bf-note">${u.note}</p>
          <div class="bf-send-error" id="bf-send-error">${u.sendErr}</div>
        </form>
        <div class="bf-thanks" id="bf-thanks" role="status">
          <div class="bf-thanks-mark"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h3>${u.thanksT}</h3>
          <p>${u.thanksP}</p>
        </div>
        <div class="bf-or">${u.or}</div>
        <a href="https://wa.me/5491144742207" data-wa="${p.wa}" target="_blank" rel="noopener" class="bf-wa">${WA_ICON}<span>${u.waBtn}</span></a>
      </div>
    </aside>
  </section>

  <section class="t-sec t-faq">
    <h2 class="t-h2">${u.faqTitle}</h2>
${faq.map(([q, a]) => `    <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
  </section>

  <section class="t-sec t-others">
    <h2 class="t-h2">${u.otherTitle}</h2>
    <div class="o-grid">
${otros}
    </div>
  </section>
</main>

<footer class="t-footer">
  <a href="/${lang}" class="nav-logo">Transfer Buenos Aires<span>${u.homeLabel}</span></a>
  <div class="t-footer-links">
    <a href="https://wa.me/5491144742207" data-wa="consulta" target="_blank" rel="noopener">WhatsApp: +54 9 11 4474-2207</a>
    <a href="mailto:carbonediego@gmail.com">carbonediego@gmail.com</a>
  </div>
  <p class="t-copy">${u.rights}<br>${u.design} <a href="https://lautaromendez.com.ar" target="_blank" rel="noopener">Lautaro Mendez</a></p>
</footer>

<div class="lang-switcher">
${banderas}
</div>

<a href="https://wa.me/5491144742207" data-wa="${p.wa}" class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_ICON}</a>

<script src="/js/tour.js?v=1" defer></script>
</body>
</html>
`;
}

let n = 0;
for (const lang of LANGS) {
  for (const slug of SLUGS) {
    const archivo = join(RAIZ, lang, `${slug}.html`);
    mkdirSync(dirname(archivo), { recursive: true });
    writeFileSync(archivo, pagina(lang, slug));
    n++;
  }
}

// sitemap: home + idiomas + páginas por servicio, todas con sus alternates
const hoy = new Date().toISOString().slice(0, 10);
const alt = path => LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITIO}/${l}${path}"/>`).join('\n');
const urls = [
  ...LANGS.map(l => `  <url>\n    <loc>${SITIO}/${l}</loc>\n    <lastmod>${hoy}</lastmod>\n${alt('')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITIO}/"/>\n  </url>`),
  ...SLUGS.flatMap(s => LANGS.map(l => `  <url>\n    <loc>${SITIO}/${l}/${s}</loc>\n    <lastmod>${hoy}</lastmod>\n${alt('/' + s)}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITIO}/en/${s}"/>\n  </url>`))
];
writeFileSync(join(RAIZ, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);

console.log(`${n} páginas + sitemap.xml`);
