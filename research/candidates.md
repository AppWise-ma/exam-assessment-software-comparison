# Candidate products

Research log for the inclusion rules in [METHODOLOGY.md](../METHODOLOGY.md#what-is-included). Checked 2026-09-30 from public pages (JED, wordpress.org plugin API, GitHub/GitLab tags). Every row still gets rechecked when its product file is written.

"GPL after purchase" means the vendor states a GPL license but the source is only delivered to buyers. We confirm the delivered code is readable (not obfuscated) during hands-on testing.

## Proposed first release

| Product | Platform | License | Source | Latest release seen | Price | Why |
|---|---|---|---|---|---|---|
| Next Exams | Joomla | GPL (to confirm) | after purchase | 6.1.0 | paid | Our product |
| Community Quiz (Shondalai) | Joomla | GPL-2.0-or-later | after purchase | 8.0.0, 2026-08-30 | paid | Closest direct competitor on Joomla 5/6 |
| QuizTools | Joomla | GPL-2.0 | [github.com/fsvblr/quiztools](https://github.com/fsvblr/quiztools) | 1.5.0, 2026-09-14 | free | Active free Joomla option with a public repo |
| Quiz and Survey Master | WordPress | GPL-2.0-only | wordpress.org | 11.2.7, 2026-09-24 | freemium | Leading dedicated WordPress quiz plugin |
| LearnDash | WordPress | GPL-2.0-or-later | after purchase | 5.2.1, 2026-09-30 | paid | Market-leading WordPress LMS with a quiz engine |
| Moodle (Quiz) | Web app | GPL-3.0-or-later | [github.com/moodle/moodle](https://github.com/moodle/moodle) | 5.2.3, 2026-09-13 | free | The reference open-source quiz engine |
| TCExam | Web app | AGPL-3.0-or-later | [github.com/tecnickcom/tcexam](https://github.com/tecnickcom/tcexam) | 17.2.8, 2026-09-26 | free | Dedicated computer-based exam system |
| TAO | Web app | GPL-2.0 | [github.com/oat-sa](https://github.com/oat-sa) | tao-core 56.13.6, 2026-09-30 | free | QTI-native, large-scale testing. Packaged release is from 2022 |
| Odoo Survey + eLearning | Odoo | LGPL-3.0 | [github.com/odoo/odoo](https://github.com/odoo/odoo/tree/master/addons/survey) | Odoo 20 | free (Community) | Only credible Odoo option; certifications built in |
| Safe Exam Browser | Desktop | MPL-2.0 (Windows) | [github.com/SafeExamBrowser](https://github.com/SafeExamBrowser) | 3.10.2 (Windows) | free | Standard open lockdown browser |
| Auto Multiple Choice | Desktop | GPL-2.0-or-later | [gitlab.com/jojo_boulix/auto-multiple-choice](https://gitlab.com/jojo_boulix/auto-multiple-choice) | 1.7.0, 2025-04-17 | free | Paper exams with automatic grading |

## Alternates

- **Joomla:** DevArt Exams (GPL-3.0, public repo, Joomla 6 only), vQuiz, SimpleQuiz, QuizLab / QuizLab Pro, ARI Quiz (no dated release found after 2024-10).
- **WordPress:** Tutor LMS, LearnPress, Quiz Maker (Ays), HD Quiz, Watu, Masteriyo, LifterLMS.
- **Web apps:** ILIAS, OpenOLAT, Chamilo, QST, ExamSys (formerly Rogō).
- **Mobile:** Moodle App (Apache-2.0), DayExam (Android, AGPL-3.0).

## Excluded

| Product | Reason |
|---|---|
| JoomlaQuiz Deluxe | Joomla 3 only, last release 2022, license not stated in the repo |
| Guru (iJoomla) | Last release 2023-04, license not stated |
| LimeSurvey | Survey tool, not an exam tool |
| WatuPRO | Vendor does not name an OSI license |
| Open edX, Sakai, Canvas | General LMSs; quizzes are not the core |
| iTest, ILIAS Pegasus, PBLive | Abandoned or archived |
| AnkiDroid, KWordQuiz | Flashcard tools |

## To recheck by hand

- Safe Exam Browser 3.10.2 release date: the releases page and the tags order disagree.
- ClassQuiz latest release year.
- ARI Quiz: whether 3.10.21 was released after 2024-10.
- TAO: whether a current packaged Community Edition exists.
