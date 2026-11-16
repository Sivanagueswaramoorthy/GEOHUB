import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthState {
  final UserModel? user;
  final String? token;
  final bool isLoading;
  final String? errorMessage;

  const AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.errorMessage,
  });

  bool get isAuthenticated => user != null && token != null;

  AuthState copyWith({
    UserModel? user,
    String? token,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    Future.microtask(() => checkAuthStatus());
    return const AuthState();
  }

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await ApiClient.storage.read(key: ApiConstants.tokenKey);
      if (token == null || token.isEmpty) {
        state = const AuthState(isLoading: false);
        return;
      }

      final response = await ApiClient.dio.get(ApiConstants.profile);
      if (response.statusCode == 200) {
        final user = UserModel.fromJson(response.data);
        state = AuthState(user: user, token: token, isLoading: false);
      } else {
        await ApiClient.storage.delete(key: ApiConstants.tokenKey);
        state = const AuthState(isLoading: false);
      }
    } catch (_) {
      final cachedUserStr = await ApiClient.storage.read(key: ApiConstants.userKey);
      final token = await ApiClient.storage.read(key: ApiConstants.tokenKey);
      if (cachedUserStr != null && token != null) {
        try {
          final user = UserModel.fromJson(jsonDecode(cachedUserStr));
          state = AuthState(user: user, token: token, isLoading: false);
          return;
        } catch (_) {}
      }
      state = const AuthState(isLoading: false);
    }
  }

  Future<bool> login(String identifier, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await ApiClient.dio.post(
        ApiConstants.login,
        data: {
          'identifier': identifier.trim(),
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final token = response.data['access_token']?.toString() ?? '';
        await ApiClient.storage.write(key: ApiConstants.tokenKey, value: token);

        final profileResp = await ApiClient.dio.get(ApiConstants.profile);
        final user = UserModel.fromJson(profileResp.data);

        await ApiClient.storage.write(
          key: ApiConstants.userKey,
          value: jsonEncode(user.toJson()),
        );

        state = AuthState(user: user, token: token, isLoading: false);
        return true;
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Invalid credentials.',
      );
      return false;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Connection error. Please check your network.';
      state = state.copyWith(
        isLoading: false,
        errorMessage: detail.toString(),
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Authentication failed: $e',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await ApiClient.storage.delete(key: ApiConstants.tokenKey);
    await ApiClient.storage.delete(key: ApiConstants.userKey);
    state = const AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
