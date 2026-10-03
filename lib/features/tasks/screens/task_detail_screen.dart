import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../../widgets/loading_view.dart';
import '../../../widgets/status_chip.dart';
import '../models/task_model.dart';
import '../providers/task_providers.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final String taskId;

  const TaskDetailScreen({super.key, required this.taskId});

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  final _proofController = TextEditingController();
  bool _isAddingProof = false;

  @override
  void dispose() {
    _proofController.dispose();
    super.dispose();
  }

  Future<void> _submitProof() async {
    final url = _proofController.text.trim();
    if (url.isEmpty) return;

    setState(() => _isAddingProof = true);
    try {
      await ref.read(taskActionsControllerProvider).addProofUrl(widget.taskId, url);
      _proofController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Proof submitted and task marked as completed!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit proof: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isAddingProof = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final taskAsync = ref.watch(taskDetailProvider(widget.taskId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
      ),
      body: taskAsync.when(
        data: (task) {
          if (task == null) {
            return const Center(child: Text('Task not found.'));
          }

          final deadlineFormatted =
              DateFormat('EEEE, MMMM d, yyyy • h:mm a').format(task.deadline);
          final isAssigned = user != null && task.isAssignedTo(user.uid);
          final canUpdate = isAssigned || (user?.canManageTasks ?? false);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        task.teamId,
                        style: TextStyle(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    StatusChip(status: task.status),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  task.title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 16),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildRow(
                          Icons.event_outlined,
                          'Deadline',
                          deadlineFormatted,
                        ),
                        const Divider(),
                        _buildRow(
                          Icons.groups_outlined,
                          'Assigned Members',
                          '${task.assignedUserIds.length} member(s)',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                const Text(
                  'Task Description',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  task.description.isNotEmpty
                      ? task.description
                      : 'No detailed description provided for this task.',
                  style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.5),
                ),
                const SizedBox(height: 24),

                // Status Update Buttons
                if (canUpdate) ...[
                  const Text(
                    'Update Status',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: task.isTodo
                              ? null
                              : () => ref
                                  .read(taskActionsControllerProvider)
                                  .updateTaskStatus(task.id, AppConstants.taskStatusTodo),
                          child: const Text('To Do'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: task.isInProgress
                              ? null
                              : () => ref
                                  .read(taskActionsControllerProvider)
                                  .updateTaskStatus(
                                      task.id, AppConstants.taskStatusInProgress),
                          child: const Text('In Progress'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: task.isDone
                              ? null
                              : () => ref
                                  .read(taskActionsControllerProvider)
                                  .updateTaskStatus(task.id, AppConstants.taskStatusDone),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF16A34A),
                          ),
                          child: const Text('Done'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                ],

                // Proof Upload Section
                const Text(
                  'Proof of Completion',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Attach Google Drive link, design file, or hosted screenshot proof:',
                  style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: CustomTextField(
                        label: 'Proof URL / Storage Link',
                        hint: 'https://...',
                        controller: _proofController,
                        prefixIcon: Icons.link,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CustomButton(
                  label: 'Submit Proof & Complete Task',
                  icon: Icons.upload_file,
                  isLoading: _isAddingProof,
                  onPressed: _submitProof,
                ),
                const SizedBox(height: 20),

                if (task.proofUrls.isNotEmpty) ...[
                  const Text(
                    'Submitted Proofs:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  ...task.proofUrls.map((url) => Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const Icon(Icons.verified, color: Color(0xFF16A34A)),
                          title: Text(
                            url,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF4F46E5)),
                          ),
                          trailing: const Icon(Icons.open_in_new, size: 18),
                        ),
                      )),
                ],
              ],
            ),
          );
        },
        loading: () => const LoadingView(message: 'Loading task...'),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildRow(IconData icon, String title, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF64748B)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
              Text(
                value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
