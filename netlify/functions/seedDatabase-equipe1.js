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
    { id: 'J1', journee: 1, homeTeam: 'BARR TT 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2025-09-19', time: '20h15', venue: 'away', month: 'september', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J2', journee: 2, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'SCHLEITHAL USEP 1', date: '2025-10-02', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J3', journee: 3, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'BEINHEIM CTT 1', date: '2025-10-16', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J4', journee: 4, homeTeam: 'DORLISHEIM SD 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2025-10-31', time: '20h00', venue: 'away', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J5', journee: 5, homeTeam: 'MARMOUTIER ST ETIENNE 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2025-11-21', time: '20h15', venue: 'away', month: 'november', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J6', journee: 6, homeTeam: 'SESSENHEIM FC 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2025-12-05', time: '20h15', venue: 'away', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'ROSSFELD UTL 1', date: '2025-12-18', time: '20h15', venue: 'home', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J8', journee: 8, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'BARR TT 1', date: '2026-01-22', time: '20h15', venue: 'home', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J9', journee: 9, homeTeam: 'SCHLEITHAL USEP 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-01-31', time: '15h', venue: 'away', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J10', journee: 10, homeTeam: 'BEINHEIM CTT 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-02-10', time: '20h', venue: 'away', month: 'february', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J11', journee: 11, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'DORLISHEIM SD 1', date: '2026-03-12', time: '20h15', venue: 'home', month: 'march', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J12', journee: 12, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'MARMOUTIER ST ETIENNE 1', date: '2026-04-02', time: '20h15', venue: 'home', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J13', journee: 13, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'SESSENHEIM FC 1', date: '2026-04-23', time: '20h15', venue: 'home', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J14', journee: 14, homeTeam: 'ROSSFELD UTL 1', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', date: '2026-05-15', time: '20h', venue: 'away', month: 'may', composition: getDefaultComposition(), score: getDefaultScore() }
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