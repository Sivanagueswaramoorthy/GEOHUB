import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/constants/app_constants.dart';
import '../../events/providers/event_providers.dart';
import '../providers/qr_attendance_providers.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  final String? eventId;

  const QrScannerScreen({super.key, this.eventId});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  String? _selectedEventId;
  bool _isProcessingScan = false;
  Map<String, dynamic>? _lastScanResult;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedEventId = widget.eventId;
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _handleBarcodeDetected(BarcodeCapture capture) async {
    if (_isProcessingScan) return;
    final barcode = capture.barcodes.firstOrNull;
    final code = barcode?.rawValue;
    if (code == null || code.isEmpty) return;

    if (_selectedEventId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an event first before scanning')),
      );
      return;
    }

    setState(() {
      _isProcessingScan = true;
      _errorMessage = null;
    });

    try {
      final result = await ref
          .read(qrAttendanceControllerProvider)
          .markAttendanceFromQr(
            eventId: _selectedEventId!,
            token: code,
          );

      if (mounted) {
        setState(() {
          _lastScanResult = result;
        });
        _showSuccessDialog(result['userName'] as String? ?? 'Student');
      }
    } catch (e) {
      if (mounted) {
        final err = e.toString().replaceAll("Exception: ", "");
        setState(() => _errorMessage = err);
        _showErrorDialog(err);
      }
    } finally {
      // Re-enable scanning after 2 seconds cooldown
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isProcessingScan = false);
      }
    }
  }

  void _showSuccessDialog(String attendeeName) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 28),
            SizedBox(width: 8),
            Text('Check-in Verified!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              attendeeName,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Attendance has been recorded in the system successfully.',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Scan Next'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: Colors.red, size: 28),
            SizedBox(width: 8),
            Text('Scan Failed'),
          ],
        ),
        content: Text(
          error,
          style: const TextStyle(fontSize: 15, color: Color(0xFF334155)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Try Again'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final liveEventsAsync = ref.watch(
      eventsStreamProvider(const EventFilter(status: AppConstants.eventStatusLive)),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Attendance QR'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            tooltip: 'Toggle Flash',
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.cameraswitch_outlined),
            tooltip: 'Switch Camera',
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Event Selection Bar if not opened from a specific event
          if (widget.eventId == null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.white,
              child: liveEventsAsync.when(
                data: (events) {
                  if (events.isEmpty) {
                    return const Text(
                      'No Live events found. Mark an event live to scan.',
                      style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                    );
                  }

                  _selectedEventId ??= events.first.id;

                  return DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _selectedEventId,
                      items: events.map((e) {
                        return DropdownMenuItem(
                          value: e.id,
                          child: Text('Live Event: ${e.title}'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() => _selectedEventId = val);
                      },
                    ),
                  );
                },
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Error: $e'),
              ),
            ),

          // Camera Viewport
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _scannerController,
                  onDetect: _handleBarcodeDetected,
                ),

                // Scanner target frame overlay
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: _isProcessingScan ? Colors.orange : Colors.greenAccent,
                      width: 3,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),

                if (_isProcessingScan)
                  Container(
                    color: Colors.black45,
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 12),
                          Text(
                            'Verifying Token...',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Bottom instruction strip
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF1E293B),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.info_outline, color: Colors.white70, size: 18),
                SizedBox(width: 8),
                Text(
                  'Point camera at the attendee dynamic QR code',
                  style: TextStyle(color: Colors.white, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
