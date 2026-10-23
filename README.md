# Juniper Homes website

Static website with a Vercel contact endpoint backed by Neon Postgres.

Preview: https://juniper-homes.vercel.app/

Run `migrations/001_create_contact_enquiries.sql` in the Neon production database, then set `DATABASE_URL` in the Vercel project environment. The contact endpoint stores enquiries in `contact_enquiries`.

To read enquiries, open the Neon **Juniper Homes** project, select **production → Tables → contact_enquiries**. New submissions appear there.

After saving each enquiry, the endpoint sends its details to **shamaamin69@gmail.com** through the Resend Vercel integration. The visitor's email is the reply-to address, so replying contacts the visitor directly. `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` are managed by the integration; the sending domain must be verified in Resend. No WhatsApp integration is enabled.

Transient email failures are retried once with an idempotency key for the saved enquiry. Enquiries remain saved if email delivery fails; the server logs the enquiry ID and failure without the submitted contact details. Check the database and Resend delivery logs if a notification is missing.

The site uses the Juniper Homes logo supplied by the client and images from the brand's public Instagram account.
