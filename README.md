# Narasi Garage — Withdraw & Deposit

A dedicated new repository: **Waeduuu/narasi-data**. The original Narasi Garage repository is not used for publishing this page.

## GitHub Pages

Website source: `index.html` at repository root. Narasi Garage logo is embedded in the HTML, so no files from the old repository are needed.

To publish: GitHub repository **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.
When published, the expected website address is:
https://waeduuu.github.io/narasi-data/

## What it does

Two forms: **Deposit** and **Withdraw**. Fields: Staff / IC Name; Item / Description (free text, no preset items); optional Quantity; optional Notes / Reason. No prices or cash tracking.

## Connect Discord safely

Never put a Discord webhook URL inside public GitHub Pages HTML.

1. Create a Discord webhook in your desired Discord channel.
2. Deploy `discord-worker.js` as a Cloudflare Worker using the Cloudflare dashboard.
3. Configure the Worker **secrets**: `DISCORD_WEBHOOK_URL` (the complete Discord webhook URL without query parameters) and `ACCESS_KEY` (a strong random access key). Configure its **plain text variable** `ALLOWED_ORIGIN` as `https://waeduuu.github.io`.
4. Open your GitHub Pages website, select **Discord Settings**, and enter the Worker HTTPS URL and matching access key.
5. Submit a Deposit or Withdraw. The form displays success only after the relay confirms Discord delivery. Each Discord Embed includes Staff / IC Name, Item, Quantity (if provided), Notes, time in WIB, and a unique transaction ID.

The Worker must be hosted separately from GitHub Pages; GitHub Pages alone cannot protect webhook secrets. A shared access key is basic protection, not user-by-user authorization. For sensitive operations, add authenticated role permissions and rate limiting.

## Data model

Recent submissions shown on this website are stored in `localStorage` **in each browser**, not a shared database. Discord receives messages via the configured Worker. No FiveM inventory integration or automatic stock balance is included.