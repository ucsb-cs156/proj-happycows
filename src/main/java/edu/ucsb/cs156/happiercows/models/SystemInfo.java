package edu.ucsb.cs156.happiercows.models;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class SystemInfo {
  private Boolean springH2ConsoleEnabled;
  private Boolean showSwaggerUILink;
  private String startQtrYYYYQ;
  private String endQtrYYYYQ;
  private String sourceRepo; // user configured URL of the source repository
  private String commitMessage;
  private String commitId;
  private String githubUrl; // URL to the commit in the source repository
  private String oauthLogin;
}
