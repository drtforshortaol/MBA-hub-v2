# Foundation device review

Owner-reported iPhone checks on the alpha.4 foundation, October 11–12, 2026:

- Both proof apps loaded and their image and dropdowns worked online.
- Back and Return to Hub worked after the navigation fixes.
- Both proof apps and the Five Senses image loaded with Airplane Mode enabled and Wi-Fi off.
- Global search for Relate opened the expanded section; Back restored the search and query.
- The same search and section link worked offline.
- The V2-only refresh route moved the device from its retained alpha.2 copy to alpha.4; the owner confirmed it worked.

These reports apply to the two-app foundation, not the unmigrated full collection. Full-release flags remain false. Standalone installation, interrupted downloads, complete collection permissions and the three-reviewer pilot are not certified by these reports.

## Foundation recovery verification passed

Exact alpha.4 source recovery commit: `3acfe59264c9d6d9951fcd42fd4e2185dfc395c2` in the private source repository.

Exact alpha.4 tester recovery commit: `021c200e6e365335ea8fb291c30928b1ea2621ab` in the public tester repository.

Both repositories retain `archive/foundation-alpha4-verified-2026-10-12`. These branches are convenient recovery pointers, not immutable protected tags. The commit IDs are the exact references.

Tester release resource hash: `372b656d714ce8a8`.

Alpha.5 changed only version indicators/history for the controlled update/rollback test. The owner screenshot at 06:14 on October 12 confirms the iPhone loaded alpha.5. The entire alpha.4 tester tree was then restored through new commit `1032ecae67f7b7e2fb4c8c4330a37efe2997bc35`, preserving history. Its tree matches the archived alpha.4 commit exactly; all 27 resource hashes verified locally. At 06:19 on October 12, the owner confirmed the restored alpha.4 footer, app loading and Relate search worked with Airplane Mode enabled and Wi-Fi off. The screenshot shows alpha.4, the Airplane Mode icon and Ready offline for all 27 files. The two-app foundation update, rollback and offline recovery proof passed.

Development source remains at alpha.5, with identical application behavior and the review record maintained. The tester deployment remains at the verified alpha.4 recovery baseline. V1 remains untouched.
