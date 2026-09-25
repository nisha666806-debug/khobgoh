# Khobgoh v4 — Fixes

- Dashboard and UI terminology changed from «Донишҷӯ» to «Талаба».
- Supervisor can add a new student directly to their assigned room.
- Supervisor can remove a student from their assigned room; the student is not permanently deleted.
- Bed/place availability is checked before assignment.
- Student admission date and departure date are stored.
- Residence history is stored in `residences` collection so each stay has start/end dates, room and bed.
- Manager assignment and transfer now also create/update residence history.
- Student profile shows residence history.
- Firebase rules updated for supervisor-scoped student and residence access.
- Repeated synchronization permission errors are deduplicated in the UI.
- Mobile Dashboard statistics use a 2-column layout on small screens.
- Service worker cache version bumped to force the new application shell.

## Firebase

Deploy the updated `firestore.rules` to the Firebase project before testing supervisor write operations.

## Chat UI redesign
- Redesigned internal chat in a modern rounded mobile-first style inspired by the supplied reference.
- Added chat header/avatar/online indicator, message bubbles, sender initials, timestamps and read-style ticks.
- Added circular add and send controls and softer chat background/shadows.
- Improved mobile responsiveness and empty-chat state.
- Chat remains internal to Manager and supervisors; no AI assistant behavior was added.
