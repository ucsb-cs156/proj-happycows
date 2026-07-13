package edu.ucsb.cs156.happiercows.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CsvUploadResult {
    private int created;

    /** Emails skipped because they were already on the course roster. */
    private List<String> skippedEmails;
}
