const request = require('supertest');
const app = require('../src/app');


describe('POST /api/auth/register', () => {
   

    it('creates a user and returns 201 with user (no password)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'john_doe',
                email: 'john@example.com',
                password: 'Secret123!',
            });

        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.name).toBe('john_doe');
        expect(res.body.user.email).toBe('john@example.com');
        expect(res.body.user.password).toBeUndefined();
    });

    it('rejects duplicate username/email with 400', async () => {
        const payload = {
            name: 'dupuser',
            email: 'dup@example.com',
            password: 'Secret123!',
        };

        await request(app).post('/api/auth/register').send(payload).expect(201);
        const res = await request(app).post('/api/auth/register').send(payload);

        expect(res.status).toBe(400);
    });

    it('validates missing fields with 400', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        expect(res.status).toBe(400);
    });
});