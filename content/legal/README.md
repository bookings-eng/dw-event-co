# Legal documents — immutable published versions

Files in this folder are **immutable published versions**. Never edit one in place.

A change to a legal document — even a wording tweak — creates a **new version
file**: `rental-agreement-v1.1.md`, `privacy-policy-v1.1.md`, etc. The old
version file stays untouched forever. Customers who booked under an older
version keep seeing that version in their confirmation email
(`agreement_version` is stored per booking).

To publish a new version:

1. Add the new file here (bump the version suffix).
2. Update the "current version" mapping in `lib/legal.ts`.
3. Leave every prior version file exactly as it was.

You will forget this in six months. That's why it's written down.
