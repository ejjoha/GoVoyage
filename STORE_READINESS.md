# GoVoyage Store Readiness Checklist

Goal: prepare GoVoyage for Android Play Store first, then iOS App Store.

## Current strategy

- Android: package the existing PWA as a Trusted Web Activity.
- iOS: package with Capacitor later, after mobile polish and review-readiness.
- Do not submit publicly until real-device QA and policy pages are complete.

## Phase 1 — Product readiness

- [ ] App works well on real iPhone Safari
- [ ] App works well on real Android Chrome
- [ ] Login/logout tested
- [ ] Create trip tested
- [ ] Edit trip tested
- [ ] Invite traveller tested
- [ ] Accept invite tested
- [ ] Decline invite tested
- [ ] Leave trip tested
- [ ] Transfer ownership tested
- [ ] Delete account tested end-to-end
- [ ] Itinerary add/edit/delete tested
- [ ] Offline itinerary create/edit/delete/sync tested
- [ ] Conflict recovery tested
- [ ] Cost sharing add/edit/delete expense tested
- [ ] Custom currencies tested in expense list, totals, and who-owes-who
- [ ] Pack List tested
- [ ] Journal image upload/view tested
- [ ] Empty states reviewed
- [ ] Error states reviewed
- [ ] Loading states reviewed

## Phase 2 — Legal and trust pages

- [ ] Public Privacy Policy page exists
- [ ] Public Terms of Service page exists
- [ ] Public Support / Contact page exists
- [ ] Account deletion instructions exist
- [ ] Privacy policy explains collected data:
  - email
  - account identity
  - trips
  - travellers
  - itinerary bookings
  - expenses
  - packing data
  - journal text/images
- [ ] Privacy policy explains Supabase storage/auth usage
- [ ] Privacy policy explains support contact

## Phase 3 — Security and backend readiness

- [x] RLS enabled on security-advisor tables
- [x] Anonymous RPC access locked down
- [x] Public journal image listing policy removed
- [ ] Supabase leaked password protection enabled
- [ ] Remaining SECURITY DEFINER functions reviewed one by one
- [ ] Production Supabase project checked for test/debug functions
- [ ] Account deletion API tested in production
- [ ] Storage permissions reviewed
- [ ] Invite flow abuse/rate-limit reviewed

## Phase 4 — PWA readiness

- [x] App manifest exists
- [x] Service worker builds successfully
- [x] App icons generated
- [x] Apple touch icon generated
- [ ] Manifest name, short_name, description reviewed
- [ ] Theme color reviewed
- [ ] Offline fallback reviewed
- [ ] Home screen install tested on iPhone
- [ ] Home screen install tested on Android
- [ ] Production deploy tested after fresh install

## Phase 5 — Android Play Store readiness

- [ ] Google Play developer account ready
- [ ] Android package name decided
- [ ] Trusted Web Activity project generated
- [ ] Digital Asset Links configured
- [ ] Android signing configured
- [ ] Android App Bundle builds
- [ ] Internal testing release created
- [ ] Play Store listing title written
- [ ] Short description written
- [ ] Full description written
- [ ] Feature graphic created
- [ ] Phone screenshots created
- [ ] Tablet screenshots considered
- [ ] Data safety form completed
- [ ] Content rating completed
- [ ] Target API level compliant
- [ ] Internal testers complete test trip

## Phase 6 — iOS App Store readiness

- [ ] Apple Developer account ready
- [ ] Capacitor project added
- [ ] iOS bundle identifier decided
- [ ] iOS build runs locally
- [ ] App tested on real iPhone
- [ ] Native splash/icon assets generated
- [ ] TestFlight build uploaded
- [ ] App Store listing title written
- [ ] Subtitle written
- [ ] Description written
- [ ] Keywords written
- [ ] Support URL ready
- [ ] Privacy Policy URL ready
- [ ] App privacy details completed
- [ ] Reviewer notes written
- [ ] Test account prepared for Apple review

## Phase 7 — Launch readiness

- [ ] 10+ real test trips created
- [ ] At least one multi-user trip tested
- [ ] At least one offline itinerary test completed
- [ ] At least one journal image test completed
- [ ] At least one cost-sharing settlement test completed
- [ ] Known issues documented
- [ ] Support email monitored
- [ ] Backup/export plan considered
- [ ] Public launch decision made
