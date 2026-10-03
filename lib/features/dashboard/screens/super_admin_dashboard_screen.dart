import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/stat_card.dart';
import '../providers/dashboard_providers.dart';

class SuperAdminDashboardScreen extends ConsumerWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProfileProvider).value;
    final statsAsync = ref.watch(dashboardStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Club Command Center'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      drawer: user != null ? AppDrawer(user: user) : null,
      body: statsAsync.when(
        data: (stats) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Greeting & Role
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome, ${user?.name ?? "Admin"}',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Overview of club operations, teams & attendance',
                          style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // KPI Stat Cards Grid
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    StatCard(
                      title: 'Total Members',
                      value: '${stats.totalMembers}',
                      icon: Icons.people_alt_outlined,
                      iconColor: const Color(0xFF4F46E5),
                      subtitle: 'Active & Registered',
                    ),
                    StatCard(
                      title: 'Club Events',
                      value: '${stats.totalEvents}',
                      icon: Icons.event_available_outlined,
                      iconColor: const Color(0xFF0D9488),
                      subtitle: 'Across Academic Year',
                    ),
                    StatCard(
                      title: 'Active Volunteers',
                      value: '${stats.totalVolunteers}',
                      icon: Icons.qr_code_scanner_outlined,
                      iconColor: const Color(0xFF10B981),
                      subtitle: 'Authorized Scanners',
                    ),
                    StatCard(
                      title: 'Total Check-ins',
                      value: '${stats.totalCheckIns}',
                      icon: Icons.verified_user_outlined,
                      iconColor: const Color(0xFF7C3AED),
                      subtitle: 'QR Attendance verified',
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Quick Action Bar
                const Text(
                  'Quick Management Actions',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.add_circle, color: Color(0xFF4F46E5)),
                        label: const Text('Create Event'),
                        onPressed: () => context.push('/events/create'),
                      ),
                      const SizedBox(width: 8),
                      ActionChip(
                        avatar: const Icon(Icons.add_task, color: Color(0xFF0D9488)),
                        label: const Text('Assign Task'),
                        onPressed: () => context.push('/tasks/create'),
                      ),
                      const SizedBox(width: 8),
                      ActionChip(
                        avatar: const Icon(Icons.cloud_upload, color: Color(0xFF7C3AED)),
                        label: const Text('Upload Media'),
                        onPressed: () => context.push('/gallery/upload'),
                      ),
                      const SizedBox(width: 8),
                      ActionChip(
                        avatar: const Icon(Icons.group_add, color: Color(0xFFF59E0B)),
                        label: const Text('Manage Teams'),
                        onPressed: () => context.push('/teams'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Charts Section
                const Text(
                  'Task Completion & Department Distribution',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Task Completion Pie Chart Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Task Status Distribution',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 180,
                          child: stats.totalTasks == 0
                              ? const Center(child: Text('No tasks created yet.'))
                              : PieChart(
                                  PieChartData(
                                    sectionsSpace: 3,
                                    centerSpaceRadius: 40,
                                    sections: [
                                      PieChartSectionData(
                                        value: (stats.taskStatusCounts['done'] ?? 0).toDouble(),
                                        title: 'Done (${stats.taskStatusCounts['done'] ?? 0})',
                                        color: const Color(0xFF10B981),
                                        radius: 45,
                                        titleStyle: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      PieChartSectionData(
                                        value: (stats.taskStatusCounts['in_progress'] ?? 0)
                                            .toDouble(),
                                        title: 'Active (${stats.taskStatusCounts['in_progress'] ?? 0})',
                                        color: const Color(0xFFF59E0B),
                                        radius: 45,
                                        titleStyle: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      PieChartSectionData(
                                        value: (stats.taskStatusCounts['todo'] ?? 0).toDouble(),
                                        title: 'To Do (${stats.taskStatusCounts['todo'] ?? 0})',
                                        color: const Color(0xFF64748B),
                                        radius: 45,
                                        titleStyle: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Team Members Distribution Bar Chart
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Members by Department',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 16),
                        ...stats.teamMemberCounts.entries.map((entry) {
                          final count = entry.value;
                          final percentage = stats.totalMembers > 0
                              ? count / stats.totalMembers
                              : 0.0;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      entry.key,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    Text(
                                      '$count members (${(percentage * 100).toStringAsFixed(0)}%)',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                LinearProgressIndicator(
                                  value: percentage,
                                  backgroundColor: const Color(0xFFF1F5F9),
                                  color: Theme.of(context).primaryColor,
                                  minHeight: 8,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
        loading: () => const LoadingView(message: 'Compiling dashboard analytics...'),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
