import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../core/models/user_model.dart';
import '../core/providers/auth_providers.dart';
import 'role_badge.dart';

class AppDrawer extends ConsumerWidget {
  final UserModel? user;

  const AppDrawer({super.key, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final userRole = user?.role ?? AppConstants.roleMember;
    final isVolunteer = user?.isVolunteer ?? false;
    final isSuperAdmin = user?.isSuperAdmin ?? false;
    final isAdmin = user?.isAdmin ?? false;
    final isTeamAdmin = user?.isTeamAdmin ?? false;

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.tertiary,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (user?.name.isNotEmpty ?? false) ? user!.name[0].toUpperCase() : 'G',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
            accountName: Row(
              children: [
                Expanded(
                  child: Text(
                    user?.name ?? 'Student',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            accountEmail: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(user?.email ?? ''),
                const SizedBox(height: 6),
                RoleBadge(role: userRole, isVolunteer: isVolunteer),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // Dashboards (Super Admin & Admin)
                if (isAdmin)
                  ListTile(
                    leading: const Icon(Icons.dashboard_outlined),
                    title: const Text('Dashboard & Analytics'),
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/dashboard');
                    },
                  ),

                // Events
                ListTile(
                  leading: const Icon(Icons.event_outlined),
                  title: const Text('Events'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/events');
                  },
                ),

                // Teams
                ListTile(
                  leading: const Icon(Icons.groups_outlined),
                  title: Text(isTeamAdmin ? 'My Team' : 'Teams & Members'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/teams');
                  },
                ),

                // Tasks
                ListTile(
                  leading: const Icon(Icons.task_alt_outlined),
                  title: const Text('Tasks & Proofs'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/tasks');
                  },
                ),

                // Volunteer Scanner
                if (user?.canScanQr ?? false)
                  ListTile(
                    leading: const Icon(Icons.qr_code_scanner, color: Color(0xFF16A34A)),
                    title: const Text(
                      'Scan Attendance',
                      style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.bold),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/qr/scanner');
                    },
                  ),

                // Gallery & Documents
                ListTile(
                  leading: const Icon(Icons.photo_library_outlined),
                  title: const Text('Gallery & Documents'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/gallery');
                  },
                ),

                // Notifications
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/notifications');
                  },
                ),

                const Divider(),

                // Profile
                ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: const Text('My Profile'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/profile');
                  },
                ),
              ],
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () async {
              Navigator.pop(context);
              await ref.read(authControllerProvider.notifier).signOut();
            },
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
