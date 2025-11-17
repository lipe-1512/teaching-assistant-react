# Clone Goals Implementation TODO

## Backend Implementation
- [ ] Add POST route `/api/classes/:sourceClassId/clone-goals/:destClassId` in server.ts
- [ ] Implement logic to check if source class has evaluations
- [ ] Implement logic to check if destination class already has evaluations
- [ ] Handle scenario 1: Successful cloning when destination has no goals
- [ ] Handle scenario 2: Return conflict when destination already has goals
- [ ] Handle scenario 3: Return error when source has no goals

## Frontend Service
- [ ] Add `cloneGoals` method to ClassService.ts
- [ ] Handle different response types (success, conflict, error)

## Frontend Component
- [ ] Add "Clone Goals" section to Evaluations.tsx
- [ ] Add source class dropdown
- [ ] Add clone button with loading state
- [ ] Implement confirmation dialog for scenario 2
- [ ] Display appropriate success/error messages for all scenarios

## Testing
- [ ] Test scenario 1: Clone to empty class
- [ ] Test scenario 2: Clone to class with existing goals (confirmation)
- [ ] Test scenario 3: Clone from class with no goals
- [ ] Verify data persistence
- [ ] Commit changes to repository
