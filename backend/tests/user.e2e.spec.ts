import request from 'supertest';
import createApp from '../src/app';

const app = createApp();

describe('User API', () => {
  it('should create a user successfully', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'admin@gmail.com', password: 'Adil@123', role: 'Admin' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('admin@gmail.com');
  }, 10000);
});
