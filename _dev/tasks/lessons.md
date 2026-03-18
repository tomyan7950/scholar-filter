# Lessons

### [UX Design] Use 3+1 for visual/UI design options, not just research
- **Trigger**: User invoked 3+1 for citation badge visual design and it worked well
- **Rule**: The divergent thinking protocol applies to UI/UX design decisions too — span the solution space across different visual languages, interaction patterns, and information encodings
- **Example**: Citation badge options ranged from color-coded pills to opacity modulation to dot constellations — maximally distinct visual approaches

### [Chrome Extension] Storage changes don't backfill — defaults only load on first run
- **Trigger**: User couldn't see new FT 50 journals after reload because `!stored.journals` was false
- **Rule**: When adding new defaults to a Chrome extension, remember that existing users won't get them. Either provide a Reset mechanism or a migration path.
- **Example**: Added "Reset to Defaults" with category picker to solve this

### [Chrome Extension] Validate category count arrays against actual journal entries
- **Trigger**: `DEFAULT_CATEGORIES` declared Management count as 21, but 22 journals existed. The category picker would silently assign the last Management journal to Psychology.
- **Rule**: When adding or removing journals from `DEFAULT_JOURNALS`, always recount and update the corresponding `count` in `DEFAULT_CATEGORIES`. Mismatches cause silent misalignment in the picker UI.
- **Example**: Management had 22 entries but `count: 21` — Organization Studies was bucketed into Psychology in the category picker.
