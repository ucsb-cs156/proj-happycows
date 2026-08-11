package edu.ucsb.cs156.happiercows.errors;

public class CourseAccessDeniedException extends RuntimeException {
    public CourseAccessDeniedException(Long gameId) {
        super("You are not enrolled in the course required to join game with id %d".formatted(gameId));
    }
}
