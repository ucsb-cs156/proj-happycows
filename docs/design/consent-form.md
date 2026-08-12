# Consent Form Design Document

The goal of adding a consent form feature to Happycows is to provide for an informed consent process in cases
where the instructor wants to gather data from the game to use for research purposes.

Note that data from the game may be used for internal course improvement purposes without
obtaining informed consent; informed consent is required in the the specific circumstance
that the instructor wants to use the data to publish research results outside the institution.

In that case, they have an obligation under 45 CFR 46 (Subpart A) (the "Common Rule") to seek either
IRB approval or exemption, and in either case, to follow the principles of "Respect for Persons, Beneficence, and Justice",
which includes obtaining "informed consent" before using data from human subjects for research purposes.

# Note 

We will need to introduce an extra role called "Instructor" in between admin and player.

Instructor will have access to all the current features of admins, including creating games, creating courses, and manipulating
games.  However, they will only have control over games and course they themselves created, not those created by other instructors.

Furthermore, they will NOT have access to consent decisions while their course is in progress.   There will need to be a feature
where they only have access to this after the course is concluded, and maybe then, only data in some anonymized form.

# Features 

* As an admin or instructor, I can create and edit informed consent briefing documents.  These will have instructor scope (i.e. "belong" to an instructor)
* As an instructor, I can attach an informed consent briefing to Game so that each player, when joining the game, is provided the informed consent briefing
  before joining the game.
* Once an informed consent briefing is attached to a game, it can no longer be modified; only a new one may be created and attached.
  As an admin, I can "clone" an existing an existing briefing to modify it.
* As a player, I can see the informed consent briefing, and either opt-in or opt-out of having my data used for research purposes.
  The version of the informed consent briefing, my decision, the date, and my full name (as an electronic signature) will be recorded.
* As a player, I can see (perhaps on the UserProfile page) the games where I have opted into an informed consent decision, and
  revoke that at any time.  If I declined to provide informed consent, I can also access the currently attached informed consent
  document, and opt in to that one.
* As an admin, I can download data from consenting students in a .zip file that I can make available to researchers.  This data
  may be anonymized or not; the use case for non-anonymized data is when it is being provided to researchers that were NOT
  instructors, and combined with other data such as pre- and post- test data.
  (Note: we will need considerable detail about what data we provide, and in what form, along with an analysis of the extent to
  which it is anonymized).
* As an instructor, I cannot see individual consent decisions at any time; these are available only to admins.

# Elements of informed consent

There are nine elements of informed consent listed in CFR 46.116(b).   Not all will apply to HappyCows.
It is likely helpful to structure the form for the informed consent briefing in a way that ensures each of these is addressed.

Note that the examples below have NOT yet been evaluated by the Human Subjects Committee at UCSB; they are simply a first draft to illustrate one possible way that the informed consent briefing might comply with CFR 46.116(b).   It will be necessary to supply a specific briefing to the HSC for review to either obtain approval of a protocol, or an exempt determination before this may be used for research.

If this is "beta tested" without such an approval in place, it should be made clear that this form is only in "beta test mode" to test the features of the software, that it is NOT legally binding, and that it will NOT be used as a basis for actual research.

* 46.116(b)(1) "A statement that the study involves research, an explanation of the purposes of the research and the expected duration of the subject's participation, a description of the procedures to be followed, and identification of any procedures that are experimental."

  For HappyCows this might be something like this:

  The HappyCows game is designed to help you learn some of the material in this course in a fun way.  Your instructor is
  collaborating with [insert names here] to collect and publish data about whether the game is working as intended.  If you
  give your consent, we will use data from how you play the game, along with your responses to some of the homework
  and exams in the course to study how students play the game, and how well the game works.  We will anonymize your data
  before reporting anything in published articles. 

* 46.116(b)(2): A description of any reasonably foreseeable risks or discomforts to the subject.

  For HappyCows that may be something like this:

  There are no known risks or discomfort associated with playing this game, or giving your consent to participate
  in the research.
  
* 46.116(b)(3): A description of any benefits to the subject or to others that may reasonably be expected from the research.

  If there are no direct benefits, the researchers may tell subjects what they hope to learn,
  how that knowledge will contribute to the field of study or how the knowledge might benefit others if such a case can be made.

  For HappyCows that may be something like this:

  There are no direct benefits to you for allowing us to use your data for research.
  However, your participation may help us to improve the game for future students, both at UCSB and beyond.

* 46.116(b)(4): A disclosure of appropriate alternative procedures or courses of treatment,
  if any, that might be advantageous to the subject.

  This requirement is primarily relevant for biomedical research. However, it might be applicable to social and behavioral research if behavioral interventions, such as novel teaching or therapeutic methods, are proposed.

  For HappyCows, this is likely irrelvant and can be omitted.

* 46.116(b)(5): A statement describing the extent, if any, to which confidentiality of records identifying the subject will be maintained.

  The description must include a full disclosure of any state-mandated reporting requirements, such as suspicion of child abuse and/or neglect or harm to others. State requirements vary, so IRBs and researchers must be aware of state-specific information.

  Note that we will make every effort to keep the data from this game confidential to the extent allowable; it will be shared only
  with course staff, with the small team that maintains the HappyCows software (Prof. Phill Conrad of the Computer Science department).

  We should note that while it is our intent to keep your records confidential, we cannot ensure absolute confidentiality
  since educational and research data is subject to subpoena (though we consider this to be an unlikely outcome.)

* 46.116(b)(6) For research involving more than minimal risk, an explanation as to whether any medical treatments are available if injury occurs and, if so, what they consist of, what compensation will be provided, and where further information may be obtained.

  This is likely not relevant to HappyCows and can be ommitted.

* 46.116(b)(7): An explanation of whom to contact for answers to pertinent questions about the research and research subjects' rights, and whom to contact in the event of a research-related injury to the subject.

  In some field research, there may not be any way for subjects to call or email anyone about their questions and concerns. Alternative means of communication must be established, such as a local contact on the research team.

  If you have any questions about your rights pertaining to this research, you are encouraged to ask your instructor.

  Or you may also contact the Office of Human Subjects via their website: https://www.research.ucsb.edu/human-subjects/about,
  via email at hsc@research.ucsb.edu, via telephone at 805-893-3807 or 805-893-4290, via fax at 805-893-2611, or via mail at:

  ```
  Human Subjects Coordinator
  Office of Research, 3227 Cheadle Hall
  University of California, Santa Barbara
  Santa Barbara, CA 93106-2050
  ```

* 46.116(b)(8): A statement that participation is voluntary, refusal to participate will involve no penalty or loss of benefits to which the subject is otherwise entitled, and the subject may discontinue participation at any time without penalty or loss of benefits to which the subject is otherwise entitled.

  Most researchers in the social and behavioral sciences are not in a position to impose penalties. However, specific study-related assurances that there will be no negative consequences associated with choosing not to take part might be appropriate. For example, parents may need to be assured that if they choose not to participate in a school-based, school-approved study their children's grades or placement will not be affected.

  For HappyCows: 

   While participation in the game may be required as a course activity, your informed consent decision (i.e. whether you say yes or no below) will *not be made available to the instructor or course staff* before course grades are assigned, and therefore *cannot and will not* impact your grade in this course.

  In addition, if you change your mind about participation, you may update your consent decision at any time by logging into the
  HappyCows website, and then clicking on your email address in the upper right hand corner.  There you will find a place
  where you can see your previous informed consent decisions and update them.

* 46.116(b)(9): One of the following statements about any research that involves the collection of identifiable private information or identifiable biospecimens:

  - A statement that identifiers might be removed from the identifiable private information or identifiable biospecimens and that, after such removal, the information or biospecimens could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from the subject or the legally authorized representative, if this might be a possibility; or
            
  - A statement that the subject's information or biospecimens collected as part of the research, even if identifiers are removed, will not be used or distributed for future research studies.
 
  For HappyCows, this might be:

  Note that for consenting students, data that has had personally identifying information removed (i.e. anonymized data) may be made available to other researchers for analysis.  This kind of "open data sharing" is common in current research, and make research more reliable and repeatable.


