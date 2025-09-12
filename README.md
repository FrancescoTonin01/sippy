# 🥃 Sippy - Drink Challenge Tracker

Un'app ibrida tra **tracker** e **gioco** per monitorare il consumo di alcol e sfidare gli amici!

## ✨ Funzionalità

- **📊 Tracking personalizzato**: Registra i tuoi drink con tipo, costo, data e luogo
- **🎯 Obiettivi settimanali**: Imposta e monitora i tuoi limiti
- **🏆 Sfide con amici**: Classifica settimanale del gruppo
- **🏅 Sistema di badge**: Sbloca achievement progressivi
- **📱 Mobile-first**: Design responsive ottimizzato per smartphone

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS + Framer Motion
- **Backend**: Supabase (Auth + Database)
- **Build**: Vite
- **Deploy**: Vercel (ready for PWA)

## 🚀 Setup Locale

1. **Clona il repository**
```bash
git clone <repo-url>
cd sippy
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura Supabase**
- Copia `.env.local.example` in `.env.local`
- Inserisci le tue credenziali Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Avvia il server di sviluppo**
```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

## 📦 Build per produzione

```bash
npm run build
npm run preview
```

## 🗄️ Database Schema

Le tabelle richieste in Supabase:

- `users` (id, username, created_at)
- `groups` (id, name, owner_id, created_at)
- `group_members` (group_id, user_id)
- `drinks` (id, user_id, group_id, type, cost, date, location, created_at)
- `objectives` (id, user_id, weekly_goal, created_at)

## 🎮 Come usare l'app

1. **Registrati/Accedi** con email e password
2. **Imposta un obiettivo** settimanale nel dashboard
3. **Registra i drink** con il bottone "+1 Drink"
4. **Unisciti a un gruppo** per sfidare gli amici
5. **Controlla i badge** nella sezione Achievement

## 🔧 Struttura del progetto

```
src/
├── api/            # API calls a Supabase
├── components/     # Componenti riutilizzabili
├── pages/          # Pagine dell'app
├── hooks/          # Custom hooks
├── context/        # Context providers
├── utils/          # Funzioni di utilità
└── App.tsx         # Router principale
```

## 🌟 Features future

- [ ] PWA completa con service worker
- [ ] Notifiche push per obiettivi
- [ ] Export dati in CSV/PDF
- [ ] Grafici e analytics avanzati
- [ ] Integrazione social login
