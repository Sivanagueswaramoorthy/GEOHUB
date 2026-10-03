import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  final String status;

  const StatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String display = status.toUpperCase();

    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'done':
        bg = const Color(0xFFDCFCE7);
        text = const Color(0xFF15803D);
        break;
      case 'pending':
      case 'submitted':
      case 'in_progress':
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFFB45309);
        display = status == 'in_progress' ? 'IN PROGRESS' : display;
        break;
      case 'live':
        bg = const Color(0xFFE0E7FF);
        text = const Color(0xFF4338CA);
        break;
      case 'todo':
      case 'draft':
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF475569);
        break;
      case 'disabled':
      case 'archived':
      case 'rejected':
      default:
        bg = const Color(0xFFFEE2E2);
        text = const Color(0xFFB91C1C);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        display,
        style: TextStyle(
          color: text,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
