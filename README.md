# SellSnap Studio

SellSnap Studio is a static, offline-capable mobile PWA for sellers who need fast WhatsApp-ready product posters. This build includes a usability-polished responsive layout for mobile and desktop.

## Quick start

```bash
# Option 1: Python (built-in)
python3 -m http.server 4173

# Option 2: Node.js (if you have it)
npx serve .
```

Then open `http://localhost:4173` in your browser.

## Monetization flow

The public app has one free design (`Market`) that exports with a very light watermark. Premium clean exports, premium sharing, and campaign packs require Pro:

- 30 days Pro: `5 USDT` or `99 Birr` for Ethiopia
- 1 year Pro: `24 USDT` or `499 Birr` for Ethiopia
- Lifetime Pro: `59 USDT` or `1499 Birr` for Ethiopia

The default foreign payment method is your USDT TRC20 address:

```text
TPAp56PvAJiKCoGv5M6F1ykmGLbW7AuJyg
```

The Ethiopia option uses CBE:

```text
1000184706591
```

Because there is no payment server in this static build, payment verification is manual:

1. The buyer chooses Foreign or Ethiopia in the Product tab.
2. The buyer chooses a plan in the License tab.
3. The buyer sends the exact USDT TRC20 or CBE Birr amount.
4. The buyer taps "Copy Payment Message" and sends it with the payment proof:
   - **Foreign**: Email the copied message + payment proof to `amin2sms@gmail.com`
   - **Ethiopia**: Open Telegram, send the copied message + payment screenshot to `@usersmind`
5. You open `owner-unlock.html` privately.
6. You paste the device code, confirm the plan and amount, then generate an unlock code.
7. The buyer pastes the unlock code into the app.
8. Tell the buyer to save the unlock code. It is tied to their device code, so clearing all site data can require a new support unlock.

**Do not publish `owner-unlock.html` with the public app. It contains the private signing key.**

## Public files

Publish these files for users:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `service-worker.js`
- `icon.svg`
- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/product-earbuds.png`

Keep this file private:

- `owner-unlock.html`

## Host on GitHub Pages

Publish the app files from this project root. Do not upload `owner-unlock.html`.

1. Create a GitHub repository.
2. Upload the public files listed above.
3. In the repository, open Settings -> Pages.
4. Choose Deploy from a branch.
5. Select `main` and `/root` (or `/ (root)`).
6. Save and wait for GitHub to publish the site.

**Never upload `owner-unlock.html` to the public repository.** Keep it private on your own machine.

If a browser keeps showing an older design, hard refresh the page or clear the site data. The service worker now uses a network-first update strategy and v22 cache names to reduce stale cached UI.

## Important limitation

Without a server or app-store billing, this is still a soft license. The app no longer gives resettable clean trial exports, so clearing browser data only returns a user to watermarked preview mode. A determined technical user can still modify client-side code, so serious commercial distribution should use a server-side license check or app-store billing.

## Mobile editing layout

The mobile UI uses a split workbench: the poster preview stays fixed at the top of the screen, while the active Product/Design/Kit/Caption/License panel scrolls below it. This lets a seller change templates, colors, text, zoom, and other controls while seeing the poster update immediately without scrolling back and forth.
