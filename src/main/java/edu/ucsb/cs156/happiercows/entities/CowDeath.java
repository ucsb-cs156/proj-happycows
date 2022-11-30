package edu.ucsb.cs156.happiercows.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Column;
import javax.persistence.EntityListeners;

import java.time.ZonedDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "cow_death")
@EntityListeners(AuditingEntityListener.class)
public class CowDeath {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name="commons_id")
    private long commonsId;  

    @Column(name="user_id")
    private long userId;  

    @CreatedDate
    private ZonedDateTime createdAt;
    private Integer cowsKilled;
    private long avgHealth;
}
