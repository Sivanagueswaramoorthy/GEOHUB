import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/role_badge.dart';
import '../providers/team_providers.dart';
import 'pending_join_requests_dialog.dart';

class TeamDetailScreen extends ConsumerWidget {
  final String teamName;

  const TeamDetailScreen({super.key, required this.teamName});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProfileProvider).value;
    final membersAsync = ref.watch(teamMembersStreamProvider(teamName));
    final pendingRequestsAsync = ref.watch(pendingJoinRequestsProvider(teamName));

    final isTeamAdminForThisTeam =
        (user?.role == AppConstants.roleTeamAdmin && user?.team == teamName) ||
        (user?.isAdmin ?? false);

    return Scaffold(
      appBar: AppBar(
        title: Text(teamName),
        actions: [
          if (isTeamAdminForThisTeam)
            Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.person_add_alt_1_outlined),
                  tooltip: 'Review Join Requests',
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => PendingJoinRequestsDialog(teamName: teamName),
                    );
                  },
                ),
                pendingRequestsAsync.maybeWhen(
                  data: (requests) {
                    if (requests.isEmpty) return const SizedBox.shrink();
                    return Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${requests.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  },
                  orElse: () => const SizedBox.shrink(),
                ),
              ],
            ),
        ],
      ),
      body: membersAsync.when(
        data: (members) {
          if (members.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.group_off_outlined,
              title: 'No Members Yet',
              description: 'There are currently no active members assigned to the $teamName team.',
              actionLabel: isTeamAdminForThisTeam ? 'Check Join Requests' : null,
              onAction: isTeamAdminForThisTeam
                  ? () {
                      showDialog(
                        context: context,
                        builder: (_) => PendingJoinRequestsDialog(teamName: teamName),
                      );
                    }
                  : null,
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: members.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final member = members[index];
              final isTeamLead = member.role == AppConstants.roleTeamAdmin;

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    child: Text(
                      member.name.isNotEmpty ? member.name[0].toUpperCase() : 'M',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                  ),
                  title: Row(
                    children: [
                      Text(
                        member.name,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 8),
                      RoleBadge(role: member.role, isVolunteer: member.isVolunteer),
                    ],
                  ),
                  subtitle: Text(
                    '${member.teamRole ?? "Member"} • ${member.email}',
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                  trailing: (user?.isAdmin ?? false) && !isTeamLead
                      ? PopupMenuButton<String>(
                          onSelected: (action) async {
                            if (action == 'make_team_admin') {
                              try {
                                await ref
                                    .read(teamActionsControllerProvider)
                                    .assignTeamAdmin(
                                      userId: member.uid,
                                      team: teamName,
                                    );
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Made ${member.name} a Team Admin')),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
                                  );
                                }
                              }
                            }
                          },
                          itemBuilder: (_) => [
                            const PopupMenuItem(
                              value: 'make_team_admin',
                              child: Text('Promote to Team Admin'),
                            ),
                          ],
                        )
                      : null,
                ),
              );
            },
          );
        },
        loading: () => const LoadingView(message: 'Loading team members...'),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
