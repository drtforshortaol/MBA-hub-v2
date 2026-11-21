# Dad Bods of the Sea — source and permission review

Reviewed October 29, 2026 against Naturalist branch commit `503b5805982cdcb3f077f676458888b2515d16f1`.

## Finding

The retained `src/apps/IMG_4216.jpeg` (`asset-93c15fb934aba9e6`) visually matches the **Dad Bods of the Sea** poster on [Nicole Christine Visuals' project page](https://www.nicolechristinevisuals.com/medical-illustration/seahorse). The composition, stage labels, distinctive pink/green seahorses, foreground branches and signature match. This is a visual source match, not a claim that the different encodings are byte-identical. The retained image includes an AMI watermark; the artist's portfolio version does not.

The [2020 AMI salon entry](https://meetingarchive.ami.org/2020/project/reproductive-cycle-of-a-seahorse/) identifies **Nicole Hampshire**, with copyright **2020 Nicole Hampshire**. The current portfolio's [About page](https://www.nicolechristinevisuals.com/about) identifies Nicole Barocas and publicly lists `nicolechristinevisuals@gmail.com`. The matching portfolio is the contact route; no unrelated same-name directory entries or inferred employer addresses are used.

The portfolio explicitly reserves rights in its visuals. [AMI's image-use terms](https://ami.org/about-us/using-images-from-this-site/) require contacting the artist for written reuse permission. Neither source grants the hub repository/offline distribution rights needed to clear this gate. The poster uses **spiny seahorse, Hippocampus histrix**, as its model; it is not species-specific evidence about big-bellied seahorses. No scientific paragraphs were changed or approved by this review.

## Current disposition

Permission remains `review-required`. Creator identification is resolved; reuse permission is not. No source files, catalog entries, image bytes, owner-text bindings, runtime behavior, release gates or deployments changed. Four image permissions and five operational gates remain across the work branches (nine unique unresolved gates; the uncombined Naturalist branch still additionally carries the separately approved Seahorse-text marker).

## Recommended next decision

Use a clearly labeled external link to the artist's poster instead of embedding the pending image, retaining the approved authored text. This avoids making the release depend on a reply. Removing or replacing the embedded illustration needs a scoped owner decision; this review does not implement it. Alternatively, obtain written permission covering display in the guide hub, tester use, source-repository copies and downloaded offline copies, including required credit and restrictions.

## Permission request — unsent

Hello Nicole,

I maintain an educational guide hub for aquarium volunteers. May we reproduce your “Dad Bods of the Sea” / “Reproductive Cycle of the Seahorse” poster in the hub, including tester access, its source repository and downloaded offline copies? We currently hold a resized copy with an AMI watermark. Please confirm whether you control the relevant rights, which version we may use, the required credit, and any restrictions or fee. We would also identify the depicted species as the spiny seahorse rather than the big-bellied seahorse.

Thank you.

No email or other message has been sent. Permission has not been inferred from educational intent, attribution, the newsletter, or the owner's prior text approval.

## Verification

The supplemental JSON receipt records the exact retained asset hash and the downloaded artist-portfolio PNG hash. The original AMI image URL returned a CAPTCHA document to the command-line fetch; those bytes were excluded as image evidence. The visual comparison instead used the successfully downloaded image linked by the artist's own portfolio. This is documentation-only work; runtime tests were not repeated. JSON parsing, retained-image hash and pending-permission assertions, source-tree equality, and whitespace checks were run before saving.
