package edu.ucsb.cs156.happiercows.errors;

public class EntityNotFoundException extends RuntimeException {
  public EntityNotFoundException(Class<?> entityType, Object id) {
    super("%s with id %s not found"
        .formatted(entityType.getSimpleName(), id.toString()));
  }

  // Allows callers to supply a user-facing display name that differs from
  // the entity's class name (e.g. "Game" for the Game entity).
  public EntityNotFoundException(String entityDisplayName, Object id) {
    super("%s with id %s not found"
        .formatted(entityDisplayName, id.toString()));
  }

  public EntityNotFoundException(Class<?> entityType, String id1Label, Object id1, String id2Label, Object id2) {
    super("%s with %s %s and %s %s not found"
        .formatted(entityType.getSimpleName(),
            id1Label,
            id1.toString(),
            id2Label,
            id2.toString()));
  }
}