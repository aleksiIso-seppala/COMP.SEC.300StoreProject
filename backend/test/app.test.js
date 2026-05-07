import { fileURLToPath } from 'url'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import fs from 'fs/promises'

process.env.USERS_FILE = fileURLToPath(new URL('../test-data/users.test.json', import.meta.url))
process.env.REVIEWS_FILE = fileURLToPath(new URL('../test-data/reviews.test.json', import.meta.url))

const { default: app } = await import('../app.js')

beforeEach(async () => {
  await fs.writeFile(process.env.USERS_FILE, '[]', 'utf-8')
  await fs.writeFile(process.env.REVIEWS_FILE, '[]', 'utf-8')
})

describe('API', () => {
  
  it('GET /api/health should return ok true', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })


  it('POST /api/register should create a new user', async () => {
    const res = await request(app).post('/api/register').send({
      username: 'TestUser1',
      email: 'test1@example.com',
      password: 'SecurePass1!'
    })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      username: 'TestUser1',
      email: 'test1@example.com'
    })
    expect(res.body.user.slug).toBe('testuser1')
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('POST /api/register should reject a weak password', async () => {
    const res = await request(app).post('/api/register').send({
      username: 'WeakUser1',
      email: 'weak@example.com',
      password: 'weak'
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Password does not meet the required conditions.')
  })

  it('POST /api/register should reject a duplicate email', async () => {
    await request(app).post('/api/register').send({
      username: 'FirstUser1',
      email: 'duplicate@example.com',
      password: 'SecurePass1!'
    })

    const res = await request(app).post('/api/register').send({
      username: 'SecondUser1',
      email: 'duplicate@example.com',
      password: 'SecurePass1!'
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('User with that email or username already exists.')
  })

  it('GET /api/me should return the logged-in user after register', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'SessionUser1',
      email: 'session@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const meRes = await agent.get('/api/me')

    expect(meRes.status).toBe(200)
    expect(meRes.body.user).toMatchObject({
      username: 'SessionUser1',
      email: 'session@example.com'
    })
    expect(meRes.body.user.slug).toBe('sessionuser1')
  })

  it('POST /api/reviews should reject unauthenticated users', async () => {
    const res = await request(app).post('/api/reviews').send({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Great game',
      rating: 5,
      comment: 'Really enjoyed it.'
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('You must be logged in to post a review.')
  })

  it('POST /api/reviews should allow a logged-in user to post a review', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'ReviewUser1',
      email: 'review@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const reviewRes = await agent.post('/api/reviews').send({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Amazing climb',
      rating: 5,
      comment: 'Loved the atmosphere and challenge.'
    })

    expect(reviewRes.status).toBe(201)
    expect(reviewRes.body.review).toMatchObject({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Amazing climb',
      rating: 5,
      comment: 'Loved the atmosphere and challenge.',
      userName: 'ReviewUser1',
      userSlug: 'reviewuser1'
    })
  })

  it('POST /api/reviews should reject an invalid rating', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'RatingUser1',
      email: 'rating@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const reviewRes = await agent.post('/api/reviews').send({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Bad rating test',
      rating: 6,
      comment: 'This should fail because rating is too high.'
    })

    expect(reviewRes.status).toBe(400)
    expect(reviewRes.body.error).toBe('Rating must be between 1 and 5.')
  })

  it('POST /api/reviews should reject a too-short comment', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'CommentUser1',
      email: 'comment@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const reviewRes = await agent.post('/api/reviews').send({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Short comment test',
      rating: 4,
      comment: 'ok'
    })

    expect(reviewRes.status).toBe(400)
    expect(reviewRes.body.error).toBe('Review must be 3 to 2000 characters long.')
  })

  it('POST /api/reviews should reject a too-long comment', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'LongCommentUser1',
      email: 'longcomment@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const longComment = 'a'.repeat(2001)

    const reviewRes = await agent.post('/api/reviews').send({
      productSlug: 'cairn',
      productTitle: 'Cairn',
      title: 'Too long comment test',
      rating: 4,
      comment: longComment
    })

    expect(reviewRes.status).toBe(400)
    expect(reviewRes.body.error).toBe('Review must be 3 to 2000 characters long.')
  })

  it('POST /api/logout should destroy the session so /api/me returns 401', async () => {
    const agent = request.agent(app)

    const registerRes = await agent.post('/api/register').send({
      username: 'LogoutUser1',
      email: 'logout@example.com',
      password: 'SecurePass1!'
    })

    expect(registerRes.status).toBe(201)

    const meBeforeLogout = await agent.get('/api/me')
    expect(meBeforeLogout.status).toBe(200)

    const logoutRes = await agent.post('/api/logout')
    expect(logoutRes.status).toBe(200)
    expect(logoutRes.body).toEqual({ ok: true })

    const meAfterLogout = await agent.get('/api/me')
    expect(meAfterLogout.status).toBe(401)
    expect(meAfterLogout.body.error).toBe('Not authenticated.')
  })

})
