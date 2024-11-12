package edu.ucsb.cs156.happiercows.entities;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "report_lines")

public class ReportLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private long reportId;
    private long userId;

    private String username;
    private double totalWealth;
    private int numOfCows;
    private double avgCowHealth;
    private int cowsBought;
    private int cowsSold;
    private int cowDeaths;
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_date")
    private Date createDate;
}
