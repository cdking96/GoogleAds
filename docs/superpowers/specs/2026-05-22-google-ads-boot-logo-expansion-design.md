# Google Ads Boot Logo Expansion Design

## Goal

Add a one-shot Google Ads logo expansion animation to the boot loader shown when a browser performs a full page load or refresh.

The animation starts from the compact overlapping logo in reference Image #1, expands into the full Google Ads mark in reference Image #2, and then holds the expanded mark until the page enters.

## Scope

The loader behavior applies to browser-level page loads for every user-facing Ads route currently served by this project:

- Report editor pages rendered from `views/index.ejs`.
- Campaign, ad group, and ad asset pages rendered from `views/google_ads.ejs`.

In-app data refresh controls keep their existing scoped refresh states. This change does not turn the Refresh buttons into full-page overlays and does not animate route changes that do not reload the document.

## Chosen Approach

Use the existing CSS-drawn boot logo structure and CSS keyframes.

The current report editor loader already models the Google Ads mark as three positioned elements:

- Yellow bar.
- Green circle.
- Blue bar.

Those elements will receive one-shot transforms from a compact initial arrangement to their existing expanded positions. This keeps the first frame available during document parsing, avoids JavaScript timing dependencies for animation start, and keeps the change aligned with the current loader markup.

## Loader Structure

The report editor boot loader remains the base implementation:

- Full viewport overlay.
- Top loading progress bar.
- Centered three-part Ads logo.
- Fade-out when the page is ready.

The Google Ads shell template receives equivalent boot loader markup and a page-load timestamp so browser refreshes on campaign, ad group, and ad asset URLs show the same boot experience. Shared loader styling stays in the stylesheet that both templates already load.

Each page script owns hiding the loader after its initial data path is ready. The report editor keeps its existing minimum visible time. The Google Ads shell gets matching hide behavior so the expanded logo is visible through its initial data load instead of disappearing immediately after Vue mounts.

## Animation Behavior

The center logo begins in the compact reference state:

- Yellow is mostly hidden behind the blue stroke and remains visible on the left.
- Green is not visible as a separate expanded endpoint in the initial frame.
- Blue is close to vertical and overlaps the yellow stroke.

The animation expands once into the full Ads mark:

- Blue rotates and shifts to the right stroke position.
- Yellow rotates and shifts to the left stroke position.
- Green appears at the lower-left endpoint as the mark opens.

Animation duration should be short enough for a boot transition, approximately `500ms` to `700ms`, using a smooth easing curve. Final keyframes must use fill behavior that preserves the expanded logo until the loader is hidden.

The existing top progress bar may continue looping while load completion is pending. The logo itself must not collapse or repeat.

## Reference Frame Audit

The supplied frame sequence in `/Users/weiquanni/Downloads/files` maps to this motion design:

- `frame_042`: blue capsule is the only clear visible logo part, centered and nearly vertical.
- `frame_043`: a small yellow sliver appears at the lower-left edge of the blue stroke.
- `frame_044` to `frame_046`: yellow opens outward while blue rotates into the right stroke, forming the Ads fork.
- `frame_047` to `frame_048`: the yellow and blue strokes hold nearly complete positions before the green endpoint appears.
- `frame_049` to `frame_052`: green appears near the upper overlap, grows to full size, and slides diagonally down-left.
- `frame_053` to `frame_055`: green settles into the lower-left endpoint and the full logo holds until the loader fades.

Implementation timing follows that sequence:

- Blue and yellow animate over `620ms`; blue holds the compact vertical pose at the beginning, while yellow stays hidden for the first `14%`.
- Green is delayed by `420ms`, then slides for `520ms` from the upper overlap into the lower-left endpoint.
- The loader remains visible for at least `1000ms`, so the expanded mark has a brief held state before fade-out.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- Skip the expansion movement.
- Render the complete expanded logo immediately.
- Keep the existing loader visibility and fade-out behavior concise.

## Testing

Add focused regression coverage for:

- Boot loader markup in both page templates.
- CSS one-shot logo expansion keyframes and final-state fill behavior.
- Reduced-motion fallback for the loader logo.
- Google Ads shell initial-load hide path so browser refresh loaders do not remain on screen after data load.

Rendered verification should cover:

- A report editor browser refresh.
- A campaign page browser refresh.
- The initial compact logo frame, the held expanded frame, and loader removal after entry.
- Desktop and one narrow viewport where practical.
