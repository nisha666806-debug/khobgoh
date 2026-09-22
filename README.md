# Dormitory Management System — No Node.js version

This version runs as static HTML/CSS/JavaScript and can be opened without Node.js or npm.

## Local test
Open `index.html` in a modern browser.

The current interface includes dashboard, students, rooms/places, attendance, violations, cleanliness competition, supervisors, search, forms and localStorage persistence.

## Firebase
`js/firebase.js` contains the Firebase Web SDK CDN imports and configuration placeholder. Replace the values with your Firebase project configuration and enable the Firebase modules you need.

For production, connect the UI services to Firestore and deploy `firestore.rules` and `firestore.indexes.json` with Firebase tooling or the Firebase Console.

Important: Firestore Security Rules shown here are a baseline and should be tested against the final document schema before production deployment.


## Logo
The professional Dormitory Management System logo is included at `assets/dormitory-logo.png` and is used in the sidebar/login screen and as the browser favicon.
