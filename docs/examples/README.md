This folder contains examples of CSV files used as input to proj-happycows' student/staff roster upload feature (see `StudentCsvFormat`).

* `egrades.csv` is an example (with fake data) of a roster for a course at UCSB, in the format provided to instructors on the `eGrades` web app. This is the format recognized by `StudentCsvFormat.UCSB_EGRADES`.
* `egrades_with_duplicate_emails.csv` and `egrades_with_duplicate_ids.csv` are variants of `egrades.csv` with intentional duplicate emails/perm numbers, useful for testing roster-upload dedup behavior.
* `egrades_with_email_and_student_ids_from_diff_students.csv` is a variant of `egrades.csv` where one row's email matches another row's perm number but belongs to a different student, useful for testing conflict handling.
* `chico_canvas.csv` is an example (with fake data) of a roster for a course at Chico State University, in the format downloadable from Canvas at Chico State. This is the format recognized by `StudentCsvFormat.CHICO_STATE_ROSTER`.
* `OSU_CSV.csv` is an example (with fake data) of a roster exported from Canvas at Oregon State University. It is **not** currently supported by any `StudentCsvFormat` value in this app (there is no "Oregon State" entry in the `School` enum), but is kept here as an example of another format that could be added later, following the same pattern used for `UCSB_EGRADES` and `CHICO_STATE_ROSTER`.

These files originate from the equivalent `docs/examples` directory in [proj-frontiers](https://github.com/ucsb-cs156/proj-frontiers).
