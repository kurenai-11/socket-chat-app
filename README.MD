## A simple fullstack chat project

Basically what the title says.

## installation/setup

1. Set FRONTEND_URL variable in backend/src/app.ts to your frontend url.
2. Set BACKEND_URL variable in frontend/src/main.ts to your backend url.
3. Create backend/.env file and set these environment variables there: DATABASE_URL, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.
4. Edit prisma schema if you need to.
5. Start in the root directory of this project (where this readme.md) is and execute these commands.
6. `npm i` - install concurrently locally
7. `cd backend/` - go into backend directory
8. `npm i` - install backend dependencies
9. `npx prisma migrate dev --name init` - sync your db with prisma schema.
10. `cd ../frontend/` - go into frontend directory
11. `npm i` - install frontend dependencies
12. `cd ..` - go back into the root directory
13. `npm run dev` - run both the backend and the frontend at the same time.
