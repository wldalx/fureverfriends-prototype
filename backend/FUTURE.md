# Visions or Future of the Project
*For continuing the project*

- [ ] implement cascading delete in models/…
- [ ] change both string values of SittingType.js:DROPIN_VISIT to …
    - real name e.g. "Drop-in visit" → modify all accesses to sittingType in frontend
    - exclude hyphen, rest uppercase → modify all accesses to sittingType in frontend
    - keep as is, but add comment that hyphen needed for auto-transform to display name
- [ ] Valid reports: If a user has been reported, the reporting user might want to have refunds for future bookings. This is currently not possible with Stripe, due to our software running in localhost