# Dial Console

Dial Console is a local-first call queue, dial log, pipeline, and scoreboard for Indian rooftop-solar outreach. It uses plain HTML, CSS, and JavaScript with system fonts. The browser stores every record on the device.

## Run locally

1. Extract `Dial-Console.zip`, keeping the `dial-console` folder and its contents together.
2. Double-click `index.html` in a current browser such as Chrome or Edge.
3. From the Board, import a scraper CSV or choose **Load 10 sample leads**. Review **Settings**, then press **D** or select **Start dialing**.

Direct file use works offline immediately. To test installation and the service worker on a laptop, serve the unzipped folder over localhost. With Python 3 installed, open a terminal in `dial-console` and run the following command.

```shell
python -m http.server 8080 --bind 127.0.0.1
```

Open [http://localhost:8080](http://localhost:8080). On Windows, you can use `py -m http.server 8080 --bind 127.0.0.1` if the Python launcher is installed.

## Deploy and install on a phone

### Netlify Drop

1. Open [Netlify Drop](https://app.netlify.com/drop).
2. Drag the extracted `dial-console` folder into the drop zone. The folder must contain `index.html` at its top level.
3. Open the HTTPS URL Netlify returns. To update the app at the same URL, upload the updated folder from the existing project's **Deploys** page.

See the [Netlify manual deployment guide](https://docs.netlify.com/deploy/create-deploys/).

### GitHub Pages

1. Create a public repository called `dial-console` and upload the **contents** of the extracted folder to the root of its `main` branch. Keep the `icons` folder intact.
2. In the repository, open **Settings → Pages**. Select **Deploy from a branch**, choose **main** and **/(root)**, then select **Save**.
3. Wait for Pages to show the published URL. Open `https://YOUR-USERNAME.github.io/dial-console/` using the trailing slash.

See the [GitHub Pages publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Add to Home Screen

- On iPhone, open the HTTPS URL in Safari. Select **Share → Add to Home Screen**, turn on **Open as Web App** if shown, and select **Add**. [Apple Support](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios)
- On Android, open the same URL in Chrome. Open the menu and select **Install and create shortcut**, then **Install**. [Chrome Help](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid)
- Leave the app open for its first online load so the service worker can cache its files. Then open it from the Home Screen. Verify installation by reopening it in airplane mode. When a new version is ready, the app offers **Reload**.

The hosting provider serves the app files. Keep CSVs and JSON backups outside the uploaded folder.

## Backup and move data

**Data lives in the browser on each device and does not sync automatically.** Separate browser profiles and addresses, including the local file, localhost, and the hosted URL, can have separate databases. Use Export and Merge to move your work.

1. On the source device, choose **Settings → Backup → Export JSON**.
2. Transfer the downloaded JSON privately to the destination device.
3. On the destination, choose **Settings → Backup → Import JSON → Merge**. Review the summary and select **Merge backup**. To overwrite that device's data, choose **Replace**, export its existing data first, and confirm replacement.

JSON includes leads, logs, pipeline items, clients, weights, days off, scripts, and settings. CSV exports are for leads and logs only. Merge uses record IDs, keeps newer edits, and preserves undone outcomes. Replace and Merge commit in one storage transaction. Lead removal keeps the call history, and the full backup retains soft-deleted records so they stay removed on merge.

Dial Console asks the browser for persistent storage on first run. With IndexedDB available it journals pending changes in localStorage when possible, then replays an interrupted write on reopening. If IndexedDB cannot open, a banner identifies the localStorage fallback. If saving fails after three retries, keep the app open and use **Export** in the red banner. Export includes the changes still visible in memory. Clearing site data or losing the device erases browser-local records, so keep a separate JSON backup.

Use one active dialing tab per browser profile. For work on two devices, transfer the backup before switching so the second device has the current queue.

## Keyboard shortcuts

| Where | Key | Action |
| --- | --- | --- |
| Board | **D**, **Enter** | Start dialing |
| Dial | **1**, **2**, **3** | No answer, Gatekeeper, Owner spoke |
| Dial | **4**, **5**, **6** | Book meeting, schedule callback, Dead |
| Dial | **D** | Open the device's phone dialer |
| Dial | **C**, **Enter** | Copy number |
| Dial | **S** | Skip for three hours |
| Dial | **U**, **Ctrl+Z**, **Cmd+Z** | Undo the most recent available session outcome, up to 20 |
| Dial | **O**, **N** | Focus owner or note |
| Dial | **P**, **[**, **]**, **/** | Toggle scripts, change group, search |
| Modal | **Enter**, **Esc** | Submit, cancel |
| Callback modal | **1–5** | Choose a preset |
| Anywhere | **?**, **Esc** | Show shortcuts, dismiss or blur |
| Navigation | **G** then **D/B/C/P/F/H/L/S/I/T** | Dial, Board, Calls, Pipeline, Funnel, Heatmap, Leads, Scripts, Import, Settings |

Shortcuts pause while typing. Enter retains normal keyboard activation on focused buttons and links. In the Dial note field, use Shift+Enter for a line break.

## Assumptions

- Local time, including day rollover and appointment display, follows the device clock. For IST, set the device timezone to India Standard Time. The heatmap uses the original weekday and hour captured with each call.
- Due callbacks keep priority in either queue mode. Turning **Callbacks first** off moves fresh leads ahead of retries. Fresh leads keep batch and row order. If independent devices import at the same time, timestamps and batch IDs break ties on merge.
- Every recorded outcome increments a lead's attempt count. The maximum cuts off only No answer retries. Marking a callback Dead from Calls logs a dial. Rescheduling an existing callback or a no-show updates the queue without logging a dial.
- Callback preset labels refer to the next eligible working day when their nominal date is a day the user does not work. A same-day preset is offered on a configured working day before 4 PM. A meeting defaults to 10 AM on the next calendar working day.
- Weekly pace spreads today's dial target and one fifth of the weekly meeting target across 08:00–20:00 device time. A day off is excluded from expected pace. Session rate starts after one elapsed minute and uses a monotonic clock. The Day card treats past dates as completed days for streaks.
- Indian numbers use a ten-digit heuristic. Numbers starting 6–9 use mobile grouping, other accepted numbers use landline grouping. Enabling invalid CSV rows keeps the original phone text for reference.
- A lead's ID, creation time, and deletion marker are managed by the app. The editable fields and call history are in the lead drawer. Closing and reopening the app starts a new Undo session.
- On the Board, signed clients include churned clients, while MRR includes active clients. A second Won move for the same meeting reuses its linked client. The Day card uses the configured creator handle and aggregate counts. Handle input accepts a blank value or an @handle with at least one letter.

## Tests and release checks

The app runs without Node. To run the tests, use Node.js 22 or newer and enter the following command in the `dial-console` folder.

```shell
node --test tests/logic.test.js tests/browser.test.js
```

The browser tests use an installed Chromium browser with a disposable profile. They run without npm packages and discover common Chrome, Edge, and Chromium paths. Set `CHROME_PATH` to an executable to select a different Chromium installation. When no browser is found, the logic tests still run.

- The browser suite exercises all six outcomes, duplicate input suppression, two undos including a booking, CSV input, reload, all-store JSON transfer, content privacy, and an application-shell update and offline reload.
- Separate browser cases cover a 10,000-row scraper import, outcome latency, 360×640 and 2560×1440 layout, callbacks becoming due, a midnight rollover, a backward clock change, interrupted writes, fallback storage, and retry exhaustion.
- On a physical phone, verify Home Screen installation and airplane-mode reopening. Check the device's `tel:` handler with an intended dial, clipboard behavior, and the soft keyboard while editing notes. The automated Chromium run emulates the phone viewport.
- When updating the deployed app, increment the cache revision in `sw.js` before uploading the revised folder. App icons can be regenerated with `node icons/generate.js`.
