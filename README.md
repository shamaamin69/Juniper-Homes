# Juniper Homes website

Static website with a Vercel contact endpoint backed by Neon Postgres.

Preview: https://juniper-homes.vercel.app/

Run `migrations/001_create_contact_enquiries.sql` in the Neon production database, then set `DATABASE_URL` in the Vercel project environment. The contact endpoint stores enquiries in `contact_enquiries`.

To read enquiries, open the Neon **Juniper Homes** project, select **production → Tables → contact_enquiries**. New submissions appear there. The form does not send email notifications yet.

The site uses the Juniper Homes logo supplied by the client and images from the brand's public Instagram account.
