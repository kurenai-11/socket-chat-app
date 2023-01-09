## A simple fullstack chat project

Basically what the title says.

## Development setup

1. Set **FRONTEND_URL** variable in _backend/src/app.ts_ to your frontend url.
2. Set **BACKEND_URL** variable in _frontend/src/utils/constants.ts_ to your backend url.
3. Create _backend/.env_ file and set these environment variables there: **DATABASE_URL**, **JWT_ACCESS_SECRET** and **JWT_REFRESH_SECRET**.
4. Edit prisma schema if you need to.
5. Start in the root directory of this project (where this readme.md is) and execute these commands.
6. `npm i` - install concurrently locally.
7. `npm run install-deps` - install frontend and backend dependencies.
8. `cd backend/` - go into the backend directory.
9. `npx prisma migrate dev --name init` - sync your db with the prisma schema.
10. `cd ..` - go back into the root directory.
11. `npm run dev` - run both the backend and the frontend at the same time.
