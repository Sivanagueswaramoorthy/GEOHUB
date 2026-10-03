import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../providers/notification_providers.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifsAsync = ref.watch(notificationsStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications & Announcements'),
      ),
      body: notifsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.notifications_none_outlined,
              title: 'All Caught Up!',
              description: 'You have no new alerts or announcements at this time.',
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final notif = notifications[index];
              final timeFormatted = DateFormat('MMM d • h:mm a').format(notif.createdAt);

              IconData icon = Icons.notifications_active_outlined;
              Color iconColor = const Color(0xFF4F46E5);

              if (notif.type == 'task') {
                icon = Icons.task_alt_outlined;
                iconColor = const Color(0xFF10B981);
              } else if (notif.type == 'event') {
                icon = Icons.event_available_outlined;
                iconColor = const Color(0xFFF59E0B);
              } else if (notif.type == 'join_request') {
                icon = Icons.person_add_alt_outlined;
                iconColor = const Color(0xFF7C3AED);
              }

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: iconColor.withOpacity(0.12),
                    child: Icon(icon, color: iconColor, size: 20),
                  ),
                  title: Text(
                    notif.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(
                        notif.body,
                        style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        timeFormatted,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const LoadingView(message: 'Loading notifications...'),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
