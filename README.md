# GameReview

GameReview is a full-stack web application where users can browse games and see reviews written for them. Users can register to the application to leave new reviews for games with a title, star rating, and the actual review commment.

The application is made specifically as a project for Secure Programming course, and functions as a learning experience instead of a fully functional application.

# Features

- Browse games, and view a single game
- Register a new account and log in to it
- Post reviews while logged in
- View public user profiles and reviews

## Technologies used

- Frontend: Vue, Vite
- Backend: Node.js, Express
- Testing: Vitest, Supertest
- Deployment: Docker

## How to run application using Docker

1. Make sure you have Node.js, npm, and Docker installed on your PC.
2. clone project using command 
"git clone https://github.com/aleksiIso-seppala/COMP.SEC.300StoreProject.git"

3. create a .env file to backend folder. the file needs to include the following line, but with the secret replaced
SESSION_SECRET='your_long_random_secret_here'

4. Create a .env file to frontend folde. The needs to include the following line:
VITE_API_BASE=http://localhost:3001/api

4. Build application by running following command in the root folder
docker compose up --build

5. Access application via http://localhost:5173

6. Quit application via pressing CTRL + C in the command line