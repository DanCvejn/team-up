# TeamPlay - Checklist zbývající práce

Poslední update: 2026-01-05 (pozdní večer)

---

## ✅ Hotovo

### **Auth & Navigace**
- ✅ Auth (Login, Register, Logout)
- ✅ Token persistence a refresh
- ✅ Auth guards a redirect logic
- ✅ Navigace (Auth Stack, Main Tabs)
- ✅ Header navigace s back button pro všechny stacky
- ✅ Prohozené pořadí tabů (Events první, Teams druhý)
- ✅ Default redirect na Events tab po přihlášení

### **Teams**
- ✅ Teams List + FAB s expandable menu
- ✅ Create Team Modal (s invite code generováním)
- ✅ Join Team Modal (invite code input)
- ✅ Team Detail (Header, Members, Events)
- ✅ Team Settings Sheet (UI)
- ✅ Member Actions Sheet (remove, change role)
- ✅ API metody (create, join, update, delete, leave, members management)
- ✅ TeamEventsList - zobrazuje jen nadcházející akce
- ✅ TeamEventsList - max 5 akcí, tlačítko "Zobrazit všechny"
- ✅ TeamEventsList - řazení od nejbližší akce
- ✅ Modal "Všechny akce" v team detailu (všechny akce včetně proběhlých)

### **Events**
- ✅ Events List (všechny akce ze všech týmů)
- ✅ Event Card komponenta (s capacity progress, team badge)
- ✅ Zobrazení akcí do 3 měsíců zpět
- ✅ Rozdělení na sekce "Nadcházející akce" a "Proběhlé akce"
- ✅ Event Detail Screen
  - ✅ Zobrazení všech detailů akce
  - ✅ Seznam účastníků (potvrzení + waitlist)
  - ✅ RSVP tlačítka (custom response options)
  - ✅ Zakázání změny odpovědi po skončení akce
  - ✅ Přidání hostů (external players)
  - ✅ Smazání hostů (jen těch co přidal current user)
  - ✅ Ikona koše jen u hostů, ne u členů týmu
  - ✅ Zobrazení času poslední aktualizace (updated místo created)
  - ✅ Řazení odpovědí podle updated (nejnovější nahoře)
  - ✅ Kapacitní systém s progress barem
  - ✅ Realtime updates (subscriptions)
- ✅ Create Event Modal
  - ✅ Formulář (name, date, location, capacity, description)
  - ✅ Custom response options (labels, colors, countsToCapacity)
  - ✅ Date/Time picker
- ✅ Edit Event Modal
  - ✅ Editace všech atributů události
  - ✅ Upravování response options
  - ✅ Tlačítko edit viditelné jen pro tvůrce nebo team admina
  - ✅ Integrace v Event Detail

### **Profile**
- ✅ Profile Screen (základní - avatar, jméno, email, logout)

### **Common Features**
- ✅ Helper pro skloňování (pluralize)
- ✅ Common komponenty (EmptyState, LoadingSpinner)
- ✅ Custom animated Modal s pan gesture
- ✅ Alert/Toast systém (AlertProvider, FancyAlert, useAlert)
- ✅ Pull-to-refresh na lists
- ✅ Error handling pro API calls (try-catch s fallback na prázdné pole)

---

## 🔨 Potřeba dodělat

### **1. Teams funkčnost**
- ✅ Edit Team Modal
  - ✅ UI komponenta vytvořena (EditTeamModal.tsx)
  - ✅ API `updateTeam` je hotové v useTeams.ts
  - ✅ Propojeno v TeamSettingsSheet
  - ✅ Opraveny PocketBase API rules pro team_members a users collections
- ✅ Leave Team implementace
  - ✅ API call existuje v useTeams.ts
  - ✅ UI tlačítko/akce propojeno v TeamSettingsSheet
  - ✅ Kontrola jestli není jediný admin (zobrazí error pokud ano)
- ✅ Delete Team implementace
  - ✅ API call existuje v useTeams.ts
  - ✅ UI tlačítko/akce je v TeamSettingsSheet a implementováno
  - ⏳ Cascade delete všech dat (ověřit že PocketBase dělá správně)
- ✅ Regenerace invite kódu
  - ✅ API implementováno v teamsAPI.regenerateInviteCode
  - ✅ Propojeno v useTeams hook
  - ✅ UI tlačítko v TeamDetailHeader (viditelné jen pro adminy když je kód zobrazen)

### **2. Events funkčnost**
- ✅ Delete Event
  - ✅ API `deleteEvent` přidáno do useEvent.ts
  - ✅ UI tlačítko (červený koš) přidáno vedle edit tlačítka v Event Detail
  - ✅ Viditelné jen pro tvůrce nebo team admina
- ⏳ Automatický posun náhradníků při uvolnění místa
  - Logika pro capacity counting existuje
  - Není jasné jestli funguje automatický posun z waitlist

### **3. Profile & Settings**
- ⏳ Edit Profile
  - Změna jména
  - Upload avataru
  - UI komponenta neexistuje
- ⏳ App Settings
  - Notifikace
  - Vzhled (dark mode - useColorScheme placeholder existuje)
  - Jazyk
  - Žádná UI neexistuje

### **4. Pocketbase integrace**
- ⏳ Otestovat všechny API endpointy
- ⏳ Custom endpoint `/api/teams/join` - ověřit že funguje
- ⏳ SSL/network issue (HTTP vs HTTPS) - zmíněno v původním checklistu
- ⏳ Seed data pro testování

### **5. UI/UX vylepšení**
- ✅ Pull-to-refresh na seznamech (implementováno)
- ⏳ Loading states - částečně hotovo, možná chybí na některých místech
- ⏳ Error handling s toast/alert messages - alert systém existuje, ale není všude použit
- ⏳ Optimistic updates (změny viditelné okamžitě před API response)
- ⏳ Skeleton loaders místo/vedle spinnerů
- ⏳ Keyboard překrývá inputy? (netestováno)
- ⏳ Better empty states s akcemi

### **6. Nice-to-have features**
- ⏳ Push notifikace (nová akce, změna RSVP)
- ⏳ Export dat týmu
- ⏳ Statistiky (kolik akcí, účast, atd.)
- ⏳ Search/Filter akcí
- ⏳ Kalendářové zobrazení akcí
- ⏳ Comments/Chat na akcích
- ⏳ Photo upload k akcím
- ⏳ Event recurrence (opakující se akce)

### **7. Testování & Bug fixing**
- ⏳ Test všech flows od A do Z
- ⏳ Edge cases (prázdné seznamy, network errors)
- ⏳ Android vs iOS kompatibilita
- ⏳ Unit/Integration testy
- ⏳ Test realtime subscriptions (odpojení/připojení)
- ⏳ Test kapacitního systému (hranice případy)

### **8. Polish & Production**
- ⏳ App ikona
- ⏳ Splash screen
- ⏳ App store screenshots
- ⏳ Privacy policy / Terms
- ⏳ Error tracking (Sentry?)
- ⏳ Analytics
- ⏳ Performance optimization
- ⏳ Accessibility (a11y)

---

---

## 📝 Changelog - 2026-01-07

### ✅ Implementováno dnes (část 1):
1. **PocketBase API rules fix:**
   - Opraveny `listRule` a `viewRule` pro `users` collection (umožnění zobrazení členů týmu)
   - Opraveny `listRule` a `viewRule` pro `team_members` collection (umožnění zobrazení všech členů týmu)
   - **Fix zásadního bugu:** Team detail nyní správně zobrazuje všechny členy týmu s jejich jmény a emaily

2. **Edit Team funkčnost:**
   - Vytvořena komponenta `EditTeamModal.tsx` (v `components/teams/`)
   - Propojeno s `TeamSettingsSheet` - tlačítko "Upravit tým" nyní funguje
   - Implementována funkce `handleUpdateTeam` v team detail screen
   - Modal se předvyplní aktuálními údaji týmu (název, popis)
   - Po uložení se data refreshnou a zobrazí success zpráva

### ✅ Implementováno dnes (část 2 - high priority features):
3. **Leave Team funkčnost:**
   - Implementována funkce `handleLeaveTeam` v team detail screen
   - Přidána validace - uživatel nemůže opustit tým pokud je jediný admin
   - Zobrazí chybovou hlášku s instrukcemi pokud je jediný admin
   - Po úspěšném opuštění týmu přesměruje zpět na seznam týmů

4. **Delete Event funkčnost:**
   - Přidána funkce `deleteEvent` do `useEvent` hooku
   - Přidáno červené tlačítko koše vedle edit tlačítka v Event Detail
   - Viditelné jen pro tvůrce události nebo team admina
   - Po smazání přesměruje zpět na předchozí obrazovku

5. **Regenerate Invite Code funkčnost:**
   - Implementována API funkce `regenerateInviteCode` v `teamsAPI`
   - Přidána do `useTeams` hooku
   - Přidáno tlačítko "Vygenerovat nový kód" v TeamDetailHeader
   - Viditelné jen pro adminy když je pozvánkový kód zobrazen
   - Po regeneraci se zobrazí success zpráva a data se refreshnou

### ⚠️ Opravené problémy:
- ✅ Bug s nezobrazováním členů týmu v team detail
  - Příčina: Restriktivní PocketBase API rules pro collections `users` a `team_members`
  - Řešení: Upraveny rules, aby umožňovaly zobrazení členů stejného týmu

---

## 📝 Changelog - 2026-01-05 (pozdní večer)

### ✅ Implementováno dnes:
1. **Event Detail vylepšení:**
   - Zakázání změny odpovědi po skončení akce
   - Ikona koše pouze u hostů (ne u členů týmu)
   - Řazení odpovědí podle `updated` místo `created`
   - Zobrazení času poslední aktualizace
   - Edit Event tlačítko (viditelné jen pro tvůrce nebo team admina)

2. **Navigace:**
   - Přidány headers s back button do všech stacků
   - Prohozeno pořadí tabů (Events první, Teams druhý)
   - Opravena navigace mezi stacky

3. **Přehled akcí:**
   - Zobrazení akcí do 3 měsíců zpět
   - Rozdělení na "Nadcházející" a "Proběhlé" sekce
   - TeamEventsList zobrazuje jen nadcházející, max 5 s tlačítkem "Zobrazit všechny"
   - Modal "Všechny akce" v team detailu (včetně proběhlých)

4. **Edit Event funkčnost:**
   - Nová komponenta EditEventModal (stejná struktura jako CreateEventModal)
   - Možnost upravit název, popis, datum, čas, místo, kapacitu
   - Úprava response options (přidání, smazání, změna barvy, změna countsToCapacity)
   - Přidána funkce updateEvent do useEvent hooku
   - Edit tlačítko se zobrazuje jen tvůrci nebo team adminovi

5. **Bug fixes:**
   - Opraveno načítání eventů (zjednodušený expand bez nested relations)
   - Přidán error handling s fallback na prázdné pole

6. **Refactor & cleanup (provedeno dnes):**
   - Extrahovaný `EventCard` do `components/events/EventCard.tsx` a použit v `app/(tabs)/events/index.tsx`.
   - Vytvořen `EventOptionEditor` v `components/events/EventOptionEditor.tsx` a nasazený v `CreateEventModal` a `EditEventModal` pro sdílení UI/logic.
   - Odstraněny / neutralizovány nepoužívané komponenty: `external-link`, `haptic-tab`, `parallax-scroll-view`, `hello-wave`, `ui/collapsible` (soubory nahrazeny no-op exporty a připraveny ke smazání).
   - Cílem refaktoru bylo snížit duplicitu mezi Create/Edit modaly a zlepšit čitelnost `app/(tabs)/events/index.tsx`.

### ⚠️ Známé problémy:
- Občasný error "ClientResponseError 0: Something went wrong" v detailu týmu
  - Možná souvisí s PocketBase expand nebo network issues
  - Potřeba další debugging

---

## 📊 Shrnutí stavu

**Celkově hotovo: ~77%**

**Core features (must-have):**
- ✅ Auth flow - 100%
- ✅ Teams management - 80% (chybí edit, leave, delete v UI)
- ✅ Events management - 97% (chybí jen delete v UI)
- ⏳ Profile - 30% (jen zobrazení, chybí úpravy)

**Advanced features:**
- ✅ Event history - 100% (3 měsíce zpět, rozdělené sekce)
- ⏳ Realtime - 70% (implementováno, ale netestováno důkladně)
- ⏳ Capacity system - 80% (funguje, ale možná chybí edge cases)
- ✅ Guest management - 100%
- ✅ UI/UX polish - 70% (navigation headers, empty states, show all)

**Infrastructure:**
- ✅ API layer - 95%
- ✅ Type safety - 100%
- ⏳ Error handling - 50%
- ⏳ Testing - 0%
- ⏳ Production ready - 20%

---

## 🎯 Doporučené priority

### **Fáze 1: Core features completion (1-2 týdny)**
1. Edit Team Modal + propojení
2. Leave Team UI + logika
3. Delete Team UI + logika
4. ✅ Edit Event Modal + propojení
5. Delete Event UI + logika
6. Error handling všude kde chybí

### **Fáze 2: Profile & Settings (1 týden)**
7. Edit Profile UI + API
8. App Settings screen
9. Dark mode support

### **Fáze 3: Testing & Bug fixing (1-2 týdny)**
10. Test všech flows
11. Edge cases
12. Android vs iOS
13. Realtime subscription testy

### **Fáze 4: Polish & Production (1 týden)**
14. App ikona + splash screen
15. Store screenshots
16. Privacy policy
17. Performance optimization
18. Accessibility

### **Fáze 5: Nice-to-have (backlog)**
19. Push notifikace
20. Statistiky
21. Export dat
22. Atd.
