import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: GeoColors.obsidianForest,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: GeoColors.deepJungle,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: GeoColors.emeraldShadow),
              ),
              child: const Icon(Icons.eco_rounded, color: GeoColors.sageGlow, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('GEO HUB'),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Log Out',
            icon: const Icon(Icons.logout_rounded, color: GeoColors.mintChiffon),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Welcome Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [GeoColors.deepJungle, Color(0xFF0F2B26)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: GeoColors.emeraldShadow),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: GeoColors.sageGlow.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: GeoColors.sageGlow.withOpacity(0.5)),
                          ),
                          child: Text(
                            (user?.role ?? 'STUDENT').toUpperCase().replaceAll('_', ' '),
                            style: const TextStyle(
                              color: GeoColors.sageGlow,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        Text(
                          user?.rollNo ?? '',
                          style: TextStyle(
                            color: GeoColors.mintChiffon.withOpacity(0.7),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      user?.name ?? 'Scholar',
                      style: const TextStyle(
                        color: GeoColors.crispCanvas,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.department ?? 'Department of Geoinformatics',
                      style: TextStyle(
                        color: GeoColors.mintChiffon.withOpacity(0.7),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Fast Action Grid
              const Text(
                'QUICK ACTIONS',
                style: TextStyle(
                  color: GeoColors.sageGlow,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _ActionCard(
                    icon: Icons.qr_code_rounded,
                    title: 'My QR Token',
                    subtitle: 'Event check-in pass',
                    color: GeoColors.sageGlow,
                    onTap: () => context.push('/my-qr'),
                  ),
                  _ActionCard(
                    icon: Icons.qr_code_scanner_rounded,
                    title: 'Scan Pass',
                    subtitle: 'Camera attendance',
                    color: GeoColors.statusCyan,
                    onTap: () => context.push('/scan-qr'),
                  ),
                  _ActionCard(
                    icon: Icons.calendar_today_rounded,
                    title: 'Campus Events',
                    subtitle: 'Schedule & RSVPs',
                    color: GeoColors.statusAmber,
                    onTap: () => context.push('/events'),
                  ),
                  _ActionCard(
                    icon: Icons.people_outline_rounded,
                    title: 'Squad Roster',
                    subtitle: 'Team directory',
                    color: GeoColors.mintChiffon,
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Squad Directory: 5 Active Squads'),
                          backgroundColor: GeoColors.deepJungle,
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Cloud Telemetry Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: GeoColors.deepJungle,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: GeoColors.emeraldShadow),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: GeoColors.statusGreen,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Python FastAPI Cloud Gateway',
                            style: TextStyle(
                              color: GeoColors.crispCanvas,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'TiDB Serverless Database connected (:3306)',
                            style: TextStyle(
                              color: GeoColors.mintChiffon,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.bolt_rounded, color: GeoColors.statusGreen, size: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: GeoColors.deepJungle,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GeoColors.emeraldShadow),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: GeoColors.crispCanvas,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: GeoColors.mintChiffon.withOpacity(0.65),
                    fontSize: 11.5,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
