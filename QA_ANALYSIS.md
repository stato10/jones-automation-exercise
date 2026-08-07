# Billing UI Review

## A. Problems found

The observations below are based on the supplied UI mock-up. Backend behavior cannot be proven from a static image, so implementation-dependent items are explicitly described as risks to verify.

### Critical / high priority

1. **Payment currency is missing.** The amount is displayed only as `30.00`. In a global SaaS product, a customer cannot know whether this means USD, EUR, GBP, or another currency. This can cause unexpected charges, disputes, refunds, and loss of trust.
2. **No final order summary or explicit payment action.** The button says `Continue`, so it is unclear whether clicking it submits payment, opens a review step, or only saves the details. The UI should clearly communicate the consequence of the action.
3. **Payment-security implementation risk.** The screen appears to collect the card number directly. The implementation must be checked to confirm that card data is tokenized by a PCI-compliant payment provider, never logged, never stored by the SaaS application, and sent only over HTTPS. The static mock-up alone cannot prove a security defect.
4. **No visible CVV field or alternative verification flow.** Unless the payment method is already verified or the processor deliberately does not require CVV, its absence may weaken fraud controls. CVV must never be stored after authorization.

### Medium priority

5. **The form is not internationalized.** It requires `State or Province`, provides a state dropdown, and does not show a country selector. Many international addresses do not use a US state or the same address structure.
6. **Restrictive formatting instructions.** Requiring a card number with no spaces and a postal code with no dashes creates unnecessary errors. The UI should accept common formatting and normalize it internally.
7. **Card type should not be manually selected.** The card brand can be detected from the card number. A separate selector can become inconsistent with the entered number.
8. **No inline validation or error guidance is visible.** The design does not show where validation errors appear, whether invalid fields are preserved, or whether focus moves to the first error.
9. **Required-field communication relies heavily on red asterisks.** This may be difficult for color-blind users and screen-reader users unless the required state is programmatically exposed and errors are associated with their inputs.
10. **Ambiguous address line 2.** The second street-address field has no label such as `Apartment, suite, unit (optional)`.
11. **Middle initial has no clear optional marker.** Users may not know whether `MI` is required or what the abbreviation means.
12. **No visible billing context.** The UI does not show the product/plan, billing period, taxes, renewal terms, discount, or total due today.
13. **Potential duplicate-charge risk.** The implementation should disable the final payment control after one valid submission and use an idempotency key on the server.
14. **Performance risk to verify.** Payment-provider scripts should be loaded efficiently and should not block the main UI. Submission needs a visible progress state and a recoverable timeout/error state.

## B. Sample test cases

### TC-01 - Successful payment with an international billing address

**Preconditions:** A test customer is purchasing a plan priced at USD 30.00; the payment gateway is in sandbox mode.

**Steps:**

1. Confirm that the page displays the plan, billing period, taxes, total, and `USD` next to the amount.
2. Enter a valid sandbox card and a non-US billing address.
3. Click the explicit final action, for example `Pay USD 30.00`.

**Expected:** The payment is authorized once, the customer sees a confirmation and transaction reference, the selected currency and charged total match the summary, and no raw card data appears in application logs or network requests to the SaaS backend.

### TC-02 - Validation and recovery from invalid data

**Steps:**

1. Enter an invalid card number, an expired date, and an invalid postal code.
2. Submit the form.
3. Correct the highlighted fields and submit again.

**Expected:** No payment request is sent for client-detectable invalid data; each error is specific, programmatically associated with its field, announced to assistive technology, and does not erase other valid values. After correction, the transaction can complete normally.

### TC-03 - Duplicate submission and network timeout

**Steps:**

1. Enter valid sandbox payment details.
2. Double-click the payment button while simulating a slow or timed-out response.
3. Retry after the timeout message.

**Expected:** The control enters a visible processing state and cannot create parallel requests. The server uses the same idempotency key for the safe retry, only one charge is created, and the user receives a clear recoverable result.

## C. Product solution for the most severe bug

The most severe confirmed UI bug is the missing currency for a global payment.

Replace the isolated `Payment Amount 30.00` label with a server-generated order summary containing:

- Product or plan name and billing period.
- Subtotal, discount, tax, and total due today.
- Currency shown with an ISO 4217 code, for example `USD 30.00`, rather than relying only on `$`.
- Renewal amount and renewal date for recurring billing.
- A clear final button such as `Pay USD 30.00` or `Start subscription - USD 30.00/month`.

The server must remain authoritative for product, price, tax, and currency. It should reject any client-side attempt to modify these values. The checkout should also use payment-provider-hosted fields/tokenization, idempotent payment requests, and a reviewable confirmation state.
