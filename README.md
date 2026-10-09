# Juniper Homes website

Static website with a Vercel contact endpoint backed by Neon Postgres.

Run `migrations/001_create_contact_enquiries.sql` in the Neon production database, then set `DATABASE_URL` in the Vercel project environment. The contact endpoint stores enquiries in `contact_enquiries`.

The site uses the Juniper Homes logo supplied by the client and images from the brand's public Instagram account.
