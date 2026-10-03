import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../models/notification_model.dart';
import '../services/fcm_service.dart';

final fcmServiceProvider = Provider<FcmService>((ref) {
  return FcmService();
});

// Stream in-app notifications for current user
final notificationsStreamProvider =
    StreamProvider<List<NotificationModel>>((ref) {
  final user = ref.watch(currentUserProfileProvider).value;
  if (user == null) return Stream.value([]);

  final firestore = ref.watch(firestoreProvider);

  // In-app notifications directed to this user or team
  return firestore
      .collection(AppConstants.colNotifications)
      .snapshots()
      .map((snapshot) {
    final list = snapshot.docs
        .map((d) => NotificationModel.fromFirestore(d))
        .where((n) =>
            n.recipientUserId == null ||
            n.recipientUserId == user.uid ||
            n.topic == 'team_${user.team?.toLowerCase()}' ||
            n.topic == 'all_members')
        .toList();

    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  });
});
