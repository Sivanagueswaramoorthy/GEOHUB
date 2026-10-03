import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';

class DashboardStats {
  final int totalEvents;
  final int totalMembers;
  final int totalVolunteers;
  final int totalTasks;
  final int completedTasks;
  final int totalCheckIns;
  final Map<String, int> teamMemberCounts;
  final Map<String, int> taskStatusCounts;

  const DashboardStats({
    this.totalEvents = 0,
    this.totalMembers = 0,
    this.totalVolunteers = 0,
    this.totalTasks = 0,
    this.completedTasks = 0,
    this.totalCheckIns = 0,
    this.teamMemberCounts = const {},
    this.taskStatusCounts = const {},
  });

  double get taskCompletionRate =>
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0.0;
}

final dashboardStatsProvider = StreamProvider<DashboardStats>((ref) async* {
  final firestore = ref.watch(firestoreProvider);

  // Stream users
  final usersStream = firestore.collection(AppConstants.colUsers).snapshots();
  // Stream events
  final eventsStream = firestore.collection(AppConstants.colEvents).snapshots();
  // Stream tasks
  final tasksStream = firestore.collection(AppConstants.colTasks).snapshots();
  // Stream attendance
  final attendanceStream = firestore.collection(AppConstants.colAttendance).snapshots();

  // Combine streams into aggregated metrics
  await for (final usersSnap in usersStream) {
    final eventsSnap = await firestore.collection(AppConstants.colEvents).get();
    final tasksSnap = await firestore.collection(AppConstants.colTasks).get();
    final attendanceSnap = await firestore.collection(AppConstants.colAttendance).get();

    final users = usersSnap.docs.map((d) => d.data()).toList();
    final volunteers = users.where((u) => u['isVolunteer'] == true).length;

    final teamCounts = <String, int>{
      'Management': 0,
      'Promotion': 0,
      'Documentation': 0,
      'Entertainment': 0,
    };
    for (final u in users) {
      final team = u['team'] as String?;
      if (team != null && teamCounts.containsKey(team)) {
        teamCounts[team] = (teamCounts[team] ?? 0) + 1;
      }
    }

    final tasks = tasksSnap.docs.map((d) => d.data()).toList();
    final taskCounts = <String, int>{
      'todo': 0,
      'in_progress': 0,
      'done': 0,
    };
    int completed = 0;
    for (final t in tasks) {
      final st = t['status'] as String? ?? 'todo';
      taskCounts[st] = (taskCounts[st] ?? 0) + 1;
      if (st == 'done') completed++;
    }

    yield DashboardStats(
      totalEvents: eventsSnap.docs.length,
      totalMembers: users.length,
      totalVolunteers: volunteers,
      totalTasks: tasks.length,
      completedTasks: completed,
      totalCheckIns: attendanceSnap.docs.length,
      teamMemberCounts: teamCounts,
      taskStatusCounts: taskCounts,
    );
  }
});
