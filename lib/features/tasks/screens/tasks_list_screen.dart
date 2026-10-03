import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/status_chip.dart';
import '../providers/task_providers.dart';

class TasksListScreen extends ConsumerStatefulWidget {
  const TasksListScreen({super.key});

  @override
  ConsumerState<TasksListScreen> createState() => _TasksListScreenState();
}

class _TasksListScreenState extends ConsumerState<TasksListScreen> {
  TaskScopeFilter _selectedScope = TaskScopeFilter.myTasks;
  String? _selectedStatus;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final canManageTasks = user?.canManageTasks ?? false;

    final filter = TaskFilter(
      scope: _selectedScope,
      status: _selectedStatus,
    );
    final tasksAsync = ref.watch(tasksStreamProvider(filter));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasks & Deliverables'),
        actions: [
          if (canManageTasks)
            IconButton(
              icon: const Icon(Icons.add_task),
              tooltip: 'Create Task',
              onPressed: () => context.push('/tasks/create'),
            ),
        ],
      ),
      drawer: user != null ? AppDrawer(user: user) : null,
      floatingActionButton: canManageTasks
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/tasks/create'),
              icon: const Icon(Icons.add),
              label: const Text('New Task'),
            )
          : null,
      body: Column(
        children: [
          // Scope Segmented Controls
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: SegmentedButton<TaskScopeFilter>(
              segments: [
                const ButtonSegment(
                  value: TaskScopeFilter.myTasks,
                  label: Text('My Tasks'),
                  icon: Icon(Icons.person_outline),
                ),
                if (user?.team != null && user!.team!.isNotEmpty)
                  const ButtonSegment(
                    value: TaskScopeFilter.teamTasks,
                    label: Text('Team'),
                    icon: Icon(Icons.group_outlined),
                  ),
                if (user?.isAdmin ?? false)
                  const ButtonSegment(
                    value: TaskScopeFilter.allTasks,
                    label: Text('All Teams'),
                    icon: Icon(Icons.apps_outlined),
                  ),
              ],
              selected: {_selectedScope},
              onSelectionChanged: (val) {
                setState(() => _selectedScope = val.first);
              },
            ),
          ),

          // Status Filter Bar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                ChoiceChip(
                  label: const Text('All'),
                  selected: _selectedStatus == null,
                  onSelected: (_) => setState(() => _selectedStatus = null),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('To Do'),
                  selected: _selectedStatus == AppConstants.taskStatusTodo,
                  onSelected: (val) => setState(
                      () => _selectedStatus = val ? AppConstants.taskStatusTodo : null),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('In Progress'),
                  selected: _selectedStatus == AppConstants.taskStatusInProgress,
                  onSelected: (val) => setState(() => _selectedStatus =
                      val ? AppConstants.taskStatusInProgress : null),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Done'),
                  selected: _selectedStatus == AppConstants.taskStatusDone,
                  onSelected: (val) => setState(
                      () => _selectedStatus = val ? AppConstants.taskStatusDone : null),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          Expanded(
            child: tasksAsync.when(
              data: (tasks) {
                if (tasks.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.checklist_rtl_outlined,
                    title: 'No Tasks Found',
                    description: canManageTasks
                        ? 'Create a new task for your team members or check your filter criteria.'
                        : 'You currently have no tasks assigned in this view.',
                    actionLabel: canManageTasks ? 'Create Task' : null,
                    onAction: canManageTasks ? () => context.push('/tasks/create') : null,
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: tasks.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final task = tasks[index];
                    final isOverdue =
                        task.deadline.isBefore(DateTime.now()) && !task.isDone;
                    final deadlineFormatted =
                        DateFormat('MMM d, h:mm a').format(task.deadline);

                    return Card(
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        title: Row(
                          children: [
                            Expanded(
                              child: Text(
                                task.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            StatusChip(status: task.status),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (task.description.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                task.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    task.teamId,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF475569),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  Icons.access_time,
                                  size: 14,
                                  color: isOverdue ? Colors.red : const Color(0xFF94A3B8),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Due $deadlineFormatted',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isOverdue
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                    color: isOverdue ? Colors.red : const Color(0xFF64748B),
                                  ),
                                ),
                                if (task.proofUrls.isNotEmpty) ...[
                                  const Spacer(),
                                  const Icon(Icons.attach_file,
                                      size: 16, color: Color(0xFF10B981)),
                                  Text(
                                    '${task.proofUrls.length} Proof',
                                    style: const TextStyle(
                                        fontSize: 11, color: Color(0xFF10B981)),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                        onTap: () => context.push('/tasks/${task.id}'),
                      ),
                    );
                  },
                );
              },
              loading: () => const LoadingView(message: 'Loading tasks...'),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
