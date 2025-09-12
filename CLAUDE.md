# Project: Drink Challenge Tracker (PWA)

## 🎯 Visione
Un’app ibrida tra **tracker** e **gioco**:
- Utile a chi vuole **ridurre il consumo di alcol** (monitoraggio + obiettivi).
- Divertente per chi vuole **sfidare gli amici** (classifica + trofei).

---

## 🛠️ Stack Tecnologico
- **Frontend**: React + Vite
- **Stile**: TailwindCSS (mobile-first, responsive)
- **Animazioni**: Framer Motion
- **Backend/DB**: Supabase (Postgres, Auth, API)
- **Deploy**: Vercel (PWA)

## 📂 Struttura progetto
src/
 ├─ api/             # qui dentro mettiamo tutte le chiamate
 │   ├─ drinks.js    # CRUD su tabella drinks
 │   ├─ groups.js    # CRUD su tabella groups
 │   ├─ users.js     # gestione profilo utente
 │   ├─ objectives.js
 │   └─ functions.js # chiamate a edge functions

├─ components/ // ProgressBar, DrinkForm, Leaderboard, Badge
├─ pages/ // Login, Dashboard, GroupPage, Achievements
├─ hooks/ // useAuth, useSupabase, useDrinks
├─ context/ // AuthContext, GroupContext
├─ utils/ // helpers (date formatter, calc weekly stats)
└─ App.jsx


## 🗄️ Database (Supabase)
### `users`
- `id` (uuid, PK, Supabase Auth)
- `username` (text)
- `created_at` (timestamp)

### `groups`
- `id` (uuid, PK)
- `name` (text)
- `owner_id` (uuid, FK → users.id)

### `group_members`
- `group_id` (uuid, FK → groups.id)
- `user_id` (uuid, FK → users.id)

### `drinks`
- `id` (uuid, PK)
- `user_id` (uuid, FK → users.id)
- `group_id` (uuid, FK → groups.id)
- `type` (text → es. Negroni, Campari, Vino, Birra…)
- `cost` (numeric(6,2) → costo della bevuta)
- `date` (date → giorno effettivo di consumo)
- `location` (text → bar, casa, pub…)
- `created_at` (timestamp)

### `objectives`
- `id` (uuid, PK)
- `user_id` (uuid, FK → users.id)
- `weekly_goal` (int → max drink/settimana)
- `created_at` (timestamp)

---

## 📱 Pagine principali
1. **Login/Signup** (Supabase Auth)
2. **Dashboard**
   - Totale drink settimanali
   - Barra di avanzamento (animata) verso obiettivo personale
   - Bottone rapido “+1 Drink”
   - Storico giornaliero
3. **Group Page**
   - Classifica settimanale del gruppo
   - Trofei (chi ha bevuto di più / meno)
4. **Achievements**
   - Badge progressivi
   - Es. “10 drink totali”, “7 giorni consecutivi di log”

---

## 🎨 UI/UX
- Design moderno e semplice (palette teal/orange/gray).
- Animazioni leggere per progress bar, badge e transizioni.
- Mobile-first, ottimizzata per PWA.
- Inserimento rapido drink: tipo + costo + data + luogo.

---

## 🔑 Linee guida di sviluppo
- **No duplicazione codice**:
  - Componenti riutilizzabili (`DrinkForm`, `ProgressBar`, `Leaderboard`…).
  - Custom hooks per logica condivisa (`useDrinks`, `useAuth`).
- **Best practice React**:
  - Componenti funzionali con hooks.
  - Stato globale via Context API.
  - Async/await + gestione errori pulita.
  - Separare UI da logica (UI components vs hooks/utils).
- **Pulizia**:
  - Naming consistente, file piccoli.
  - Commenti solo dove serve.
  - Variabili d'ambiente salvate nel file.env
- **Performance**:
  - Query limitate (es. solo settimana corrente).
  - Memoization se serve.