import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/status_chip.dart';
import '../models/event_model.dart';
import '../providers/event_providers.dart';

class EventsListScreen extends ConsumerStatefulWidget {
  const EventsListScreen({super.key});

  @override
  ConsumerState<EventsListScreen> createState() => _EventsListScreenState();
}

class _EventsListScreenState extends ConsumerState<EventsListScreen> {
  String? _selectedStatus;
  String? _selectedType;
  final String _selectedYear = '2025-26';

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final isAdmin = user?.isAdmin ?? false;

    final filter = EventFilter(
      status: _selectedStatus,
      type: _selectedType,
      academicYear: _selectedYear,
    );
    final eventsAsync = ref.watch(eventsStreamProvider(filter));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Club Events'),
        actions: [
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              tooltip: 'Create Event',
              onPressed: () => context.push('/events/create'),
            ),
        ],
      ),
      drawer: user != null ? AppDrawer(user: user) : null,
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/events/create'),
              icon: const Icon(Icons.add),
              label: const Text('New Event'),
            )
          : null,
      body: Column(
        children: [
          // Filter Row
          if (isAdmin)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  FilterChip(
                    label: const Text('All Statuses'),
                    selected: _selectedStatus == null,
                    onSelected: (_) => setState(() => _selectedStatus = null),
                  ),
                  const SizedBox(width: 8),
                  FilterChip(
                    label: const Text('Live'),
                    selected: _selectedStatus == AppConstants.eventStatusLive,
                    onSelected: (val) => setState(() =>
                        _selectedStatus = val ? AppConstants.eventStatusLive : null),
                  ),
                  const SizedBox(width: 8),
                  FilterChip(
                    label: const Text('Approved'),
                    selected: _selectedStatus == AppConstants.eventStatusApproved,
                    onSelected: (val) => setState(() =>
                        _selectedStatus = val ? AppConstants.eventStatusApproved : null),
                  ),
                  const SizedBox(width: 8),
                  FilterChip(
                    label: const Text('Submitted'),
                    selected: _selectedStatus == AppConstants.eventStatusSubmitted,
                    onSelected: (val) => setState(() =>
                        _selectedStatus = val ? AppConstants.eventStatusSubmitted : null),
                  ),
                  const SizedBox(width: 8),
                  FilterChip(
                    label: const Text('Drafts'),
                    selected: _selectedStatus == AppConstants.eventStatusDraft,
                    onSelected: (val) => setState(() =>
                        _selectedStatus = val ? AppConstants.eventStatusDraft : null),
                  ),
                ],
              ),
            ),

          Expanded(
            child: eventsAsync.when(
              data: (events) {
                if (events.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.event_busy,
                    title: 'No Events Found',
                    description: isAdmin
                        ? 'Create a new club event or adjust your filters above.'
                        : 'No upcoming club events are scheduled right now.',
                    actionLabel: isAdmin ? 'Create Event' : null,
                    onAction: isAdmin ? () => context.push('/events/create') : null,
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: events.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final event = events[index];
                    final dateFormatted =
                        DateFormat('EEE, MMM d, yyyy • h:mm a').format(event.dateTime);

                    return Card(
                      clipBehavior: Clip.antiAlias,
                      child: InkWell(
                        onTap: () => context.push('/events/${event.id}'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (event.posterUrl != null && event.posterUrl!.isNotEmpty)
                              Image.network(
                                event.posterUrl!,
                                height: 160,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  height: 120,
                                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                                  child: const Center(
                                    child: Icon(Icons.image_not_supported_outlined, size: 36),
                                  ),
                                ),
                              ),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).colorScheme.primaryContainer,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          event.type,
                                          style: TextStyle(
                                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                      StatusChip(status: event.status),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    event.title,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF64748B)),
                                      const SizedBox(width: 6),
                                      Text(
                                        dateFormatted,
                                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF64748B)),
                                      const SizedBox(width: 6),
                                      Text(
                                        event.venue,
                                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const LoadingView(message: 'Loading events...'),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}
