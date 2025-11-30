import { Goal } from '../models/Goal';

describe('Goal model', () => {
  describe('Constructor', () => {
    test('should create a goal with generated id when id is not provided', () => {
      const goal = new Goal('Test description', 50);
      
      expect(goal.getId()).toBeDefined();
      expect(goal.getId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(goal.getDescription()).toBe('Test description');
      expect(goal.getWeight()).toBe(50);
      expect(goal.getCreatedAt()).toBeInstanceOf(Date);
    });

    test('should create a goal with provided id and createdAt', () => {
      const customId = '12345678-1234-1234-1234-123456789012';
      const customDate = new Date('2025-01-01');
      const goal = new Goal('Custom goal', 75, customId, customDate);
      
      expect(goal.getId()).toBe(customId);
      expect(goal.getDescription()).toBe('Custom goal');
      expect(goal.getWeight()).toBe(75);
      expect(goal.getCreatedAt()).toEqual(customDate);
    });

    test('should handle zero weight', () => {
      const goal = new Goal('Zero weight goal', 0);
      expect(goal.getWeight()).toBe(0);
    });

    test('should handle 100 weight', () => {
      const goal = new Goal('Full weight goal', 100);
      expect(goal.getWeight()).toBe(100);
    });
  });

  describe('Getters and Setters', () => {
    test('setDescription should update description', () => {
      const goal = new Goal('Initial description', 50);
      goal.setDescription('Updated description');
      expect(goal.getDescription()).toBe('Updated description');
    });

    test('setWeight should update weight', () => {
      const goal = new Goal('Test goal', 50);
      goal.setWeight(80);
      expect(goal.getWeight()).toBe(80);
    });

    test('should allow multiple weight updates', () => {
      const goal = new Goal('Test goal', 50);
      goal.setWeight(60);
      goal.setWeight(70);
      goal.setWeight(90);
      expect(goal.getWeight()).toBe(90);
    });
  });

  describe('clone()', () => {
    test('should create a new Goal with new id but same properties', () => {
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

    test('cloned goal should be independent from original', () => {
      const original = new Goal('Original description', 50);
      const cloned = original.clone();

      // Modify the cloned goal
      cloned.setDescription('Modified description');
      cloned.setWeight(75);

      // Original should remain unchanged
      expect(original.getDescription()).toBe('Original description');
      expect(original.getWeight()).toBe(50);
    });

    test('should clone goal with custom createdAt', () => {
      const customDate = new Date('2024-06-15T10:30:00Z');
      const original = new Goal('Custom date goal', 60, undefined, customDate);
      const cloned = original.clone();

      expect(cloned.getCreatedAt()).toEqual(customDate);
      expect(cloned.getId()).not.toBe(original.getId());
    });

    test('multiple clones should have different ids', () => {
      const original = new Goal('Original', 40);
      const clone1 = original.clone();
      const clone2 = original.clone();
      const clone3 = original.clone();

      const ids = [original.getId(), clone1.getId(), clone2.getId(), clone3.getId()];
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(4);
    });
  });

  describe('JSON serialization', () => {
    test('toJSON should return correct format', () => {
      const customDate = new Date('2025-03-20T15:45:30Z');
      const goal = new Goal('Test goal', 65, 'test-id-123', customDate);
      const json = goal.toJSON();

      expect(json).toEqual({
        id: 'test-id-123',
        description: 'Test goal',
        weight: 65,
        createdAt: '2025-03-20T15:45:30.000Z'
      });
    });

    test('fromJSON should recreate Goal instance', () => {
      const json = {
        id: 'json-goal-id',
        description: 'JSON goal',
        weight: 80,
        createdAt: '2025-02-15T08:00:00.000Z'
      };

      const goal = Goal.fromJSON(json);

      expect(goal.getId()).toBe('json-goal-id');
      expect(goal.getDescription()).toBe('JSON goal');
      expect(goal.getWeight()).toBe(80);
      expect(goal.getCreatedAt().toISOString()).toBe('2025-02-15T08:00:00.000Z');
    });

    test('fromJSON without createdAt should use current date', () => {
      const json = {
        id: 'no-date-id',
        description: 'No date goal',
        weight: 45
      };

      const beforeCreation = new Date();
      const goal = Goal.fromJSON(json);
      const afterCreation = new Date();

      expect(goal.getCreatedAt().getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(goal.getCreatedAt().getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    test('toJSON and fromJSON should be symmetric', () => {
      const original = new Goal('Symmetric test', 55);
      const json = original.toJSON();
      const restored = Goal.fromJSON(json);

      expect(restored.getId()).toBe(original.getId());
      expect(restored.getDescription()).toBe(original.getDescription());
      expect(restored.getWeight()).toBe(original.getWeight());
      expect(restored.getCreatedAt().toISOString()).toBe(original.getCreatedAt().toISOString());
    });
  });

  describe('Edge cases', () => {
    test('should handle empty description', () => {
      const goal = new Goal('', 50);
      expect(goal.getDescription()).toBe('');
    });

    test('should handle very long description', () => {
      const longDesc = 'A'.repeat(1000);
      const goal = new Goal(longDesc, 50);
      expect(goal.getDescription()).toBe(longDesc);
      expect(goal.getDescription().length).toBe(1000);
    });

    test('should handle negative weight', () => {
      const goal = new Goal('Negative weight', -10);
      expect(goal.getWeight()).toBe(-10);
    });

    test('should handle weight over 100', () => {
      const goal = new Goal('Over 100 weight', 150);
      expect(goal.getWeight()).toBe(150);
    });

    test('should handle special characters in description', () => {
      const specialDesc = 'Goal with <html> & "quotes" and émojis 🎯';
      const goal = new Goal(specialDesc, 50);
      expect(goal.getDescription()).toBe(specialDesc);
    });
  });
});
