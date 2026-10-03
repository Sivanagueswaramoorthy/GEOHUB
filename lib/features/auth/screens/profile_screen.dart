import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/role_badge.dart';
import '../../../widgets/status_chip.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isRefreshing = false;

  Future<void> _handleRefreshClaims() async {
    setState(() => _isRefreshing = true);
    try {
      await ref.read(authControllerProvider.notifier).refreshToken();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile credentials and claims refreshed!')),
        );
      }
    } finally {
      if (mounted) setState(() => _isRefreshing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(currentUserProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      drawer: userAsync.value != null ? AppDrawer(user: userAsync.value) : null,
      body: userAsync.when(
        data: (user) {
          if (user == null) {
            return const Center(child: Text('User profile not available'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 12),
                CircleAvatar(
                  radius: 46,
                  backgroundColor: Theme.of(context).primaryColor,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user.name,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 12),
                RoleBadge(role: user.role, isVolunteer: user.isVolunteer),
                const SizedBox(height: 24),

                // Details Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildRow('Account Status', StatusChip(status: user.status)),
                        const Divider(),
                        _buildRow('Assigned Team', Text(user.team ?? 'Not Assigned', style: const TextStyle(fontWeight: FontWeight.w600))),
                        const Divider(),
                        _buildRow('Team Role', Text(user.teamRole ?? 'None', style: const TextStyle(fontWeight: FontWeight.w600))),
                        const Divider(),
                        _buildRow(
                          'Volunteer Status',
                          Text(
                            user.isVolunteer ? 'Active Volunteer' : 'Regular Member',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: user.isVolunteer ? const Color(0xFF16A34A) : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                if (user.team == null || user.team!.isEmpty) ...[
                  CustomButton(
                    label: 'Request to Join a Team',
                    icon: Icons.group_add_outlined,
                    onPressed: () => context.push('/teams/join-request'),
                  ),
                  const SizedBox(height: 12),
                ],

                CustomButton(
                  label: 'Force Refresh Permissions / Roles',
                  icon: Icons.sync,
                  variant: ButtonVariant.outlined,
                  isLoading: _isRefreshing,
                  onPressed: _handleRefreshClaims,
                ),
                const SizedBox(height: 12),

                CustomButton(
                  label: 'Sign Out',
                  variant: ButtonVariant.text,
                  color: Colors.red,
                  onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading profile: $e')),
      ),
    );
  }

  Widget _buildRow(String label, Widget trailing) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF64748B))),
          trailing,
        ],
      ),
    );
  }
}
