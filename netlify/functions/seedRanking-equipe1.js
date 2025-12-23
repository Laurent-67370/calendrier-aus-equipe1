const admin = require('firebase-admin');

const rankingData = [
    { rang: 1, equipe: 'ROSSFELD UTL 1', pointsResultat: 31, joues: 7, gagnes: 7, nuls: 0, perdus: 0, pointsJeuGagnes: 105, pointsJeuPerdus: 35, isOurTeam: false },
    { rang: 2, equipe: 'DORLISHEIM SD 1', pointsResultat: 27, joues: 7, gagnes: 6, nuls: 0, perdus: 1, pointsJeuGagnes: 87, pointsJeuPerdus: 53, isOurTeam: false },
    { rang: 3, equipe: 'SCHLEITHAL USEP 1', pointsResultat: 24, joues: 7, gagnes: 5, nuls: 0, perdus: 2, pointsJeuGagnes: 86, pointsJeuPerdus: 54, isOurTeam: false },
    { rang: 4, equipe: 'SESSENHEIM FC 1', pointsResultat: 21, joues: 7, gagnes: 4, nuls: 0, perdus: 3, pointsJeuGagnes: 64, pointsJeuPerdus: 76, isOurTeam: false },
    { rang: 5, equipe: 'MARMOUTIER ST ETIENNE 1', pointsResultat: 20, joues: 7, gagnes: 3, nuls: 0, perdus: 4, pointsJeuGagnes: 67, pointsJeuPerdus: 73, isOurTeam: false },
    { rang: 6, equipe: 'BEINHEIM CTT 1', pointsResultat: 19, joues: 7, gagnes: 2, nuls: 0, perdus: 5, pointsJeuGagnes: 62, pointsJeuPerdus: 78, isOurTeam: false },
    { rang: 7, equipe: 'ALSATIA UNITAS SCHILTIGHEIM 1', pointsResultat: 14, joues: 7, gagnes: 1, nuls: 0, perdus: 6, pointsJeuGagnes: 44, pointsJeuPerdus: 96, isOurTeam: true },
    { rang: 8, equipe: 'BARR TT 1', pointsResultat: 12, joues: 7, gagnes: 0, nuls: 0, perdus: 7, pointsJeuGagnes: 45, pointsJeuPerdus: 95, isOurTeam: false }
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
