import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../providers/team_providers.dart';

class TeamsListScreen extends ConsumerWidget {
  const TeamsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProfileProvider).value;
    final teamsAsync = ref.watch(teamsStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Club Teams'),
        actions: [
          if (user?.isAdmin ?? false)
            IconButton(
              icon: const Icon(Icons.auto_fix_high),
              tooltip: 'Seed Standard Teams',
              onPressed: () async {
                await ref.read(teamActionsControllerProvider).seedDefaultTeamsIfEmpty();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Standard club teams initialized!')),
                  );
                }
              },
            ),
        ],
      ),
      drawer: user != null ? AppDrawer(user: user) : null,
      floatingActionButton: (user != null && (user.team == null || user.team!.isEmpty))
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/teams/join-request'),
              icon: const Icon(Icons.add),
              label: const Text('Join Team'),
            )
          : null,
      body: teamsAsync.when(
        data: (teams) {
          if (teams.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.groups_outlined,
              title: 'No Teams Configured',
              description:
                  'Click the initialize button in the top bar to seed the standard club teams (Management, Promotion, Documentation, Entertainment).',
              actionLabel: 'Seed Default Teams',
              onAction: () => ref.read(teamActionsControllerProvider).seedDefaultTeamsIfEmpty(),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: teams.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final team = teams[index];
              final isUserInTeam = user?.team == team.name;

              return Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.12),
                    foregroundColor: Theme.of(context).primaryColor,
                    child: const Icon(Icons.people_outline),
                  ),
                  title: Row(
                    children: [
                      Text(
                        team.name,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      if (isUserInTeam) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'YOUR TEAM',
                            style: TextStyle(
                              color: Color(0xFF15803D),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 6.0),
                    child: Text(
                      team.description.isNotEmpty
                          ? team.description
                          : 'Club department team for student members.',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF94A3B8)),
                  onTap: () => context.push('/teams/${team.name}'),
                ),
              );
            },
          );
        },
        loading: () => const LoadingView(message: 'Loading club teams...'),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
