# Visions or Future of the Project
*For continuing the project*

- [ ] replace Date.js:convertDate() with date.toJSON().replace(/T.*$/, '')
- [ ] replace Google Fonts in index.css with downloaded font files
    - [ ] similar with leaflet.css in index.html from unpkg.com
- [ ] searchPage/FilterForm: clean up effects, states, order, …
        - sometimes rendering is too late, so if I enter 1, then it get's deleted and replaced by 5
- [ ] all files
    - [ ] minor code beautification
        - [ ] canonical local imports i.e. with(out) .js suffix
        - [ ] replace  (if var is no expression but just a variable) all
            - `(var) ? … : …` with `var ? … : …`
            - `(var) && …` with `var && …`, `(var) || …` with `var || …`
    - [ ] add option to book/select more than 1y in advance
    - [ ] remove setState of variables from useEffect hooks → triggers second re-render immediately
        - e.g. populating refs in ProfileBox? for each render setRefs is called → re-render
        - useEffect defs and apply react.dev/reference/react/useEffect#updating-state-based-on-previous-state-from-an-effect
        - useState defs and apply react.dev/reference/react/useState#updating-state-based-on-the-previous-state

# Notes
- The frontend doesn't filter for Bookings with paid=false, because Stripe Webhooks are not supported on localhost and thus there is no way to verify a payment transaction.