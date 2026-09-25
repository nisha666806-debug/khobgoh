# Khobgoh v6 — permission sync fix

- Fixed Supervisor permission-denied sync for `duty_logs` by querying only the signed-in supervisor's logs.
- Fixed Supervisor permission-denied sync for `wake_confirmations` by filtering by both today's date and the signed-in user's UID.
- Added `day` to duty roster documents so automatic active-duty detection can work with the saved weekday.
- Updated service-worker cache name to force clients onto this version.
