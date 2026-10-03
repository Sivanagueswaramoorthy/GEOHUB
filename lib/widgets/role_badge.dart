import 'package:flutter/material.dart';
import '../core/constants/app_constants.dart';

class RoleBadge extends StatelessWidget {
  final String role;
  final bool isVolunteer;

  const RoleBadge({
    super.key,
    required this.role,
    this.isVolunteer = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color textColor;
    String label;

    switch (role) {
      case AppConstants.roleSuperAdmin:
        bg = const Color(0xFFFEE2E2);
        textColor = const Color(0xFF991B1B);
        label = 'Super Admin';
        break;
      case AppConstants.roleAdmin:
        bg = const Color(0xFFE0E7FF);
        textColor = const Color(0xFF3730A3);
        label = 'Admin';
        break;
      case AppConstants.roleTeamAdmin:
        bg = const Color(0xFFCCFBF1);
        textColor = const Color(0xFF115E59);
        label = 'Team Admin';
        break;
      case AppConstants.roleMember:
      default:
        bg = const Color(0xFFF1F5F9);
        textColor = const Color(0xFF475569);
        label = 'Member';
        break;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: textColor.withOpacity(0.2)),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ),
        if (isVolunteer) ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF16A34A).withOpacity(0.2)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.qr_code_scanner, size: 12, color: Color(0xFF15803D)),
                SizedBox(width: 4),
                Text(
                  'Volunteer',
                  style: TextStyle(
                    color: Color(0xFF15803D),
                    fontWeight: FontWeight.w600,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
