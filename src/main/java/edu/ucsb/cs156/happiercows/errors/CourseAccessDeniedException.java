package edu.ucsb.cs156.happiercows.errors;

public class CourseAccessDeniedException extends RuntimeException {
    public CourseAccessDeniedException(Long commonsId) {
        super("You are not enrolled in the course required to join game with id %d".formatted(commonsId));
    }
}
