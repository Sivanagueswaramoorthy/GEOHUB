const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Assign Team Admin
 * Called by: super_admin or admin
 * Inputs: { userId, team }
 */
exports.assignTeamAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const callerClaims = context.auth.token || {};
  const callerRole = callerClaims.role;
  const isSuperAdmin = callerRole === "super_admin";
  const isAdmin = callerRole === "admin" || isSuperAdmin;

  if (!isAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only club admins or super admins can assign team admins."
    );
  }

  const { userId, team } = data;
  if (!userId || !team) {
    throw new functions.https.HttpsError("invalid-argument", "userId and team are required.");
  }

  // Set Firebase Auth custom claims
  await admin.auth().setCustomUserClaims(userId, {
    role: "team_admin",
    team: team,
    isVolunteer: false,
  });

  // Update user document in Firestore
  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    role: "team_admin",
    team: team,
    status: "active",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update team document admin list & member list
  const teamRef = db.collection("teams").doc(team);
  await teamRef.set(
    {
      adminUserIds: admin.firestore.FieldValue.arrayUnion(userId),
      memberUserIds: admin.firestore.FieldValue.arrayUnion(userId),
    },
    { merge: true }
  );

  return { success: true, message: `User ${userId} assigned as admin of team ${team}.` };
});

/**
 * 2. Set User Role
 * Called by: super_admin
 * Inputs: { userId, newRole, team, isVolunteer }
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const callerClaims = context.auth.token || {};
  if (callerClaims.role !== "super_admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only the Super Admin can set arbitrary user roles."
    );
  }

  const { userId, newRole, team, isVolunteer } = data;
  if (!userId || !newRole) {
    throw new functions.https.HttpsError("invalid-argument", "userId and newRole are required.");
  }

  await admin.auth().setCustomUserClaims(userId, {
    role: newRole,
    team: team || null,
    isVolunteer: isVolunteer === true,
  });

  await db.collection("users").doc(userId).update({
    role: newRole,
    team: team || null,
    isVolunteer: isVolunteer === true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * 3. Approve Join Request
 * Called by: team_admin of this team or admin/super_admin
 * Inputs: { requestId, teamRole }
 */
exports.approveJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { requestId, teamRole } = data;
  if (!requestId || !teamRole) {
    throw new functions.https.HttpsError("invalid-argument", "requestId and teamRole required.");
  }

  const reqDoc = await db.collection("join_requests").doc(requestId).get();
  if (!reqDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Join request not found.");
  }

  const reqData = reqDoc.data();
  const callerClaims = context.auth.token || {};
  const callerRole = callerClaims.role;
  const isSuperOrAdmin = callerRole === "super_admin" || callerRole === "admin";
  const isAuthorizedTeamAdmin =
    callerRole === "team_admin" && callerClaims.team === reqData.teamId;

  if (!isSuperOrAdmin && !isAuthorizedTeamAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Not authorized to approve requests for this team."
    );
  }

  // Update target user document
  const targetUserId = reqData.userId;
  await db.collection("users").doc(targetUserId).update({
    team: reqData.teamId,
    teamRole: teamRole,
    status: "active",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Set Auth Custom claims
  await admin.auth().setCustomUserClaims(targetUserId, {
    role: "member",
    team: reqData.teamId,
    isVolunteer: false,
  });

  // Add user to team member list
  await db.collection("teams").doc(reqData.teamId).set(
    {
      memberUserIds: admin.firestore.FieldValue.arrayUnion(targetUserId),
    },
    { merge: true }
  );

  // Update join request record
  await reqDoc.ref.update({
    status: "approved",
    assignedRole: teamRole,
    reviewedBy: context.auth.uid,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send Notification
  await db.collection("notifications").add({
    title: "Join Request Approved!",
    body: `Welcome to the ${reqData.teamId} team as a ${teamRole}.`,
    type: "join_request",
    recipientUserId: targetUserId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false,
  });

  return { success: true, message: `Approved ${targetUserId} as ${teamRole}.` };
});

/**
 * 4. Generate Event QR
 * Inputs: { eventId, userId }
 */
exports.generateEventQr = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { eventId, userId } = data;
  if (!eventId || !userId) {
    throw new functions.https.HttpsError("invalid-argument", "eventId and userId required.");
  }

  const isSelf = context.auth.uid === userId;
  const callerClaims = context.auth.token || {};
  const isAdmin = callerClaims.role === "admin" || callerClaims.role === "super_admin";

  if (!isSelf && !isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized request.");
  }

  // Check event registration
  const regId = `${eventId}_${userId}`;
  const regDoc = await db.collection("event_registrations").doc(regId).get();
  if (!regDoc.exists && !isAdmin) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You must register for this event before generating attendance QR."
    );
  }

  // Generate random token with 60 second TTL
  const token = `GEO-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 60 * 1000);

  const sessionRef = db.collection("qr_sessions").doc();
  await sessionRef.set({
    id: sessionRef.id,
    eventId: eventId,
    userId: userId,
    token: token,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    used: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    token: token,
    expiresAt: expiresAt.toISOString(),
  };
});

/**
 * 5. Mark Attendance From QR
 * Called by: volunteer or admin
 * Inputs: { eventId, token }
 */
exports.markAttendanceFromQr = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { eventId, token } = data;
  if (!eventId || !token) {
    throw new functions.https.HttpsError("invalid-argument", "eventId and token required.");
  }

  const callerId = context.auth.uid;
  const callerClaims = context.auth.token || {};
  const isSuperOrAdmin =
    callerClaims.role === "super_admin" || callerClaims.role === "admin";

  // Check volunteer assignment
  const eventDoc = await db.collection("events").doc(eventId).get();
  if (!eventDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Event not found.");
  }

  const eventData = eventDoc.data();
  const volunteerList = eventData.volunteerUserIds || [];
  const isAssignedVolunteer = volunteerList.includes(callerId);

  if (!isSuperOrAdmin && !isAssignedVolunteer) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You are not assigned as an attendance volunteer for this event."
    );
  }

  // Verify QR session
  const sessionQuery = await db
    .collection("qr_sessions")
    .where("eventId", "==", eventId)
    .where("token", "==", token)
    .limit(1)
    .get();

  if (sessionQuery.empty) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid attendance token for this event."
    );
  }

  const sessionDoc = sessionQuery.docs[0];
  const sessionData = sessionDoc.data();

  if (sessionData.used) {
    throw new functions.https.HttpsError(
      "already-exists",
      "This attendance QR code has already been scanned."
    );
  }

  const expiresAt = sessionData.expiresAt.toDate();
  if (Date.now() > expiresAt.getTime()) {
    throw new functions.https.HttpsError(
      "deadline-exceeded",
      "This QR code has expired. Please ask attendee to refresh."
    );
  }

  const studentUserId = sessionData.userId;

  // Mark session used
  await sessionDoc.ref.update({
    used: true,
    scannedAt: admin.firestore.FieldValue.serverTimestamp(),
    scannedBy: callerId,
  });

  // Get student details
  const studentDoc = await db.collection("users").doc(studentUserId).get();
  const studentName = studentDoc.exists ? studentDoc.data().name : "Student";

  // Record Attendance
  const attId = `${eventId}_${studentUserId}`;
  await db.collection("attendance").doc(attId).set({
    id: attId,
    eventId: eventId,
    userId: studentUserId,
    userName: studentName,
    scannedBy: callerId,
    checkInTime: admin.firestore.FieldValue.serverTimestamp(),
    method: "qr",
  });

  // Increment event attendance count
  await eventDoc.ref.update({
    attendanceCount: admin.firestore.FieldValue.increment(1),
  });

  return {
    success: true,
    userName: studentName,
    userId: studentUserId,
    checkInTime: new Date().toISOString(),
  };
});

/**
 * 6. FCM Notification Trigger on Task Created
 */
exports.onTaskCreatedOrUpdated = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(async (snap, context) => {
    const task = snap.data();
    const teamTopic = `team_${task.teamId.toLowerCase().replace(/ /g, "_")}`;

    const payload = {
      notification: {
        title: `New Task: ${task.title}`,
        body: `Assigned to ${task.teamId}. Deadline: ${task.deadline ? new Date(task.deadline.toDate()).toLocaleDateString() : "Soon"}`,
      },
      topic: teamTopic,
    };

    try {
      await admin.messaging().send(payload);
    } catch (e) {
      console.log("FCM Task send error: ", e);
    }
  });

/**
 * 7. FCM Notification Trigger on Event Status Change
 */
exports.onEventStatusChanged = functions.firestore
  .document("events/{eventId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status && after.status === "live") {
      const payload = {
        notification: {
          title: `Event is Now Live!`,
          body: `${after.title} is now taking place at ${after.venue}.`,
        },
        topic: "all_members",
      };
      try {
        await admin.messaging().send(payload);
      } catch (e) {
        console.log("FCM Event status notification error: ", e);
      }
    }
  });
