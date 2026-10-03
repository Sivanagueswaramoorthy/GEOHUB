import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../../../core/models/user_model.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  if (kDebugMode) {
    print('FCM background message received: ${message.messageId}');
  }
}

class FcmService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (kDebugMode) {
        print('User notification permission status: ${settings.authorizationStatus}');
      }

      // Handle foreground notifications
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('FCM Foreground: ${message.notification?.title} - ${message.notification?.body}');
        }
      });
    } catch (e) {
      if (kDebugMode) {
        print('FCM init error: $e');
      }
    }
  }

  Future<void> syncUserTopics(UserModel user) async {
    try {
      // Subscribe to general announcements
      await _messaging.subscribeToTopic('all_members');

      // Subscribe to Role topic
      await _messaging.subscribeToTopic('role_${user.role}');

      // Subscribe to Team topic
      if (user.team != null && user.team!.isNotEmpty) {
        final cleanTeam = user.team!.toLowerCase().replaceAll(' ', '_');
        await _messaging.subscribeToTopic('team_$cleanTeam');
      }

      // Subscribe to Volunteer topic
      if (user.isVolunteer) {
        await _messaging.subscribeToTopic('volunteers');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error syncing FCM topics: $e');
      }
    }
  }
}
