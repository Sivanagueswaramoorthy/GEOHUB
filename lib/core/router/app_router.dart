import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/pending_approval_screen.dart';
import '../../features/auth/screens/profile_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/dashboard/screens/super_admin_dashboard_screen.dart';
import '../../features/events/screens/event_detail_screen.dart';
import '../../features/events/screens/event_form_screen.dart';
import '../../features/events/screens/events_list_screen.dart';
import '../../features/gallery/screens/gallery_screen.dart';
import '../../features/gallery/screens/upload_document_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/qr_attendance/screens/my_qr_screen.dart';
import '../../features/qr_attendance/screens/qr_scanner_screen.dart';
import '../../features/tasks/screens/task_detail_screen.dart';
import '../../features/tasks/screens/task_form_screen.dart';
import '../../features/tasks/screens/tasks_list_screen.dart';
import '../../features/teams/screens/join_request_screen.dart';
import '../../features/teams/screens/team_detail_screen.dart';
import '../../features/teams/screens/teams_list_screen.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';
import '../providers/auth_providers.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateChangesProvider);
  final userProfileState = ref.watch(currentUserProfileProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (BuildContext context, GoRouterState state) {
      final isAuthLoading = authState.isLoading || userProfileState.isLoading;
      if (isAuthLoading) return null;

      final isUserLoggedIn = authState.value != null;
      final user = userProfileState.value;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup';
      final isPendingRoute = state.matchedLocation == '/pending-approval';

      // 1. Unauthenticated users restricted to login / signup
      if (!isUserLoggedIn) {
        return isAuthRoute ? null : '/login';
      }

      // 2. Authenticated user but pending approval
      if (user != null && user.isPending) {
        return isPendingRoute ? null : '/pending-approval';
      }

      // 3. Authenticated active user trying to visit auth or pending screen
      if (user != null && user.isActive) {
        if (isAuthRoute || isPendingRoute) {
          if (user.isAdmin) {
            return '/dashboard';
          } else if (user.isTeamAdmin) {
            return '/teams';
          } else {
            return '/events';
          }
        }
      }

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/pending-approval',
        builder: (context, state) => const PendingApprovalScreen(),
      ),

      // Dashboard
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const SuperAdminDashboardScreen(),
      ),

      // Events
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsListScreen(),
        routes: [
          GoRoute(
            path: 'create',
            builder: (context, state) => const EventFormScreen(),
          ),
          GoRoute(
            path: ':id',
            builder: (context, state) =>
                EventDetailScreen(eventId: state.pathParameters['id']!),
            routes: [
              GoRoute(
                path: 'edit',
                builder: (context, state) =>
                    EventFormScreen(eventId: state.pathParameters['id']),
              ),
            ],
          ),
        ],
      ),

      // Teams
      GoRoute(
        path: '/teams',
        builder: (context, state) => const TeamsListScreen(),
        routes: [
          GoRoute(
            path: 'join-request',
            builder: (context, state) => const JoinRequestScreen(),
          ),
          GoRoute(
            path: ':teamName',
            builder: (context, state) => TeamDetailScreen(
              teamName: state.pathParameters['teamName']!,
            ),
          ),
        ],
      ),

      // Tasks
      GoRoute(
        path: '/tasks',
        builder: (context, state) => const TasksListScreen(),
        routes: [
          GoRoute(
            path: 'create',
            builder: (context, state) => const TaskFormScreen(),
          ),
          GoRoute(
            path: ':id',
            builder: (context, state) =>
                TaskDetailScreen(taskId: state.pathParameters['id']!),
          ),
        ],
      ),

      // QR Attendance
      GoRoute(
        path: '/qr/my-qr/:eventId',
        builder: (context, state) =>
            MyQrScreen(eventId: state.pathParameters['eventId']!),
      ),
      GoRoute(
        path: '/qr/scan/:eventId',
        builder: (context, state) =>
            QrScannerScreen(eventId: state.pathParameters['eventId']),
      ),
      GoRoute(
        path: '/qr/scanner',
        builder: (context, state) => const QrScannerScreen(),
      ),

      // Gallery & Documents
      GoRoute(
        path: '/gallery',
        builder: (context, state) => const GalleryScreen(),
        routes: [
          GoRoute(
            path: 'upload',
            builder: (context, state) => const UploadDocumentScreen(),
          ),
        ],
      ),

      // Notifications
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),

      // Profile
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});
