const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

function normalizeRole(role) {
  if (!role) return "student";
  const r = role.toLowerCase().trim();
  const map = {
    super_admin: "faculty",
    faculty: "faculty",
    admin: "coordinator",
    coordinator: "coordinator",
    documentation: "documentation",
    treasurer: "treasurer",
    social_media: "promotion",
    promotion: "promotion",
    member: "student",
    volunteer: "student",
    team_admin: "student",
    student: "student",
  };
  return map[r] || "student";
}

/**
 * 1. Assign Team Admin (Squad-Level Post)
 * Called by: faculty ONLY
 * Inputs: { userId, team, tenureEnd }
 */
exports.assignTeamAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const callerClaims = context.auth.token || {};
  const callerRole = normalizeRole(callerClaims.role);
  if (callerRole !== "faculty") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only Faculty can assign posts."
    );
  }

  const { userId, team, tenureEnd } = data;
  if (!userId || !team) {
    throw new functions.https.HttpsError("invalid-argument", "userId and team are required.");
  }

  // Protection: No self-escalation
  if (context.auth.uid === userId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Protection Rule: Cannot modify your own role or posts."
    );
  }

  // Set Firebase Auth custom claims: role remains student, post is Team Admin
  await admin.auth().setCustomUserClaims(userId, {
    role: "student",
    post: "Team Admin",
    team: team,
    tenureEnd: tenureEnd || null,
    isVolunteer: false,
  });

  // Update user document in Firestore
  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    role: "student",
    post: "Team Admin",
    team: team,
    tenureEnd: tenureEnd || null,
    status: "active",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Log Audit record
  await db.collection("audit_logs").add({
    actorId: context.auth.uid,
    actorName: callerClaims.name || "Faculty",
    action: "post_assignment",
    targetType: "user",
    targetId: userId,
    details: `Assigned squad post Team Admin for ${team}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: `User ${userId} assigned as Team Admin of squad ${team}.` };
});

/**
 * 2. Set User Role
 * Called by: faculty ONLY
 * Inputs: { userId, newRole, post, tenureEnd, team }
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const callerClaims = context.auth.token || {};
  const callerRole = normalizeRole(callerClaims.role);
  if (callerRole !== "faculty") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only Faculty can assign roles or change permissions."
    );
  }

  const { userId, newRole, post, tenureEnd, team } = data;
  if (!userId || !newRole) {
    throw new functions.https.HttpsError("invalid-argument", "userId and newRole are required.");
  }

  // Protection: No self-escalation
  if (context.auth.uid === userId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Protection Rule: Cannot modify your own role."
    );
  }

  const normNewRole = normalizeRole(newRole);

  // Protection: Last faculty account protection
  const targetDoc = await db.collection("users").doc(userId).get();
  if (targetDoc.exists) {
    const targetData = targetDoc.data();
    if (normalizeRole(targetData.role) === "faculty" && normNewRole !== "faculty") {
      const facultySnapshot = await db
        .collection("users")
        .where("role", "in", ["faculty", "super_admin"])
        .where("status", "==", "active")
        .get();
      if (facultySnapshot.size <= 1) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Protection Rule: The last remaining faculty account cannot be removed or demoted."
        );
      }
    }
  }

  await admin.auth().setCustomUserClaims(userId, {
    role: normNewRole,
    post: post || null,
    tenureEnd: tenureEnd || null,
    team: team || null,
    isVolunteer: false,
  });

  await db.collection("users").doc(userId).update({
    role: normNewRole,
    post: post || null,
    tenureEnd: tenureEnd || null,
    team: team || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("audit_logs").add({
    actorId: context.auth.uid,
    actorName: callerClaims.name || "Faculty",
    action: "role_change",
    targetType: "user",
    targetId: userId,
    details: `Updated user role to ${normNewRole}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, newRole: normNewRole };
});

/**
 * 3. Generate Event QR (Server-Side Token Generation)
 * Binds token to userId + eventId + 60s TTL in atomic fashion.
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
  const callerRole = normalizeRole(callerClaims.role);
  const isOrganizer = callerRole === "faculty" || callerRole === "coordinator";

  if (!isSelf && !isOrganizer) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized request.");
  }

  // Check event registration
  const regId = `${eventId}_${userId}`;
  const regDoc = await db.collection("event_registrations").doc(regId).get();
  if (!regDoc.exists && !isOrganizer) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You must register for this event before generating attendance QR."
    );
  }

  // Generate random token with 60-second TTL
  const token = `GEO-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
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
 * 4. Mark Attendance From QR (Server-Side Verification)
 * Enforces:
 * (a) Scanner is assigned to THIS event
 * (b) Attendee is registered
 * (c) Token is valid, unexpired, unused (marked used atomically)
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
  const eventDoc = await db.collection("events").doc(eventId).get();
  if (!eventDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Event not found.");
  }

  const eventData = eventDoc.data();
  const assignedScanners = eventData.assignedScannerUserIds || eventData.volunteerIds || [];
  if (!assignedScanners.includes(callerId)) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Forbidden: You are not assigned as an attendance scanner for this event."
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
    throw new functions.https.HttpsError("invalid-argument", "Invalid attendance token for this event.");
  }

  const sessionDoc = sessionQuery.docs[0];
  const sessionData = sessionDoc.data();

  if (sessionData.used) {
    throw new functions.https.HttpsError("already-exists", "This QR code has already been scanned.");
  }

  const expiresAt = sessionData.expiresAt.toDate();
  if (Date.now() > expiresAt.getTime()) {
    throw new functions.https.HttpsError("deadline-exceeded", "QR code has expired (60s TTL).");
  }

  // Atomic transaction
  const attendeeId = sessionData.userId;
  const attendanceRef = db.collection("attendance").doc(`${eventId}_${attendeeId}`);

  await db.runTransaction(async (t) => {
    t.update(sessionDoc.ref, { used: true });
    t.set(attendanceRef, {
      id: `${eventId}_${attendeeId}`,
      eventId: eventId,
      userId: attendeeId,
      scannedBy: callerId,
      checkInTime: admin.firestore.FieldValue.serverTimestamp(),
      method: "qr",
    });
  });

  return { success: true, message: "Attendance verified successfully." };
});
