package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.ChatMessage;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends CrudRepository<ChatMessage, Long> {
  @Query(
      value =
          "SELECT cm FROM chat_message cm WHERE cm.commonsId = :commonsId AND cm.hidden = false")
  Page<ChatMessage> findByCommonsId(Long commonsId, Pageable pageable);

  @Query(value = "SELECT cm FROM chat_message cm WHERE cm.commonsId = :commonsId")
  Page<ChatMessage> findAllByCommonsId(Long commonsId, Pageable pageable);

  @Query(
      value = "SELECT cm FROM chat_message cm WHERE cm.commonsId = :commonsId AND cm.hidden = true")
  Page<ChatMessage> findByCommonsIdAndHidden(Long commonsId, Pageable pageable);

  @Query("SELECT cm FROM chat_message cm WHERE cm.id = :id")
  Optional<ChatMessage> findById(long id);
}
