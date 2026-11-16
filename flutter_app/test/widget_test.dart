import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/theme/app_theme.dart';
import 'package:flutter_app/models/user_model.dart';
import 'package:flutter_app/models/event_model.dart';
import 'package:flutter_app/features/auth/login_screen.dart';

void main() {
  group('GeoHub Model Serialization Tests', () {
    test('UserModel correctly parses Python FastAPI response', () {
      final json = {
        'id': 'usr-101',
        'roll_no': '23IT001',
        'email': 'scholar@geohub.club',
        'name': 'Asta Scholar',
        'role': 'student',
        'department': 'Geoinformatics Engineering',
        'year_of_study': '3rd Year',
        'is_volunteer': true,
        'status': 'active',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 'usr-101');
      expect(user.rollNo, '23IT001');
      expect(user.name, 'Asta Scholar');
      expect(user.role, 'student');
      expect(user.isVolunteer, true);
      expect(user.isSuperAdmin, false);
    });

    test('EventModel correctly parses Python FastAPI response', () {
      final json = {
        'id': 'evt-501',
        'title': 'Drone LiDAR Workshop',
        'type': 'Technical',
        'date_time': '2026-12-01T10:00:00Z',
        'venue': 'Geoinformatics Lab 3',
        'description': 'Advanced 3D point cloud registration.',
        'budget': 25000.0,
        'status': 'live',
        'academic_year': '2025-26',
        'volunteer_user_ids': ['usr-101'],
      };

      final event = EventModel.fromJson(json);

      expect(event.id, 'evt-501');
      expect(event.title, 'Drone LiDAR Workshop');
      expect(event.isLive, true);
      expect(event.isDraft, false);
      expect(event.budget, 25000.0);
    });
  });

  group('GeoHub Botanical Luxury Theme Tests', () {
    test('AppTheme exposes signature 6-color palette', () {
      expect(GeoColors.obsidianForest, const Color(0xFF051F20));
      expect(GeoColors.deepJungle, const Color(0xFF163832));
      expect(GeoColors.emeraldShadow, const Color(0xFF235347));
      expect(GeoColors.sageGlow, const Color(0xFF8EB69B));
      expect(GeoColors.mintChiffon, const Color(0xFFDAF1DE));
      expect(GeoColors.crispCanvas, const Color(0xFFF6FBF7));
    });
  });

  group('LoginScreen Widget Tests', () {
    testWidgets('Renders GEO HUB branding, Roll No and Password fields', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Verify branding and typography
      expect(find.text('GEO HUB'), findsOneWidget);
      expect(find.text('Department of Geoinformatics'), findsOneWidget);
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Access Portal'), findsOneWidget);

      // Verify fields
      expect(find.byType(TextFormField), findsNWidgets(2));
    });

    testWidgets('Triggers sentence-case validation when submitted empty', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Tap submit button without entering credentials
      await tester.tap(find.text('Access Portal'));
      await tester.pump();

      // Check validation error messages
      expect(find.text('Please enter your roll number or email.'), findsOneWidget);
      expect(find.text('Please enter your password.'), findsOneWidget);
    });
  });
}
