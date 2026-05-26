package edu.ucsb.cs156.happiercows.errors;

public class CommonsHiddenException extends RuntimeException {
    public CommonsHiddenException() {
        super("This commons is hidden.");
    }
}