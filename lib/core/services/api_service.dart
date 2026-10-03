import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class ApiService {
  // Set to true for production cloud deployment (Android APK + Web)
  // Set to false when testing against local development server
  static bool useCloudBackend = false;

  // Replace with your actual Render / Cloud URL after deploying:
  static String productionCloudUrl = 'https://geohub.onrender.com/api';

  static String get baseUrl {
    if (useCloudBackend) {
      return productionCloudUrl;
    }
    return defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2:8000/api'
        : 'http://127.0.0.1:8000/api';
  }

  static String? _authToken;

  static void setAuthToken(String? token) {
    _authToken = token;
  }

  static Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // --- AUTHENTICATION ---
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception(data['detail'] ?? 'Registration failed');
    }

    _authToken = data['access_token'];
    return data;
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception(data['detail'] ?? 'Login failed');
    }

    _authToken = data['access_token'];
    return data;
  }

  static Future<UserModel?> getMe() async {
    if (_authToken == null) return null;

    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return UserModel(
        uid: data['id'],
        email: data['email'],
        name: data['name'],
        role: data['role'],
        team: data['team'],
        teamRole: data['team_role'],
        isVolunteer: data['is_volunteer'] ?? false,
        status: data['status'],
      );
    }
    return null;
  }

  // --- SMART QR ATTENDANCE ---
  static Future<String> generateEventQr(String eventId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/qr/generate'),
      headers: _headers,
      body: jsonEncode({'event_id': eventId}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception(data['detail'] ?? 'Failed to generate QR token');
    }
    return data['token'];
  }

  static Future<Map<String, dynamic>> verifyAttendanceQr({
    required String eventId,
    required String token,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/qr/verify'),
      headers: _headers,
      body: jsonEncode({
        'event_id': eventId,
        'token': token,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception(data['detail'] ?? 'Scan verification failed');
    }
    return data;
  }

  // --- EVENTS ---
  static Future<List<dynamic>> getEvents() async {
    final response = await http.get(
      Uri.parse('$baseUrl/events'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load events');
  }

  static Future<void> registerForEvent(String eventId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/events/$eventId/register'),
      headers: _headers,
    );
    if (response.statusCode >= 400) {
      final data = jsonDecode(response.body);
      throw Exception(data['detail'] ?? 'Registration failed');
    }
  }

  // --- TEAMS ---
  static Future<List<dynamic>> getTeams() async {
    final response = await http.get(
      Uri.parse('$baseUrl/teams'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load teams');
  }

  // --- DASHBOARD ---
  static Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard/stats'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load stats');
  }
}
