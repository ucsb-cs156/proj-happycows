package edu.ucsb.cs156.happiercows.errors;

public class CommonsHiddenException extends RuntimeException {
    public CommonsHiddenException(Long id) {
        super("Commons with id %d is hidden".formatted(id));
    }
}
