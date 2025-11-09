
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.removeFriend = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const uid = context.auth.uid;
    const friendId = data.friendId;

    if (!friendId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "friendId" argument.');
    }

    try {
        const currentUserRef = db.collection("users").doc(uid);
        const friendUserRef = db.collection("users").doc(friendId);

        const batch = db.batch();
        
        // Remove friend from current user's list
        batch.update(currentUserRef, {
            friends: admin.firestore.FieldValue.arrayRemove(friendId)
        });

        // Remove current user from friend's list
        batch.update(friendUserRef, {
            friends: admin.firestore.FieldValue.arrayRemove(uid)
        });

        await batch.commit();

        console.log(`Successfully removed friendship between ${uid} and ${friendId}.`);
        return { success: true, message: "Friend removed successfully." };

    } catch (error) {
        console.error("Error removing friend:", error);
        // Throw a structured error for the client
        throw new functions.https.HttpsError('unknown', 'An error occurred while trying to remove the friend.', error);
    }
});
