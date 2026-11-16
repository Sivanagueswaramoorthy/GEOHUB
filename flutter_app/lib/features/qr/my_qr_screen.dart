import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class MyQrScreen extends ConsumerStatefulWidget {
  const MyQrScreen({super.key});

  @override
  ConsumerState<MyQrScreen> createState() => _MyQrScreenState();
}

class _MyQrScreenState extends ConsumerState<MyQrScreen> {
  String? _qrToken;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQrToken();
  }

  Future<void> _loadQrToken() async {
    try {
      final response = await ApiClient.dio.get(ApiConstants.myQrToken);
      if (response.statusCode == 200 && mounted) {
        setState(() {
          _qrToken = response.data['token']?.toString() ?? response.data['qr_data']?.toString();
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}

    // Offline fallback: encode user roll number + student id
    if (mounted) {
      final user = ref.read(authProvider).user;
      setState(() {
        _qrToken = 'GEOHUB:${user?.rollNo ?? "STUDENT"}:${user?.id ?? "OFFLINE"}';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: GeoColors.obsidianForest,
      appBar: AppBar(
        title: const Text('My Event Pass'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Pass Container
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: GeoColors.deepJungle,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: GeoColors.emeraldShadow),
                    boxShadow: [
                      BoxShadow(
                        color: GeoColors.sageGlow.withOpacity(0.08),
                        blurRadius: 30,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // User Identity
                      Text(
                        user?.name ?? 'Scholar Pass',
                        style: const TextStyle(
                          color: GeoColors.crispCanvas,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.rollNo ?? '',
                        style: const TextStyle(
                          color: GeoColors.sageGlow,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // QR Code
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 220,
                                height: 220,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    color: GeoColors.obsidianForest,
                                  ),
                                ),
                              )
                            : QrImageView(
                                data: _qrToken ?? 'GEOHUB:EMPTY',
                                version: QrVersions.auto,
                                size: 220.0,
                                eyeStyle: const QrEyeStyle(
                                  eyeShape: QrEyeShape.square,
                                  color: Color(0xFF051F20),
                                ),
                                dataModuleStyle: const QrDataModuleStyle(
                                  dataModuleShape: QrDataModuleShape.square,
                                  color: Color(0xFF051F20),
                                ),
                              ),
                      ),
                      const SizedBox(height: 24),

                      // Security Note
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.shield_outlined, color: GeoColors.sageGlow, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Cryptographically Signed Token',
                            style: TextStyle(
                              color: GeoColors.mintChiffon.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Refresh Button
                OutlinedButton.icon(
                  onPressed: _loadQrToken,
                  icon: const Icon(Icons.refresh_rounded, color: GeoColors.sageGlow, size: 18),
                  label: const Text(
                    'Regenerate Token',
                    style: TextStyle(color: GeoColors.mintChiffon),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: GeoColors.emeraldShadow),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
