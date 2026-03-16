# Privacy Policy — Scholar Journal Filter

**Last updated**: March 16, 2026

## Data Collection

Scholar Journal Filter does **not** collect, transmit, or store any personal data. All extension data (your journal list, settings, and paper selections) is stored locally in your browser using Chrome's built-in storage API.

## Network Requests

The extension makes **no network requests** during normal operation. The only exception is when you explicitly click the "Get Abstracts (OpenAlex)" button during export. This sends paper titles to the [OpenAlex API](https://openalex.org/) to retrieve metadata (abstracts, DOIs). These requests are anonymous — no user identifiers, cookies, or tracking data are included.

## Third-Party Services

- **OpenAlex** (openalex.org): Used only when you explicitly request abstract retrieval. OpenAlex is a free, open scholarly database. See their [privacy policy](https://openalex.org/privacy-policy) for details on how they handle API requests.

## Permissions

- **storage**: Saves your journal list and settings locally in Chrome
- **contextMenus**: Enables the right-click "Add journal to filter list" menu item
- **host_permissions (api.openalex.org)**: Required for optional abstract retrieval

## Data Sharing

No data is shared with the extension developer, any third party, or any analytics service. There is no telemetry, no usage tracking, and no advertising.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/tomyan7950/scholar-filter/issues).
