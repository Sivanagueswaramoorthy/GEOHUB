import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_providers.dart';
import '../models/join_request_model.dart';
import '../models/team_model.dart';

// Stream all teams
final teamsStreamProvider = StreamProvider<List<TeamModel>>((ref) {
  final firestore = ref.watch(firestoreProvider);
  return firestore.collection(AppConstants.colTeams).snapshots().map((snapshot) {
    return snapshot.docs.map((doc) => TeamModel.fromFirestore(doc)).toList();
  });
});

// Stream specific team
final teamDetailProvider =
    StreamProvider.family<TeamModel?, String>((ref, teamId) {
  final firestore = ref.watch(firestoreProvider);
  return firestore
      .collection(AppConstants.colTeams)
      .doc(teamId)
      .snapshots()
      .map((doc) => doc.exists ? TeamModel.fromFirestore(doc) : null);
});

// Stream members belonging to a team
final teamMembersStreamProvider =
    StreamProvider.family<List<UserModel>, String>((ref, teamName) {
  final firestore = ref.watch(firestoreProvider);
  return firestore
      .collection(AppConstants.colUsers)
      .where('team', isEqualTo: teamName)
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => UserModel.fromFirestore(doc)).toList();
  });
});

// Stream join requests
final pendingJoinRequestsProvider =
    StreamProvider.family<List<JoinRequestModel>, String?>((ref, teamId) {
  final firestore = ref.watch(firestoreProvider);
  Query<Map<String, dynamic>> query = firestore
      .collection(AppConstants.colJoinRequests)
      .where('status', isEqualTo: 'pending');

  if (teamId != null && teamId.isNotEmpty) {
    query = query.where('teamId', isEqualTo: teamId);
  }

  return query.snapshots().map((snapshot) {
    return snapshot.docs
        .map((doc) => JoinRequestModel.fromFirestore(doc))
        .toList();
  });
});

// Team Actions Controller
final teamActionsControllerProvider = Provider((ref) {
  return TeamActionsController(
    firestore: ref.watch(firestoreProvider),
    functions: ref.watch(functionsProvider),
    ref: ref,
  );
});

class TeamActionsController {
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;
  final Ref _ref;

  TeamActionsController({
    required FirebaseFirestore firestore,
    required FirebaseFunctions functions,
    required Ref ref,
  })  : _firestore = firestore,
        _functions = functions,
        _ref = ref;

  Future<void> submitJoinRequest({
    required String teamId,
    required String? requestedRole,
  }) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final docRef = _firestore.collection(AppConstants.colJoinRequests).doc();
    final req = JoinRequestModel(
      id: docRef.id,
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      teamId: teamId,
      status: 'pending',
      requestedRole: requestedRole,
      createdAt: DateTime.now(),
    );

    await docRef.set(req.toMap());
  }

  Future<void> approveJoinRequest({
    required String requestId,
    required String teamRole,
  }) async {
    // Call Cloud Function for secure role claims & Firestore update
    final callable = _functions.httpsCallable(AppConstants.fnApproveJoinRequest);
    await callable.call({
      'requestId': requestId,
      'teamRole': teamRole,
    });
  }

  Future<void> rejectJoinRequest({
    required String requestId,
  }) async {
    final user = _ref.read(currentUserProfileProvider).value;
    await _firestore
        .collection(AppConstants.colJoinRequests)
        .doc(requestId)
        .update({
      'status': 'rejected',
      'reviewedBy': user?.uid,
    });
  }

  Future<void> assignTeamAdmin({
    required String userId,
    required String team,
  }) async {
    final callable = _functions.httpsCallable(AppConstants.fnAssignTeamAdmin);
    await callable.call({
      'userId': userId,
      'team': team,
    });
  }

  Future<void> seedDefaultTeamsIfEmpty() async {
    final snapshot = await _firestore.collection(AppConstants.colTeams).limit(1).get();
    if (snapshot.docs.isEmpty) {
      final batch = _firestore.batch();
      for (final teamName in AppConstants.teams) {
        final docRef = _firestore.collection(AppConstants.colTeams).doc(teamName);
        batch.set(docRef, {
          'id': teamName,
          'name': teamName,
          'description': 'Official $teamName Team for GeoHub operations.',
          'adminUserIds': [],
          'memberUserIds': [],
        });
      }
      await batch.commit();
    }
  }
}
