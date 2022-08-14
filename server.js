import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'
import fastifySensible from "@fastify/sensible";

const app = fastify()
app.register(fastifySensible)
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET
})

app.register(fastifyCors, {
  origin: process.env.CLIENT_URL,
  credentials: true
})

const prisma = new PrismaClient()

const CURRENT_USER_ID = (await prisma.user.findFirst({ where: { name: 'Kyle' } })).id

app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID
    res.clearCookie('userId')
    res.setCookie("userId", CURRENT_USER_ID)
  }
  done()
})



app.get('/', async (req, res) => {
  return await prisma.post.findMany({
    select: {
      title: true
    }
  })
})

const port = process.env.PORT || 3002

app.listen({ port }, () => {
  console.log(`Server is Running on port ${port} `)
})