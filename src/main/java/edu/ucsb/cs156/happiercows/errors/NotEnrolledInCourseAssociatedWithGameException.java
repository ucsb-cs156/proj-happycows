package edu.ucsb.cs156.happiercows.errors;

public class NotEnrolledInCourseAssociatedWithGameException extends RuntimeException {
    public NotEnrolledInCourseAssociatedWithGameException() {
        super("Not enrolled in course associated with game");
    }
}
