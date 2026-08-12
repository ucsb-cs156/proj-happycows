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

  
  
