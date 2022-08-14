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

app.get('/posts', async (req, res) => {
  return await commitToDb(prisma.post.findMany({
    select: {
      id: true,
      title: true
    }
  }))
})

const COMMENTS_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true
    }
  }
}

app.get('/posts/:id', async (req, res) => {
  return await commitToDb(prisma.post.findUnique({
    where: { id: req.params.id },
    select: {
      body: true,
      title: true,
      comments: {
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          ...COMMENTS_SELECT_FIELDS,
          _count: { select: { likes: true } }
        }
      }
    }
  })
    .then(async post => {
      const likes = await prisma.like.findMany({
        where: {
          userId: req.cookies.userId,
          commentId: { in: post.comments.map(comment => comment.id) }
        }
      })

      return {
        ...post,
        comments: post.comments.map(comment => {
          const { _count, ...commentFields } = comment
          return {
            ...commentFields,
            likedByMe: likes.find(like => like.commentId === comment.id),
            likeCount: _count.likes
          }
        })
      }
    })
  )
})

async function commitToDb(promise) {
  const [error, data] = await app.to(promise)
  if (error) return app.httpErrors.internalServerError(error.message)
  return data
}

const port = process.env.PORT || 3002

app.listen({ port }, () => {
  console.log(`Server is Running on port ${port} `)
})