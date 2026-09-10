# Engineering case study

## Context

During an introductory internship at Keltech from 13 July to 13 August 2025, Badr El Jouhari developed an e-commerce application as a practical introduction to cloud-native development. The aim was to connect a usable storefront to managed AWS services and understand the responsibilities at each layer.

This case study is based on the internship report and the surviving frontend source. Historical implementation statements are separated from the later portfolio improvements; no current cloud availability or measured production scale is claimed.

## Decisions and trade-offs

**React + Vite:** reusable pages and components, fast development feedback and a static production bundle. React Context is sufficient for a modest catalog/cart application, avoiding a larger state-management dependency.

**Managed identity:** Cognito handles registration, verification and sign-in. The frontend displays the appropriate journey; verified API authorization remains the responsibility of the backend.

**Serverless application logic:** separate product, review and order-email functions make permissions and responsibilities easier to reason about. This reduces server administration but introduces service configuration, integration testing and observability work.

**DynamoDB:** Products and Reviews match the documented access patterns. Querying reviews by product/index is preferable to repeatedly scanning the whole review collection. The report describes a catalog scan in the products handler; a production catalog would need pagination and deliberate access-pattern design.

**S3 + CloudFront OAC:** media can be distributed through CloudFront while direct public bucket access is blocked. This is an origin-access decision, not a claim that all product images are private to authenticated shoppers.

**SES notifications:** a dedicated function separates email delivery from the storefront. The original documented flow notifies a configured seller/admin recipient; production customer mail and payment confirmation are separate concerns.

**Monitoring and costs:** CloudWatch logs, duration/error/throttle alarms, SNS notifications and budget alerts were part of the documented project. Resource retirement avoided maintaining an unnecessary cloud environment after the internship. No “always free” guarantee is made for AWS.

## Portfolio improvements (September 2026)

- A runnable local demonstration with explicit sample profiles and in-memory catalog/reviews.
- Public configuration centralized in one module, with demo as the safe default.
- Validation of cart quantities, product existence/sizes, prices, delivery fields and review inputs.
- Correct handling of an absent session and pending supported Cognito sign-in challenges.
- Clear distinction between simulated checkout, order-request acceptance and a real payment.
- Updated dependencies, unit tests, lint/build checks and a redacted secret-pattern guardrail.
- Smaller page components and separate API/domain/demo modules to make the repository easier to navigate.

## Lessons learned

An API that recomputes `price × quantity` still trusts the browser if those prices came from the request. Authentication and group authorization are separate checks. A polished UI should not promise payment, email delivery or order persistence that has not been implemented. Infrastructure configuration should be versioned alongside application code to make the original deployment reproducible.

## Next improvements

If the project were continued beyond the portfolio, the priorities would be a versioned backend/IaC implementation, server-side price/stock validation, durable orders with idempotency, pagination, automated integration tests and a real sandbox payment flow. WAF, CloudTrail and more advanced recommendations remain future work, not features claimed by this repository.
