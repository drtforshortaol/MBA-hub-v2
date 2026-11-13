# MBA Hub V2 app-building protocol

## Start with the uploaded materials

Photos, Word documents, PDFs, or a mix, plus a request to build an MBA Hub V2 app, are enough to start. Preserve the originals. Inventory the uploads and map relevant text, tables, and images to proposed entries. Check scanned pages and complex layouts against the original when text extraction is incomplete. Record the source file and page or section for extracted content. Track media attribution and permissions in the media catalog. Review uploaded content for private information and publication permissions before including it in a public build. Group unresolved questions together and ask only when an answer materially affects the build. Continue independent work while waiting.

Define the smallest usable release: audience, purpose, Hub placement, required interactions, and offline behavior. Use supplied descriptions and verified sources. Flag uncertain identifications rather than presenting them as facts.

## Build inside V2

1. Work on a development branch. Inspect the existing manifests and template families and start from the closest working app. Give the app a permanent ID and declare its placement, version, and dependencies in its manifest. Let the build generate the registry.
2. Keep structured content, media assets, and rendering behavior independently editable. Reference images by stable media IDs, and reuse authoritative shared data where it exists. Reuse Hub navigation, search where supported, and offline handling. Add custom rendering only for behavior the existing templates cannot support.
3. Build a preview inside the development Hub using two representative entries from the uploaded materials, or the single entry if that is the full scope. Verify the Hub entry, Back, Return to Hub, phone-sized image layout, required offline behavior, and any guide controls. If the app uses Expand All and Collapse All, check both on multiple entries and keep card state in one implementation.
4. Once the preview works, import the remaining entries through the same template. Reconcile the final counts against the inventory and verify that each intended entry has the required content and any associated images.

## Validate and release

Run `npm run validate`, `npm run build`, and `npm test`. Verify the deployed development preview from the Hub menu, including required offline behavior. Report the branch or pull request, one development preview link, entry and image counts, test results, and any device checks still pending. Identify any check that could not be performed.

Use the repository's publication gates. Obtain the owner's explicit approval before merging to production or publishing, then verify the live entry point. Keep MBA Hub V1 outside V2 app changes.
