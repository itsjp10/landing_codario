export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY ?? '');
const RECIPIENT = 'jalvarezp@codariolabs.com';
const DEFAULT_FROM = 'Codario Labs <onboarding@resend.dev>';

const formatBody = (fields: Record<string, string>) => {
	const entries = Object.entries(fields)
		.filter(([, value]) => value)
		.map(([key, value]) => `<p><strong>${key}</strong>: ${value}</p>`)
		.join('');

	return `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>New contact form submission</title>
			</head>
			<body>
				<h1 style="font-family:system-ui, sans-serif;">New contact request</h1>
				${entries}
			</body>
		</html>
	`;
};

const formatPlain = (fields: Record<string, string>) =>
	Object.entries(fields)
		.filter(([, value]) => value)
		.map(([key, value]) => `${key}: ${value}`)
		.join('\n');

const escape = (s: string) =>
	s.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

const brand = {
	name: 'Codario Labs',
	site: import.meta.env.RESEND_BRAND_SITE ?? 'https://www.codariolabs.com',
	logo: import.meta.env.RESEND_BRAND_LOGO ?? '',
	cta: import.meta.env.RESEND_BOOK_URL ?? 'https://www.codariolabs.com/#contact',
	support: (import.meta.env.RESEND_FROM || 'Codario Labs <hello@codariolabs.com>').match(/<(.+)>/)?.[1] ?? 'hello@codariolabs.com',
};

const userHtml = (payload: Record<string, string>) => {
	const rows = Object.entries(payload)
		.filter(([, v]) => v)
		.map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;color:#0A2540;font-weight:600;">${escape(k)}</td>
        <td style="padding:8px 12px;color:#0A2540;">${escape(v)}</td>
      </tr>`).join('');

	return `<!doctype html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>We received your message</title></head>
<body style="margin:0;background:#F7F9FB;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(10,37,64,0.08)">
    <tr>
      <td style="padding:24px 24px 12px 24px;text-align:center;">
        ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" height="40" style="display:inline-block;border:0;"/>` : `<div style="font-weight:700;font-size:18px;color:#0A2540">${brand.name}</div>`}
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 8px 24px;text-align:center;color:#0A2540;">
        <h1 style="margin:0 0 4px 0;font-size:20px;">Thanks — we got your message</h1>
        <p style="margin:0;color:rgba(10,37,64,0.75);font-size:14px;">We’ll reply the same day with availability and a proposal outline.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;">
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:12px;background:#F4F6F8;">
          ${rows}
        </table>
        <div style="text-align:center;margin:20px 0 8px;">
          <a href="${brand.cta}" style="display:inline-block;background:#0A2540;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600">Book a discovery call</a>
        </div>
        <p style="color:rgba(10,37,64,0.65);font-size:12px;text-align:center;margin:0 0 8px;">
          Prefer email? Write us at <a href="mailto:jalvarezp">${brand.support}</a>
        </p>
      </td>
    </tr>
  </table>
  <p style="text-align:center;color:rgba(10,37,64,0.5);font-size:11px;margin-top:12px;">
    © ${new Date().getFullYear()} ${brand.name}. <a href="${brand.site}" style="color:#3BAFDA;text-decoration:none">${brand.site.replace(/^https?:\/\//, '')}</a>
  </p>
</body></html>`;
};

const userText = (payload: Record<string, string>) => {
	const lines = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
	return [
		`Thanks — we received your message at ${brand.name}.`,
		`We'll reply the same day with availability and a proposal outline.`,
		``,
		`Your details:`,
		...lines,
		``,
		`Book a discovery call: ${brand.cta}`,
		`Prefer email? ${brand.support}`,
	].join('\n');
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();

		// Honeypot guard
		if (formData.get('company_website')) {
			return new Response(null, { status: 204 });
		}

		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '').trim();
		const company = String(formData.get('company') ?? '').trim();
		const budget = String(formData.get('budget') ?? '').trim();
		const message = String(formData.get('message') ?? '').trim();

		if (!name || !email || !budget || !message) {
			return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (!import.meta.env.RESEND_API_KEY) {
			console.error('[contact-form] Missing RESEND_API_KEY environment variable');
			return new Response(JSON.stringify({ error: 'Email service not configured.' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const toAddress = import.meta.env.RESEND_TO ? import.meta.env.RESEND_TO.split(',').map((entry) => entry.trim()).filter(Boolean) : [RECIPIENT];

		const payload = {
			Name: name,
			Email: email,
			Company: company,
			'Budget Range': budget,
			Message: message,
		};

		// 1) Email interno (tu copia)
		const internalEmail = resend.emails.send({
			from: import.meta.env.RESEND_FROM ?? DEFAULT_FROM,
			to: toAddress,
			subject: `New contact form submission from ${name}`,
			html: formatBody(payload),
			text: formatPlain(payload),
			reply_to: email,
			headers: {
				// opcional: ayuda con filtros
				'List-Unsubscribe': `<mailto:${brand.support}>, <${brand.site}/unsubscribe>`
			}
		});

		// 2) Confirmación al usuario (bonita)
		const userEmail = resend.emails.send({
			from: import.meta.env.RESEND_FROM ?? DEFAULT_FROM, // tu dominio verificado
			to: email,
			subject: `Thanks, ${name}! We received your message — ${brand.name}`,
			html: userHtml(payload),
			text: userText(payload),
			reply_to: brand.support
		});

		// Envía en paralelo y maneja resultado
		const [internalRes, userRes] = await Promise.all([internalEmail, userEmail]);

		if (('error' in internalRes && internalRes.error) || ('error' in userRes && userRes.error)) {
			console.error('[contact-form] Resend error', internalRes, userRes);
			return new Response(JSON.stringify({ error: 'Email could not be sent.' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[contact-form] Submission error', error);
		return new Response(JSON.stringify({ error: 'Unexpected error.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
