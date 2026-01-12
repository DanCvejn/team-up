# Team Up

Mobilní aplikace pro správu týmů a organizaci společných akcí, vytvořená pomocí React Native a Expo.

## Popis aplikace

Team Up je aplikace, která umožňuje uživatelům:

- Vytvářet a spravovat týmy
- Připojovat se k existujícím týmům pomocí pozvánek
- Organizovat a plánovat týmové akce
- Sledovat účast členů na akcích
- Spravovat členství v týmech
- Zobrazovat nadcházející i proběhlé akce

Aplikace využívá PocketBase jako backend pro autentizaci uživatelů a ukládání dat v reálném čase.

## Požadavky

- Node.js (verze 18 nebo vyšší)
- npm nebo yarn
- Expo CLI
- PocketBase server
- Mobilní zařízení s aplikací Expo Go nebo emulátor Android/iOS

## Instalace a spuštění

### 1. Naklonování repozitáře

```bash
git clone https://github.com/DanCvejn/event-finder.git
cd team-up
```

### 2. Instalace závislostí

```bash
npm install
```

### 3. Konfigurace PocketBase

Aplikace vyžaduje běžící PocketBase server. URL serveru je nakonfigurována v souboru `lib/api/client.ts`.

Výchozí konfigurace:
- Vývojové prostředí: `http://10.0.2.2:8090` (Android emulátor)
- Produkční prostředí: nahraď vlastní URL

### 4. Spuštění aplikace

```bash
npx expo start
```

Po spuštění můžeš aplikaci otevřít:

- **Android**: Naskenuj QR kód aplikací Expo Go nebo stiskni `a` pro spuštění v Android emulátoru
- **iOS**: Naskenuj QR kód aplikací Expo Go nebo stiskni `i` pro spuštění v iOS simulátoru
- **Web**: Stiskni `w` pro spuštění ve webovém prohlížeči

## Struktura projektu

```
team-up/
├── app/                    # Obrazovky a routing (Expo Router)
│   ├── (auth)/            # Autentizační obrazovky (login, register)
│   ├── (tabs)/            # Hlavní záložky aplikace
│   │   ├── events/        # Seznam a detail akcí
│   │   ├── teams/         # Seznam a detail týmů
│   │   └── profile.tsx    # Uživatelský profil
│   └── _layout.tsx        # Root layout
├── components/            # Znovupoužitelné komponenty
│   ├── common/           # Společné UI komponenty
│   ├── events/           # Komponenty pro akce
│   └── teams/            # Komponenty pro týmy
├── hooks/                # Custom React hooks
├── lib/                  # Knihovny a utility
│   ├── api/             # API klienti a endpointy
│   └── types/           # TypeScript definice
└── assets/              # Obrázky, fonty a další statické soubory
```

## Technologie

- **React Native** - Framework pro vývoj mobilních aplikací
- **Expo** - Vývojová platforma pro React Native
- **Expo Router** - File-based routing
- **PocketBase** - Backend as a Service
- **TypeScript** - Typová bezpečnost
- **React Hook Form** - Správa formulářů
- **Zod** - Validace schémat

## Další příkazy

```bash
# Spuštění na Android
npm run android

# Spuštění na iOS
npm run ios

# Spuštění na webu
npm run web

# Lint
npm run lint
```
