import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../models/task_model.dart';

enum TaskScopeFilter { myTasks, teamTasks, allTasks }

class TaskFilter {
  final TaskScopeFilter scope;
  final String? status;

  const TaskFilter({
    this.scope = TaskScopeFilter.myTasks,
    this.status,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TaskFilter &&
          runtimeType == other.runtimeType &&
          scope == other.scope &&
          status == other.status;

  @override
  int get hashCode => scope.hashCode ^ status.hashCode;
}

// Stream Tasks based on user role and scope filter
final tasksStreamProvider =
    StreamProvider.family<List<TaskModel>, TaskFilter>((ref, filter) {
  final firestore = ref.watch(firestoreProvider);
  final user = ref.watch(currentUserProfileProvider).value;

  if (user == null) return Stream.value([]);

  Query<Map<String, dynamic>> query = firestore.collection(AppConstants.colTasks);

  if (filter.status != null && filter.status!.isNotEmpty) {
    query = query.where('status', isEqualTo: filter.status);
  }

  return query.snapshots().map((snapshot) {
    var tasks = snapshot.docs.map((doc) => TaskModel.fromFirestore(doc)).toList();

    // In-memory role-based scope filtering for accurate compound queries
    if (!user.isAdmin) {
      if (filter.scope == TaskScopeFilter.myTasks) {
        tasks = tasks.where((t) => t.isAssignedTo(user.uid)).toList();
      } else {
        // Team tasks
        tasks = tasks.where((t) => t.teamId == user.team).toList();
      }
    } else {
      if (filter.scope == TaskScopeFilter.myTasks) {
        tasks = tasks.where((t) => t.isAssignedTo(user.uid)).toList();
      }
    }

    tasks.sort((a, b) => a.deadline.compareTo(b.deadline));
    return tasks;
  });
});

// Single task detail provider
final taskDetailProvider =
    StreamProvider.family<TaskModel?, String>((ref, taskId) {
  final firestore = ref.watch(firestoreProvider);
  return firestore
      .collection(AppConstants.colTasks)
      .doc(taskId)
      .snapshots()
      .map((doc) => doc.exists ? TaskModel.fromFirestore(doc) : null);
});

// Task Actions Controller
final taskActionsControllerProvider = Provider((ref) {
  return TaskActionsController(
    firestore: ref.watch(firestoreProvider),
    ref: ref,
  );
});

class TaskActionsController {
  final FirebaseFirestore _firestore;
  final Ref _ref;

  TaskActionsController({
    required FirebaseFirestore firestore,
    required Ref ref,
  })  : _firestore = firestore,
        _ref = ref;

  Future<void> createTask(TaskModel task) async {
    final user = _ref.read(currentUserProfileProvider).value;
    if (user == null) throw Exception('User not authenticated');

    final docRef = _firestore.collection(AppConstants.colTasks).doc();
    final newTask = task.copyWith(
      id: docRef.id,
      createdBy: user.uid,
      createdAt: DateTime.now(),
    );

    await docRef.set(newTask.toMap());
  }

  Future<void> updateTaskStatus(String taskId, String newStatus) async {
    await _firestore
        .collection(AppConstants.colTasks)
        .doc(taskId)
        .update({'status': newStatus});
  }

  Future<void> addProofUrl(String taskId, String proofUrl) async {
    await _firestore
        .collection(AppConstants.colTasks)
        .doc(taskId)
        .update({
      'proofUrls': FieldValue.arrayUnion([proofUrl]),
      'status': AppConstants.taskStatusDone,
    });
  }
}
