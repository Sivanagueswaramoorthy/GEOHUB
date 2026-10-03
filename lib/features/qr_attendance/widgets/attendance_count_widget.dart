import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/qr_attendance_providers.dart';

class AttendanceCountWidget extends ConsumerWidget {
  final String eventId;

  const AttendanceCountWidget({super.key, required this.eventId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final countAsync = ref.watch(eventAttendanceCountProvider(eventId));

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.how_to_reg, color: Color(0xFF16A34A), size: 24),
                SizedBox(width: 12),
                Text(
                  'Live Attendance Count',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
              ],
            ),
            countAsync.when(
              data: (count) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$count Checked In',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF15803D),
                    fontSize: 13,
                  ),
                ),
              ),
              loading: () => const SizedBox(
                height: 16,
                width: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              error: (_, __) => const Text('Error'),
            ),
          ],
        ),
      ),
    );
  }
}
