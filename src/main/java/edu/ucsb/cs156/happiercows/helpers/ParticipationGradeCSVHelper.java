package edu.ucsb.cs156.happiercows.helpers;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import edu.ucsb.cs156.happiercows.models.ParticipationGrade;

/*
 * Serves up a CSV file of computed participation grades, one row per
 * student, for upload into a gradebook. See ReportCSVHelper/
 * GameStatsCSVHelper for the pattern this follows.
 */

public class ParticipationGradeCSVHelper {

  private ParticipationGradeCSVHelper() {}

  /**
   * This method is a hack to avoid a pitest issue; it isn't possible to
   * exclude an individual method call from jacoco coverage, but we can
   * exclude the entire method by name in the pom.xml
   * @param out
   */

  public static void flush_and_close_noPitest(ByteArrayOutputStream out, CSVPrinter csvPrinter) throws IOException {
    csvPrinter.flush();
    csvPrinter.close();
    out.flush();
    out.close();
  }

  public static ByteArrayInputStream toCSV(Iterable<ParticipationGrade> grades) throws IOException {
    final CSVFormat format = CSVFormat.DEFAULT;

    List<String> headers = Arrays.asList(
        "perm",
        "lastName",
        "firstMiddleName",
        "interactedAtLeastOnce",
        "daysInteracted",
        "ownedAndCheckedInOnACow",
        "criterion1PointsEarned",
        "criterion2PointsEarned",
        "criterion3PointsEarned",
        "totalPointsEarned");

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), format);

    csvPrinter.printRecord(headers);
    for (ParticipationGrade grade : grades) {
      List<String> data = Arrays.asList(
          grade.getPerm(),
          grade.getLastName(),
          grade.getFirstMiddleName(),
          String.valueOf(grade.isInteractedAtLeastOnce()),
          String.valueOf(grade.getDaysInteracted()),
          String.valueOf(grade.isOwnedAndCheckedInOnACow()),
          String.valueOf(grade.getCriterion1PointsEarned()),
          String.valueOf(grade.getCriterion2PointsEarned()),
          String.valueOf(grade.getCriterion3PointsEarned()),
          String.valueOf(grade.getTotalPointsEarned()));
      csvPrinter.printRecord(data);
    }

    flush_and_close_noPitest(out, csvPrinter);
    return new ByteArrayInputStream(out.toByteArray());
  }
}
