import { neon } from '@neondatabase/serverless';

const allowedTypes = new Set(['Interiors', 'Furniture', 'Both', 'Other']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return Response.json({ error: 'Please send JSON.' }, { status: 415 });
  }

  const length = Number(request.headers.get('content-length') || 0);
  if (length > 12_000) {
    return Response.json({ error: 'Your message is too long.' }, { status: 413 });
  }

  let data;
  try {
    const body = await request.text();
    if (body.length > 12_000) throw new Error('Too long');
    data = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Please check your message and try again.' }, { status: 400 });
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return Response.json({ error: 'Please check your message and try again.' }, { status: 400 });
  }
  if (data.website) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const projectType = typeof data.projectType === 'string' ? data.projectType : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (!name || name.length > 120 || !emailPattern.test(email) || email.length > 254 ||
      !allowedTypes.has(projectType) || message.length < 10 || message.length > 5000) {
    return Response.json({ error: 'Please complete all fields correctly.' }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing');
    return Response.json({ error: 'The form is temporarily unavailable.' }, { status: 503 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO contact_enquiries (name, email, project_type, message)
      VALUES (${name}, ${email}, ${projectType}, ${message})
    `;
    return Response.json({ ok: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to save Juniper contact enquiry', error);
    return Response.json({ error: 'The form is temporarily unavailable.' }, { status: 503 });
  }
}
