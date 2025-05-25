This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

##Usage for generating new reel
Replace the placeholder with celeb image at public/placeholder.jpg
C:\Users\rahul>curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d "{\"celebName\":\"Novak Djokovic\"}"
{"id":"Novak Djokovic","videoUrl":"https://ysjlgrghqjzqofinyplk.supabase.co/storage/v1/object/public/ai-sports-reels/reels/Novak_Djokovic.mp4"}
C:\Users\rahul>curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d "{\"celebName\":\"Virat Kholi\"}"
{"id":"Virat Kholi","videoUrl":"https://ysjlgrghqjzqofinyplk.supabase.co/storage/v1/object/public/ai-sports-reels/reels/Virat_Kholi.mp4"}
C:\Users\rahul>curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d "{\"celebName\":\"Lionel Messi\"}"
{"id":"Lionel Messi","videoUrl":"https://ysjlgrghqjzqofinyplk.supabase.co/storage/v1/object/public/ai-sports-reels/reels/Lionel_Messi.mp4"}
C:\Users\rahul>curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d "{\"celebName\":\"Sachin Tendulkar\"}"
{"id":"Sachin Tendulkar","videoUrl":"https://ysjlgrghqjzqofinyplk.supabase.co/storage/v1/object/public/ai-sports-reels/reels/Sachin_Tendulkar.mp4"}

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
