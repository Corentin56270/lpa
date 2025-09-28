const nodemailer = require('nodemailer');

const DEFAULT_ALLOWED_ORIGINS = (process.env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);

const buildCorsHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

const sanitizeInput = (value = '') => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/[\r\n]/g, ' ')
    .replace(/[<>]/g, '')
    .trim();
};

const validatePayload = (payload = {}) => {
  const errors = {};

  const name = sanitizeInput(payload.name);
  if (!name || name.length < 2) {
    errors.name = 'Merci de renseigner un nom valide (au moins 2 caractères).';
  }

  const email = sanitizeInput(payload.email).toLowerCase();
  const emailRegex = /^[\w-.]+@[\w-.]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Merci de renseigner une adresse e-mail valide.';
  }

  const message = sanitizeInput(payload.message);
  if (!message || message.length < 10) {
    errors.message = 'Merci de rédiger un message (au moins 10 caractères).';
  } else if (message.length > 4000) {
    errors.message = 'Votre message est trop long (4000 caractères max).';
  }

  if (payload.honeypot) {
    errors.honeypot = 'Validation anti-spam échouée.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      name,
      email,
      message,
    },
  };
};

const resolveCorsOrigin = (requestOrigin) => {
  if (!requestOrigin || DEFAULT_ALLOWED_ORIGINS.length === 0) {
    return requestOrigin || '*';
  }

  return DEFAULT_ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : DEFAULT_ALLOWED_ORIGINS[0];
};

exports.handler = async (event) => {
  const originHeader = event.headers ? event.headers.origin || event.headers.Origin : undefined;
  const corsOrigin = resolveCorsOrigin(originHeader);
  const corsHeaders = buildCorsHeaders(corsOrigin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Méthode non autorisée.' }),
    };
  }

  if (!process.env.CONTACT_EMAIL) {
    console.error('Missing CONTACT_EMAIL environment variable');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Service de contact indisponible.' }),
    };
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP configuration environment variables');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Service de contact indisponible.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    console.error('Invalid JSON payload', error);
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Format de requête invalide.' }),
    };
  }

  const { isValid, errors, data } = validatePayload(payload);
  if (!isValid) {
    return {
      statusCode: 422,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Validation échouée.', errors }),
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const subject = `[Contact LPA] Nouveau message de ${data.name}`;

    await transporter.sendMail({
      from: `"${data.name}" <${process.env.SMTP_USER}>`,
      replyTo: `${data.name} <${data.email}>`,
      to: process.env.CONTACT_EMAIL,
      subject,
      text: `Nom: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Merci ! Votre message a bien été envoyé.' }),
    };
  } catch (error) {
    console.error('Failed to send contact message', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Une erreur est survenue lors de l'envoi du message." }),
    };
  }
};
