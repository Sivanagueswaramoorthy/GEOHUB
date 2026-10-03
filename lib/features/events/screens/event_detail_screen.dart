import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/status_chip.dart';
import '../models/event_model.dart';
import '../providers/event_providers.dart';

class EventDetailScreen extends ConsumerStatefulWidget {
  final String eventId;

  const EventDetailScreen({super.key, required this.eventId});

  @override
  ConsumerState<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends ConsumerState<EventDetailScreen> {
  bool _isRegistering = false;

  Future<void> _handleRegister() async {
    setState(() => _isRegistering = true);
    try {
      await ref
          .read(eventActionsControllerProvider)
          .registerForEvent(widget.eventId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registered successfully! Your attendance QR is ready.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isRegistering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final eventAsync = ref.watch(eventDetailProvider(widget.eventId));
    final isRegisteredAsync = ref.watch(isUserRegisteredProvider(widget.eventId));

    final isAdmin = user?.isAdmin ?? false;
    final isSuperAdmin = user?.isSuperAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Details'),
        actions: [
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Event',
              onPressed: () => context.push('/events/${widget.eventId}/edit'),
            ),
        ],
      ),
      body: eventAsync.when(
        data: (event) {
          if (event == null) {
            return const Center(child: Text('Event not found.'));
          }

          final isUserVolunteer = user != null && event.isVolunteer(user.uid);
          final isRegistered = isRegisteredAsync.value ?? false;
          final dateFormatted =
              DateFormat('EEEE, MMMM d, yyyy • h:mm a').format(event.dateTime);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (event.posterUrl != null && event.posterUrl!.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.network(
                      event.posterUrl!,
                      height: 220,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        event.type,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onPrimaryContainer,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    StatusChip(status: event.status),
                  ],
                ),
                const SizedBox(height: 12),

                Text(
                  event.title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 16),

                // Info card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildInfoRow(Icons.calendar_month, 'Date & Time', dateFormatted),
                        const Divider(),
                        _buildInfoRow(Icons.place_outlined, 'Venue', event.venue),
                        const Divider(),
                        _buildInfoRow(
                          Icons.school_outlined,
                          'Academic Year',
                          event.academicYear,
                        ),
                        if (isAdmin) ...[
                          const Divider(),
                          _buildInfoRow(
                            Icons.attach_money_outlined,
                            'Allocated Budget',
                            '\$${event.budget.toStringAsFixed(2)}',
                          ),
                          const Divider(),
                          _buildInfoRow(
                            Icons.how_to_reg_outlined,
                            'Confirmed Attendance',
                            '${event.attendanceCount} checked-in',
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Description
                const Text(
                  'About this Event',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  event.description.isNotEmpty
                      ? event.description
                      : 'No description provided.',
                  style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.5),
                ),
                const SizedBox(height: 28),

                // Member Actions: Registration & QR
                if (!isAdmin) ...[
                  if (isRegistered) ...[
                    CustomButton(
                      label: 'Show My Attendance QR',
                      icon: Icons.qr_code,
                      onPressed: () => context.push('/qr/my-qr/${event.id}'),
                    ),
                    const SizedBox(height: 12),
                  ] else ...[
                    CustomButton(
                      label: 'Register for Event',
                      icon: Icons.app_registration,
                      isLoading: _isRegistering,
                      onPressed: _handleRegister,
                    ),
                    const SizedBox(height: 12),
                  ],
                ],

                // Volunteer Scanner Button
                if (isUserVolunteer || (user?.canScanQr ?? false)) ...[
                  CustomButton(
                    label: 'Scan Attendees (Volunteer Mode)',
                    icon: Icons.qr_code_scanner,
                    color: const Color(0xFF16A34A),
                    onPressed: () => context.push('/qr/scan/${event.id}'),
                  ),
                  const SizedBox(height: 12),
                ],

                // Admin Controls: Status lifecycle
                if (isAdmin) ...[
                  const Divider(),
                  const Text(
                    'Admin Actions & Event Lifecycle',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (event.isSubmitted && isSuperAdmin)
                        ElevatedButton.icon(
                          icon: const Icon(Icons.check_circle_outline),
                          label: const Text('Approve Event'),
                          onPressed: () => ref
                              .read(eventActionsControllerProvider)
                              .updateEventStatus(event.id, AppConstants.eventStatusApproved),
                        ),
                      if (event.isApproved)
                        ElevatedButton.icon(
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Mark Event Live'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5)),
                          onPressed: () => ref
                              .read(eventActionsControllerProvider)
                              .updateEventStatus(event.id, AppConstants.eventStatusLive),
                        ),
                      if (event.isLive)
                        ElevatedButton.icon(
                          icon: const Icon(Icons.done_all),
                          label: const Text('Mark Completed'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF16A34A)),
                          onPressed: () => ref
                              .read(eventActionsControllerProvider)
                              .updateEventStatus(event.id, AppConstants.eventStatusCompleted),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const LoadingView(message: 'Loading event...'),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String title, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF64748B)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
              Text(
                value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
