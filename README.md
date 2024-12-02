# Whop Messenger Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local` with your configuration.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

1. Build the application:

```bash
npm run build
```

2. Set up environment variables on your hosting platform (Vercel, etc.):

   - NEXT_PUBLIC_API_URL: Your API domain
   - NEXT_PUBLIC_WS_URL: Your WebSocket URL
   - NEXT_PUBLIC_UPLOAD_URL: Your file upload URL
   - NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS: Comma-separated list of allowed image domains
   - NEXTAUTH_URL: Your frontend domain (if using HTTPS)
   - NEXTAUTH_SECRET: A secure random string for NextAuth

3. Deploy the application:

```bash
npm run start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
