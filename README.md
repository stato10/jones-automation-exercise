# Jones Automation Exercise

Playwright automation submission for the Junior Automation Engineer exercise.

## Overview

This project automates the lead form at [https://test.netlify.app/](https://test.netlify.app/) using the Playwright library, and includes a structured QA review of the billing UI mock-up.

## Repository structure

| Path | Description |
| --- | --- |
| `automation.js` | End-to-end Playwright automation script |
| `ANSWERS.txt` | Follow-up questions a / b / c (plain text) |
| `QA_ANALYSIS.md` | Same QA content in Markdown |
| `artifacts/before-submit.png` | Screenshot captured before form submission |
| `package.json` | Project dependencies and npm scripts |

## Prerequisites

- Node.js 20 or newer
- Internet access to `https://test.netlify.app/`

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

Headless:

```bash
npm test
```

Visible browser (recommended for review):

```bash
npm test -- --headed
```

## Automation flow

The script performs the following steps in order:

1. Opens `https://test.netlify.app/`
2. Types values into the **Name**, **Email**, **Phone**, **Company**, and **Website** fields
3. Bonus: changes **Number of Employees** from `1-10` to `51-500`
4. Captures a full-page screenshot to `artifacts/before-submit.png` before clicking submit
5. Clicks **Request a call back**
6. Verifies navigation to the thank-you page
7. Writes to the console:

```text
Success: reached the thank-you page.
```

## Design choices

- Locators use accessible labels and roles for stability and readability
- Screenshot path is resolved from the script directory
- Browser resources are closed in a `finally` block
- Failed runs exit with a non-zero status code

## Follow-up questions

Answers to the billing UI review questions are in [`ANSWERS.txt`](ANSWERS.txt).
