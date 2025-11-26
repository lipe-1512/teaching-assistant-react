import { Goal } from '../models/Goal';

describe('Goal model', () => {
  test('clone() should create a new Goal with new id but same properties', () => {
    const g = new Goal('Descrição de teste', 30);
    const cloned = g.clone();

    // IDs must be different
    expect(cloned.getId()).not.toEqual(g.getId());

    // Description & weight should be identical
    expect(cloned.getDescription()).toEqual(g.getDescription());
    expect(cloned.getWeight()).toEqual(g.getWeight());

    // createdAt preserved
    expect(cloned.getCreatedAt().toISOString()).toEqual(g.getCreatedAt().toISOString());
  });
});
