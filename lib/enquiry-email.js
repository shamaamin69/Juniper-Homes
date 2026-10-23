const recipient = 'shamaamin69@gmail.com';

export async function sendEnquiryEmail(enquiry, {
  apiKey = process.env.RESEND_API_KEY,
  domain = process.env.RESEND_EMAIL_DOMAIN || 'juniperhomes.pk',
  fetchEmail = fetch,
  pause = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  if (!apiKey) throw new Error('Email service is not configured');

  const payload = {
    from: `Juniper Homes <enquiries@${domain}>`,
    to: [recipient],
    reply_to: enquiry.email,
    subject: `New Juniper Homes enquiry — ${enquiry.projectType}`,
    text: [
      `New website enquiry #${enquiry.id}`,
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Interested in: ${enquiry.projectType}`,
      '',
      enquiry.message,
      '',
      'Reply to this email to contact the visitor directly.',
      'Submitted at https://www.juniperhomes.pk/contact.html',
    ].join('\n'),
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await fetchEmail('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `juniper-enquiry/${enquiry.id}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      if (attempt === 1) throw new Error('Email service connection failed');
      await pause(500);
      continue;
    }

    if (response.ok) {
      const result = await response.json();
      if (!result.id) throw new Error('Email service returned no message ID');
      return result.id;
    }
    if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
      await pause(1_000);
      continue;
    }
    // Never log provider response bodies, which can include submitted contact data.
    throw new Error(`Email service returned status ${response.status}`);
  }
}
