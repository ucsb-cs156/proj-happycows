package edu.ucsb.cs156.happiercows.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "chat_message")
public class ChatMessage {

  // Unique Message Id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  // The user that created this message and the commons that it belongs in
  private long userId;
  private long commonsId;

  // Message timestamp and payload
  @CreationTimestamp
  @Temporal(TemporalType.TIMESTAMP)
  private Date timestamp;

  private String message;

  // For future use in DMs
  private boolean dm;
  private long toUserId;

  // We do not delete messages in the backend, we just hide them
  @Builder.Default private boolean hidden = false;
}
