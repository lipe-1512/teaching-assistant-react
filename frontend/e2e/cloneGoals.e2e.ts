import { test, expect, request } from '@playwright/test';

// These E2E tests expect the dev servers to be running:
// - Backend: http://localhost:3005 (prefer NODE_ENV=test for isolation)
// - Frontend: http://localhost:3004

const API_BASE = 'http://localhost:3005/api';

// helper to reset test data file by replacing it with an empty structure
async function resetBackendData() {
  const context = await request.newContext();
  // not all servers provide reset route; use explicit calls to delete possible resources
  // We'll just remove classes and students by reading them and deleting
  const [classesList, studentsList] = await Promise.all([
    context.get(`${API_BASE}/classes`).then(r => r.json()).catch(() => []),
    context.get(`${API_BASE}/students`).then(r => r.json()).catch(() => [])
  ]);

  await Promise.all((classesList || []).map((c: any) => context.delete(`${API_BASE}/classes/${c.id}`)));
  await Promise.all((studentsList || []).map((s: any) => context.delete(`${API_BASE}/students/${s.cpf}`)));
  await context.dispose();
}

// Full cloning flow
test('Fluxo completo de clonagem via UI', async ({ page }) => {
  await resetBackendData();

  // Create source class
  const resp1 = await request.post(`${API_BASE}/classes`, { data: { topic: 'Matematica', semester: 1, year: 2025 } });
  expect(resp1.ok()).toBeTruthy();
  const src = await resp1.json();
  const sourceId = src.id;

  // Create dest class
  const resp2 = await request.post(`${API_BASE}/classes`, { data: { topic: 'Matematica', semester: 2, year: 2025 } });
  expect(resp2.ok()).toBeTruthy();
  const dest = await resp2.json();
  const destId = dest.id;

  // Add two goals to source via API
  const g1 = await request.post(`${API_BASE}/classes/${sourceId}/goals`, { data: { description: 'Resolver 10 exercicios', weight: 40 } });
  const g2 = await request.post(`${API_BASE}/classes/${sourceId}/goals`, { data: { description: 'Entender Derivadas', weight: 60 } });
  expect(g1.ok()).toBeTruthy();
  expect(g2.ok()).toBeTruthy();

  // Navigate to dest goals page
  await page.goto(`/classes/${destId}/goals`);
  // ensure dest shows no goals
  await expect(page.locator('text=No goals defined for this class')).toBeVisible();

  // select source and clone
  await page.selectOption('select', sourceId);
  await page.click('button:has-text("Clone Goals")');
  // wait for success message
  await expect(page.locator('text=Goals cloned successfully')).toBeVisible();

  // verify two goals are visible
  await expect(page.locator('li.goal-item')).toHaveCount(2);

  // verify cloned items are independent - edit one in dest and check source remains same
  const destGoalSelector = page.locator('li.goal-item').first();
  // click edit and change description
  await destGoalSelector.getByText('Edit').click();
  const inputDesc = destGoalSelector.locator('input').first();
  await inputDesc.fill('Alterado Destino');
  await destGoalSelector.getByText('Save').click();

  // read source goals via API and verify none have changed description
  const sourceGoalsResp = await request.get(`${API_BASE}/classes/${sourceId}/goals`);
  const sourceGoals = await sourceGoalsResp.json();
  expect(sourceGoals.some((g: any) => g.description === 'Alterado Destino')).toBeFalsy();
});

// Integration with students
test('Integração com CRUD de alunos', async ({ page }) => {
  await resetBackendData();

  // open UI and create a student using student form
  await page.goto('/students');
  // create student
  await page.fill('input[name="name"]', 'Aluno Teste');
  await page.fill('input[name="cpf"]', '12345678900');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button:has-text("Add Student")');

  // wait for the student to appear in list
  await expect(page.locator('text=Aluno Teste')).toBeVisible();

  // go to classes and verify classes page works (no crash)
  await page.goto('/classes');
  await expect(page.locator('text=Classes')).toBeVisible();
});
