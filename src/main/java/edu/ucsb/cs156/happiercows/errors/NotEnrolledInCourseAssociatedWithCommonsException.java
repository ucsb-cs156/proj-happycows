package edu.ucsb.cs156.happiercows.errors;

public class NotEnrolledInCourseAssociatedWithCommonsException extends RuntimeException {
    public NotEnrolledInCourseAssociatedWithCommonsException() {
        super("Not enrolled in course associated with commons");
    }
}
