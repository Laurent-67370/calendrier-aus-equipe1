const admin = require('firebase-admin');

const rankingData = [
    { rang: 1, equipe: 'ROSSFELD UTL 1', pointsResultat: 37, joues: 9, gagnes: 8, nuls: 0, perdus: 1, pointsJeuGagnes: 126, pointsJeuPerdus: 54, isOurTeam: false },
    { rang: 2, equipe: 'DORLISHEIM SD 1', pointsResultat: 35, joues: 9, gagnes: 8, nuls: 0, perdus: 1, pointsJeuGagnes: 109, pointsJeuPerdus: 70, isOurTeam: false },
    { rang: 3, equipe: 'SCHLEITHAL USEP 1', pointsResultat: 31, joues: 9, gagnes: 6, nuls: 0, perdus: 3, pointsJeuGagnes: 110, pointsJeuPerdus: 70, isOurTeam: false },
    { rang: 4, equipe: 'MARMOUTIER ST ETIENNE 1', pointsResultat: 27, joues: 9, gagnes: 4, nuls: 0, perdus: 5, pointsJeuGagnes: 92, pointsJeuPerdus: 87, isOurTeam: false },
    { rang: 5, equipe: 'SESSENHEIM FC 1', pointsResultat: 26, joues: 9, gagnes: 5, nuls: 0, perdus: 4, pointsJeuGagnes: 80, pointsJeuPerdus: 100, isOurTeam: false },
    { rang: 6, equipe: 'BEINHEIM CTT 1', pointsResultat: 23, joues: 9, gagnes: 2, nuls: 0, perdus: 7, pointsJeuGagnes: 79, pointsJeuPerdus: 101, isOurTeam: false },
    { rang: 7, equipe: 'ALSATIA UNITAS SCHILTIGHEIM 1', pointsResultat: 19, joues: 9, gagnes: 2, nuls: 0, perdus: 7, pointsJeuGagnes: 60, pointsJeuPerdus: 120, isOurTeam: true },
    { rang: 8, equipe: 'BARR TT 1', pointsResultat: 18, joues: 9, gagnes: 1, nuls: 0, perdus: 8, pointsJeuGagnes: 63, pointsJeuPerdus: 117, isOurTeam: false }
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
    const rankingCollection = db.collection('ranking-equipe1');

    // Supprimer toutes les anciennes données
    const snapshot = await rankingCollection.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Ajouter les nouvelles données
    const newBatch = db.batch();
    rankingData.forEach((team, index) => {
      newBatch.set(rankingCollection.doc(`team-${index + 1}`), team);
    });
    await newBatch.commit();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Classement de l'équipe 1 initialisé avec succès.",
        teamsCount: rankingData.length
      }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation du classement : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};
