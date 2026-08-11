package edu.ucsb.cs156.happiercows.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

import edu.ucsb.cs156.happiercows.entities.ChatMessage;

@Repository
public interface ChatMessageRepository extends CrudRepository<ChatMessage, Long>{
    @Query(value = "SELECT cm FROM chat_message cm WHERE cm.gameId = :gameId AND cm.hidden = false")
    Page<ChatMessage> findByGameId(Long gameId, Pageable pageable);

    @Query(value = "SELECT cm FROM chat_message cm WHERE cm.gameId = :gameId")
    Page<ChatMessage> findAllByGameId(Long gameId, Pageable pageable);

    @Query(value = "SELECT cm FROM chat_message cm WHERE cm.gameId = :gameId AND cm.hidden = true")
    Page<ChatMessage> findByGameIdAndHidden(Long gameId, Pageable pageable);

    @Query("SELECT cm FROM chat_message cm WHERE cm.id = :id")
    Optional<ChatMessage> findById(long id);
}
