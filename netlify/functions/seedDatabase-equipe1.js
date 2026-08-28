const admin = require('firebase-admin');

// --- LISTE MISE À JOUR AVEC VOS VRAIS JOUEURS + 1 NOUVEAU ---
const playersData = [ 
    { id: 1, name: 'ANGIONI Romain' }, 
    { id: 2, name: 'BARRIER Baptiste' }, 
    { id: 3, name: 'FABY Jérôme' }, 
    { id: 4, name: 'GRENIER Vincent' }, 
    { id: 5, name: 'HUTTARD Thomas' }, 
    { id: 6, name: 'LALA Laurent' },
    { id: 7, name: 'LALA Louis' }, 
    { id: 8, name: 'LARDE Quentin' }, 
    { id: 9, name: 'LEMOINE Steeve' },
    { id: 10, name: 'MINNI Christophe' }, 
    { id: 11, name: 'MINNI Léa' }, 
    { id: 12, name: 'PUJOL Bastien' },
    { id: 13, name: 'Nouveau Joueur' } // <-- 13ÈME JOUEUR AJOUTÉ ICI. Modifiez ce nom !
];
const getDefaultComposition = () => ({ available: [], unavailable: [], noresponse: playersData.map(p => p.id), selected: [] });
const getDefaultScore = () => ({ alsatia: 0, opponent: 0 });

const initialMatchesData = [
    // Saison 2026-2027 — Prom. EXCELLENCE poule A, 1ère phase (J1-J7)
    // Source : PDF A6R "Saison 2026-2027 - Calendrier de 1ère Phase" (impression du 25-08-2026)
    // Les matchs 2025-2026 (J1-J14) restent en base mais portent season: '2025-2026'.
    { id: 'N1', journee: 1, homeTeam: 'ENT. A.P.I.G./OSTWALD 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-09-11', time: '20h15', venue: 'away', month: 'september', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N2', journee: 2, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'ZORN TT HOCHFELDEN 1', date: '2026-09-24', time: '20h15', venue: 'home', month: 'september', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N3', journee: 3, homeTeam: 'MARIENTHAL CONCORDIA 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-10-09', time: '20h15', venue: 'away', month: 'october', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N4', journee: 4, homeTeam: 'LA WANTZENAU ST PAUL 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-10-28', time: '20h', venue: 'away', month: 'october', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N5', journee: 5, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'LEUTENHEIM CTT 1', date: '2026-11-12', time: '20h15', venue: 'home', month: 'november', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N6', journee: 6, homeTeam: 'BETSCHDORF TT 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-11-27', time: '20h15', venue: 'away', month: 'november', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'SCHLEITHAL USEP 2', date: '2026-12-17', time: '20h15', venue: 'home', month: 'december', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() }
];

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

exports.handler = async function(event, context) {
  try {
    const matchesCollection = db.collection('matches-equipe1');
    const matchesSnapshot = await matchesCollection.get();


    // Migration saison : les anciens matchs (J1-J14, saison 2025-2026) n'ont pas de
    // champ 'season' — on le rajoute pour que l'app puisse filtrer la saison en cours.
    try {
      const allSnapshot = await matchesCollection.get();
      const tagBatch = db.batch();
      let tagged = 0;
      allSnapshot.forEach(doc => {
        if (!doc.data().season) { tagBatch.update(doc.ref, { season: '2025-2026' }); tagged++; }
      });
      if (tagged > 0) { await tagBatch.commit(); console.log(`Migration saison : ${tagged} ancien(s) match(s) tagué(s) 2025-2026.`); }
    } catch (e) { console.error('Tag anciens matchs:', e); }

    // Récupérer les IDs des matchs existants
    const existingMatchIds = new Set();
    matchesSnapshot.forEach(doc => {
        existingMatchIds.add(doc.id);
    });

    // Ajouter uniquement les matchs manquants
    const matchesBatch = db.batch();
    let addedMatchesCount = 0;
    initialMatchesData.forEach(match => {
        if (!existingMatchIds.has(match.id)) {
            matchesBatch.set(matchesCollection.doc(match.id), match);
            addedMatchesCount++;
        }
    });
    if (addedMatchesCount > 0) {
        await matchesBatch.commit();
    }

    const playersCollection = db.collection('players-equipe1');
    const playersSnapshot = await playersCollection.get();
    if (playersSnapshot.empty) {
        const playersBatch = db.batch();
        playersData.forEach(player => {
            playersBatch.set(playersCollection.doc(String(player.id)), player);
        });
        await playersBatch.commit();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Base de données mise à jour. ${addedMatchesCount} nouveau(x) match(s) ajouté(s).`,
        addedMatches: addedMatchesCount
      }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};