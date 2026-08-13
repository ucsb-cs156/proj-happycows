package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.happiercows.entities.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/**
 * Verifies that the users.picture_url column can store values longer than the
 * default JPA/Hibernate 255 character limit for String columns. This is a
 * regression test for issue #295: users whose Google OAuth profile picture
 * URL exceeded 255 characters were unable to log in because the column was a
 * plain VARCHAR(255).
 */
@DataJpaTest
public class UserRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void can_save_and_load_user_with_picture_url_longer_than_255_characters() {
        String longPictureUrl = "https://lh3.googleusercontent.com/a/" + "a".repeat(300);

        User user = User.builder()
                .email("longpictureurl@example.org")
                .pictureUrl(longPictureUrl)
                .build();

        User savedUser = userRepository.save(user);
        User loadedUser = userRepository.findById(savedUser.getId()).get();

        assertEquals(longPictureUrl, loadedUser.getPictureUrl());
    }
}
