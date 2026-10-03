import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';

// Firebase Service Instances
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

final firestoreProvider = Provider<FirebaseFirestore>((ref) {
  return FirebaseFirestore.instance;
});

final functionsProvider = Provider<FirebaseFunctions>((ref) {
  return FirebaseFunctions.instance;
});

final storageProvider = Provider<FirebaseStorage>((ref) {
  return FirebaseStorage.instance;
});

// Auth State Changes Stream
final authStateChangesProvider = StreamProvider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
});

// Current User Profile Stream combining Firestore Document and Custom Claims
final currentUserProfileProvider = StreamProvider<UserModel?>((ref) async* {
  final authUser = ref.watch(authStateChangesProvider).value;
  if (authUser == null) {
    yield null;
    return;
  }

  final firestore = ref.watch(firestoreProvider);
  final docStream = firestore
      .collection(AppConstants.colUsers)
      .doc(authUser.uid)
      .snapshots();

  await for (final snapshot in docStream) {
    if (!snapshot.exists || snapshot.data() == null) {
      // Return basic user model if doc is just being created
      yield UserModel(
        uid: authUser.uid,
        email: authUser.email ?? '',
        name: authUser.displayName ?? 'Student',
        role: AppConstants.roleMember,
        status: AppConstants.statusPending,
      );
      continue;
    }

    var user = UserModel.fromFirestore(snapshot);

    // Sync custom claims if available
    try {
      final tokenResult = await authUser.getIdTokenResult();
      final claims = tokenResult.claims;
      if (claims != null) {
        final claimRole = claims['role'] as String?;
        final claimTeam = claims['team'] as String?;
        final claimVolunteer = claims['isVolunteer'] as bool?;

        if (claimRole != null || claimTeam != null || claimVolunteer != null) {
          user = user.copyWith(
            role: claimRole ?? user.role,
            team: claimTeam ?? user.team,
            isVolunteer: claimVolunteer ?? user.isVolunteer,
          );
        }
      }
    } catch (_) {
      // Continue with Firestore data if token result fails in offline mode
    }

    yield user;
  }
});

// Auth Controller
final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<void>>((ref) {
  return AuthController(
    auth: ref.watch(firebaseAuthProvider),
    firestore: ref.watch(firestoreProvider),
    ref: ref,
  );
});

class AuthController extends StateNotifier<AsyncValue<void>> {
  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final Ref _ref;

  AuthController({
    required FirebaseAuth auth,
    required FirebaseFirestore firestore,
    required Ref ref,
  })  : _auth = auth,
        _firestore = firestore,
        _ref = ref,
        super(const AsyncValue.data(null));

  Future<void> signIn({required String email, required String password}) async {
    state = const AsyncValue.loading();
    try {
      await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password.trim(),
      );
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      final trimmedEmail = email.trim().toLowerCase();

      // College Domain Validation
      if (!trimmedEmail.endsWith(AppConstants.allowedEmailDomain)) {
        throw Exception(
          'Registration is restricted to college email addresses ending with ${AppConstants.allowedEmailDomain}',
        );
      }

      final credential = await _auth.createUserWithEmailAndPassword(
        email: trimmedEmail,
        password: password.trim(),
      );

      final user = credential.user;
      if (user != null) {
        await user.updateDisplayName(name.trim());

        // Create Firestore user document with pending status
        final userModel = UserModel(
          uid: user.uid,
          email: trimmedEmail,
          name: name.trim(),
          role: AppConstants.roleMember,
          status: AppConstants.statusPending,
          isVolunteer: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await _firestore
            .collection(AppConstants.colUsers)
            .doc(user.uid)
            .set(userModel.toMap());
      }

      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> signOut() async {
    state = const AsyncValue.loading();
    try {
      await _auth.signOut();
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> refreshToken() async {
    final user = _auth.currentUser;
    if (user != null) {
      await user.getIdToken(true);
      _ref.invalidate(currentUserProfileProvider);
    }
  }
}
