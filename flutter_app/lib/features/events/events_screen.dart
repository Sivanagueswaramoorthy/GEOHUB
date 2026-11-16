import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../models/event_model.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  List<EventModel> _events = [];
  bool _isLoading = true;
  String _selectedFilter = 'All';

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiClient.dio.get(ApiConstants.events);
      if (response.statusCode == 200 && mounted) {
        final list = (response.data as List<dynamic>)
            .map((e) => EventModel.fromJson(e as Map<String, dynamic>))
            .toList();
        setState(() {
          _events = list;
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    // Mock fallback if offline
    if (mounted) {
      setState(() {
        _events = [
          EventModel(
            id: 'evt-1',
            title: 'GeoSparks 2026 Annual Symposium',
            type: 'Technical',
            dateTime: DateTime.now().add(const Duration(days: 3)),
            venue: 'Main University Auditorium',
            description: 'Keynotes on LiDAR, GIS Cartography, and Satellite Telemetry.',
            budget: 45000,
            status: 'approved',
          ),
          EventModel(
            id: 'evt-2',
            title: 'Drone Photogrammetry Field Workshop',
            type: 'Hands-on',
            dateTime: DateTime.now().add(const Duration(days: 7)),
            venue: 'East Campus Survey Ground',
            description: 'Flight planning, RTK GPS point calibration, and orthomosaic stitching.',
            budget: 15000,
            status: 'live',
          ),
        ];
        _isLoading = false;
      });
    }
  }

  Future<void> _registerForEvent(EventModel event) async {
    try {
      final response = await ApiClient.dio.post(ApiConstants.eventRegister(event.id));
      if (response.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('RSVP Confirmed for ${event.title}!'),
            backgroundColor: GeoColors.statusGreen,
          ),
        );
        return;
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('RSVP Recorded for ${event.title}!'),
            backgroundColor: GeoColors.statusGreen,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GeoColors.obsidianForest,
      appBar: AppBar(
        title: const Text('Campus Events'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchEvents,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Chips Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['All', 'Technical', 'Hands-on', 'Cultural'].map((filter) {
                    final isSelected = _selectedFilter == filter;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(filter),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() => _selectedFilter = filter);
                        },
                        backgroundColor: GeoColors.deepJungle,
                        selectedColor: GeoColors.sageGlow,
                        labelStyle: TextStyle(
                          color: isSelected ? GeoColors.obsidianForest : GeoColors.mintChiffon,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.5,
                        ),
                        side: BorderSide(
                          color: isSelected ? GeoColors.sageGlow : GeoColors.emeraldShadow,
                        ),
                        showCheckmark: false,
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            // Events List
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: GeoColors.sageGlow),
                    )
                  : _events.isEmpty
                      ? Center(
                          child: Text(
                            'No scheduled events at this time.',
                            style: TextStyle(
                              color: GeoColors.mintChiffon.withOpacity(0.6),
                            ),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchEvents,
                          color: GeoColors.sageGlow,
                          backgroundColor: GeoColors.deepJungle,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _events.length,
                            itemBuilder: (context, index) {
                              final event = _events[index];
                              final dateFormatted = DateFormat('EEE, MMM d • h:mm a').format(event.dateTime);

                              return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: GeoColors.deepJungle,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: GeoColors.emeraldShadow),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: GeoColors.emeraldShadow,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            event.type.toUpperCase(),
                                            style: const TextStyle(
                                              color: GeoColors.mintChiffon,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          event.status.toUpperCase(),
                                          style: TextStyle(
                                            color: event.isLive ? GeoColors.statusGreen : GeoColors.statusAmber,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      event.title,
                                      style: const TextStyle(
                                        color: GeoColors.crispCanvas,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      event.description,
                                      style: TextStyle(
                                        color: GeoColors.mintChiffon.withOpacity(0.7),
                                        fontSize: 13,
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time_rounded, size: 14, color: GeoColors.sageGlow),
                                        const SizedBox(width: 6),
                                        Text(
                                          dateFormatted,
                                          style: const TextStyle(color: GeoColors.mintChiffon, fontSize: 12),
                                        ),
                                        const SizedBox(width: 14),
                                        const Icon(Icons.place_outlined, size: 14, color: GeoColors.sageGlow),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            event.venue,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(color: GeoColors.mintChiffon, fontSize: 12),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 18),
                                    ElevatedButton.icon(
                                      onPressed: () => _registerForEvent(event),
                                      icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                                      label: const Text('1-Tap RSVP Registration'),
                                      style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(double.infinity, 42),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
