package edu.ucsb.cs156.happiercows.errors;

public class GameHiddenException extends RuntimeException {
    public GameHiddenException(Long id) {
        super("Game with id %d is hidden".formatted(id));
    }
}
