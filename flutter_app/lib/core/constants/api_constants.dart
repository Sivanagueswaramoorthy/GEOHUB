import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // Configurable base URL
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api';
    }
    if (Platform.isAndroid) {
      // 10.0.2.2 routes to host localhost in Android Emulator
      // For physical device testing, change to host PC LAN IP (e.g. 10.10.118.212)
      return 'http://10.0.2.2:8000/api';
    }
    return 'http://127.0.0.1:8000/api';
  }

  // Auth endpoints
  static const String login = '/auth/login';
  static const String profile = '/auth/profile';
  static const String changePassword = '/auth/change-password';

  // Smart QR endpoints
  static const String myQrToken = '/qr/my-token';
  static const String scanQr = '/qr/scan';

  // Events endpoints
  static const String events = '/events/';
  static String eventRegister(String eventId) => '/events/$eventId/register';

  // Teams endpoints
  static const String teams = '/teams/';

  // Secure Storage Keys
  static const String tokenKey = 'geohub_jwt_access_token';
  static const String userKey = 'geohub_cached_user_json';
}
