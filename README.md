# nested comments API 

# API Endpoints
- http://localhost:3001/posts/ -> GET all the posts
- http://localhost:3001/posts/:id -> GET a specific post 
- http://localhost:3001/posts/:id/comments -> get all comments or post a comments
- http://localhost:3001/posts/:postId/comments/:commentId -> update or delete delete a comment
- http://localhost:3001/posts/:postId/comments/:commentId/toggleLike -> Like or Unlike a a comment

## dependencies
-  @prisma/client": "^4.2.0", ->  ORM (Object relation management tools)
-  "dotenv": "^16.0.1", -> read env variables
-  "fastify": "^4.4.0" -> fast and overhead web framework for node.js

## install
- clone this repo, in command line navigate to the server directory
- in the server folder create `.env` file and add 3 env variables: DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/comments", PORT=3001, CLIENT_URL=http://localhost:3000 
- to start the server in the server folder run `npm run devStart` the server is on [http://locahost:3001](http://locahost:3001)

## preview 
![Preview](/client/src/assets/nested-comments.png)
