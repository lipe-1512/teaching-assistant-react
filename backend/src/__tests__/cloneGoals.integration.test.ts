import request from 'supertest';
import { app } from '../server';
import * as fs from 'fs';
import * as path from 'path';

const testDataFile = path.resolve('./data/app-data.test.json');

describe('Clone goals integration', () => {
  beforeEach(() => {
    // Ensure a clean data file for each test
    if (fs.existsSync(testDataFile)) fs.unlinkSync(testDataFile);
  });

  afterEach(() => {
    if (fs.existsSync(testDataFile)) fs.unlinkSync(testDataFile);
  });

  test('should clone goals from one class to another with new IDs', async () => {
    // Create source and destination classes
    const sourceRes = await request(app)
      .post('/api/classes')
      .send({ topic: 'SourceTopic', semester: 1, year: 2025 })
      .expect(201);

    const destRes = await request(app)
      .post('/api/classes')
      .send({ topic: 'DestTopic', semester: 1, year: 2025 })
      .expect(201);

    const sourceId = sourceRes.body.id; // topic-year-semester
    const destId = destRes.body.id;

    // Add goals to source
    const g1 = await request(app)
      .post(`/api/classes/${sourceId}/goals`)
      .send({ description: 'Goal A', weight: 30 })
      .expect(201);

    const g2 = await request(app)
      .post(`/api/classes/${sourceId}/goals`)
      .send({ description: 'Goal B', weight: 70 })
      .expect(201);

    // Ensure destination has no goals
    const destBefore = await request(app).get(`/api/classes/${destId}/goals`).expect(200);
    expect(Array.isArray(destBefore.body)).toBe(true);
    expect(destBefore.body.length).toBe(0);

    // Clone goals
    const cloneRes = await request(app)
      .post(`/api/classes/${sourceId}/clone-goals/${destId}`)
      .expect(200);

    expect(cloneRes.body.clonedGoalsCount).toBe(2);

    // Verify destination goals
    const destAfter = await request(app).get(`/api/classes/${destId}/goals`).expect(200);
    expect(destAfter.body.length).toBe(2);

    // IDs should differ compared to source
    const srcGoals = await request(app).get(`/api/classes/${sourceId}/goals`).expect(200);

    expect(srcGoals.body.length).toBe(2);

    for (let i = 0; i < srcGoals.body.length; i++) {
      const s = srcGoals.body[i];
      const d = destAfter.body[i];
      expect(s.description).toEqual(d.description);
      expect(s.weight).toEqual(d.weight);
      expect(s.id).not.toEqual(d.id);
      // cloned createdAt preserved
      expect(s.createdAt).toEqual(d.createdAt);
    }
  });

  test('should return 404 when source class does not exist', async () => {
    // ensure dest created
    const destRes = await request(app)
      .post('/api/classes')
      .send({ topic: 'DestTopic2', semester: 1, year: 2025 })
      .expect(201);

    const destId = destRes.body.id;

    await request(app)
      .post(`/api/classes/nonexistent/clone-goals/${destId}`)
      .expect(404);
  });

  test('should return 404 when destination class does not exist', async () => {
    // create source class
    const sourceRes = await request(app)
      .post('/api/classes')
      .send({ topic: 'SourceTopic2', semester: 1, year: 2025 })
      .expect(201);

    const sourceId = sourceRes.body.id;

    await request(app)
      .post(`/api/classes/${sourceId}/clone-goals/nonexistent-dest`)
      .expect(404);
  });
});
