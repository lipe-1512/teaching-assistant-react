Feature: Clone Goals
  Como professor
  Quero clonar as metas de uma turma para outra
  Para facilitar o reuso da estrutura de avaliação

  Scenario: Clone goals from existing class to new class
    Given I have a class "Software Engineering - 2024/1" with 5 goals
    When I create a new class "Software Engineering - 2024/2"
    And I select to clone goals from "Software Engineering - 2024/1"
    Then the new class "Software Engineering - 2024/2" should have 5 goals
    And the goals should be identical to the source class

  Scenario: Clone goals with different weights
    Given I have a class "Database Systems - 2024/1" with goals having different weights
    When I create a new class "Database Systems - 2024/2"
    And I clone goals from "Database Systems - 2024/1"
    Then all goal weights should sum to 100%
    And each goal should maintain its original weight

  Scenario: Clone goals to empty class
    Given I have an empty class "New Class - 2024/2"
    And I have a class "Source Class - 2024/1" with 3 goals
    When I clone goals from "Source Class - 2024/1" to "New Class - 2024/2"
    Then "New Class - 2024/2" should have 3 goals

  Scenario: Clone goals to class with existing goals
    Given I have a class "Target Class" with 2 existing goals
    And I have a class "Source Class" with 3 goals
    When I clone goals from "Source Class" to "Target Class"
    Then "Target Class" should have 5 goals total
    And the original 2 goals should be preserved
