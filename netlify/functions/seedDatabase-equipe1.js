const admin = require('firebase-admin');

// MODIFICATION : L'effectif est maintenant de 11 joueurs
const playersData = [ 
    { id: 1, name: 'Joueur A' }, { id: 2, name: 'Joueur B' }, { id: 3, name: 'Joueur C' }, 
    { id: 4, name: 'Joueur D' }, { id: 5, name: 'Joueur E' }, { id: 6, name: 'Joueur F' },
    { id: 7, name: 'Joueur G' }, { id: 8, name: 'Joueur H' }, { id: 9, name: 'Joueur I' },
    { id: 10, name: 'Joueur J' }, { id: 11, name: 'Joueur K' }
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
    { id: 'J7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 1', awayTeam: 'ROSSFELD UTL 1', date: '2025-12-18', time: '20h15', venue: 'home', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() }
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
    if (matchesSnapshot.empty) {
        const matchesBatch = db.batch();
        initialMatchesData.forEach(match => {
            matchesBatch.set(matchesCollection.doc(match.id), match);
        });
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
      body: JSON.stringify({ message: "Base de données pour l'équipe 1 initialisée ou déjà existante." }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};