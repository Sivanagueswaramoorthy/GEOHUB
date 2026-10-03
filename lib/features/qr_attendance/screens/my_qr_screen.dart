import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/custom_button.dart';
import '../../events/providers/event_providers.dart';
import '../providers/qr_attendance_providers.dart';

class MyQrScreen extends ConsumerStatefulWidget {
  final String eventId;

  const MyQrScreen({super.key, required this.eventId});

  @override
  ConsumerState<MyQrScreen> createState() => _MyQrScreenState();
}

class _MyQrScreenState extends ConsumerState<MyQrScreen> {
  String? _qrToken;
  bool _isLoading = true;
  int _secondsRemaining = 25;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _fetchFreshToken();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = 25);

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        // Auto-refresh before token expires
        _fetchFreshToken();
      }
    });
  }

  Future<void> _fetchFreshToken() async {
    setState(() => _isLoading = true);
    try {
      final token = await ref
          .read(qrAttendanceControllerProvider)
          .generateEventQr(eventId: widget.eventId);

      if (mounted) {
        setState(() {
          _qrToken = token;
          _isLoading = false;
        });
        _startTimer();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate QR: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final eventAsync = ref.watch(eventDetailProvider(widget.eventId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Attendance QR'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              eventAsync.when(
                data: (event) => Text(
                  event?.title ?? 'Event Check-in',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 8),
              const Text(
                'Show this dynamic QR code to a volunteer at the entrance.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 24),

              // QR Code Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      if (_isLoading || _qrToken == null)
                        const SizedBox(
                          height: 220,
                          width: 220,
                          child: Center(
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else
                        QrImageView(
                          data: _qrToken!,
                          version: QrVersions.auto,
                          size: 220.0,
                          backgroundColor: Colors.white,
                        ),
                      const SizedBox(height: 16),

                      // Countdown Timer Chip
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.timer_outlined, size: 16, color: Color(0xFF2563EB)),
                            const SizedBox(width: 6),
                            Text(
                              'Auto-refreshing in ${_secondsRemaining}s',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2563EB),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text(
                user?.name ?? 'Student',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                '${user?.team ?? "Member"} • ${user?.email ?? ""}',
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 28),

              CustomButton(
                label: 'Force Refresh QR Code',
                icon: Icons.refresh,
                variant: ButtonVariant.outlined,
                onPressed: _fetchFreshToken,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
