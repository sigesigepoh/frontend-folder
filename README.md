# Lost Found Mobile

This is the Expo React Native frontend for the Lost and Found system.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start your Django backend from the project root:
   ```bash
   .\run-backend.cmd
   ```

3. In another terminal, start Expo:
   ```bash
   npx expo start
   ```

4. Open the project in Expo Go or a browser.

## Snack Expo publishing

1. Open https://snack.expo.dev
2. Create a new Snack project.
3. Copy the contents of `App.js` into the Snack editor.
4. Make sure `app.json` and `package.json` match the Expo SDK 50 configuration.
5. Replace `API_BASE_URL` in `App.js` with your deployed backend URL.
6. Run the Snack to test mobile behavior.

## Notes

- `API_BASE_URL` in `App.js` must point to a public HTTPS backend URL.
- The current placeholder is:
  ```js
  const API_BASE_URL = 'https://YOUR_RENDER_BACKEND_URL.onrender.com/api';
  ```

- If the backend is not deployed yet, the app can still be tested in Snack by mocking fetch responses or using a public API endpoint.
