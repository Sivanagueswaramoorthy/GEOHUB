import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../teams/providers/team_providers.dart';
import '../models/task_model.dart';
import '../providers/task_providers.dart';

class TaskFormScreen extends ConsumerStatefulWidget {
  const TaskFormScreen({super.key});

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();

  late String _selectedTeam;
  DateTime _selectedDeadline = DateTime.now().add(const Duration(days: 2));
  final List<String> _selectedMemberIds = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProfileProvider).value;
    if (user != null && user.team != null && user.team!.isNotEmpty) {
      _selectedTeam = user.team!;
    } else {
      _selectedTeam = AppConstants.teams.first;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickDeadline() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDeadline,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (pickedDate == null || !mounted) return;

    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDeadline),
    );
    if (pickedTime == null || !mounted) return;

    setState(() {
      _selectedDeadline = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );
    });
  }

  Future<void> _saveTask() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final task = TaskModel(
        id: '',
        title: _titleController.text.trim(),
        description: _descController.text.trim(),
        teamId: _selectedTeam,
        assignedUserIds: _selectedMemberIds,
        deadline: _selectedDeadline,
        status: AppConstants.taskStatusTodo,
        createdBy: '',
        createdAt: DateTime.now(),
      );

      await ref.read(taskActionsControllerProvider).createTask(task);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Task assigned successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final isSuperOrAdmin = user?.isAdmin ?? false;
    final teamMembersAsync = ref.watch(teamMembersStreamProvider(_selectedTeam));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Task'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomTextField(
                label: 'Task Title',
                hint: 'e.g. Design Instagram Teaser Poster',
                controller: _titleController,
                validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              // Team Selector
              const Text('Assigned Department / Team',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedTeam,
                    items: (isSuperOrAdmin
                            ? AppConstants.teams
                            : [_selectedTeam])
                        .map((team) => DropdownMenuItem(value: team, child: Text(team)))
                        .toList(),
                    onChanged: isSuperOrAdmin
                        ? (val) {
                            if (val != null) {
                              setState(() {
                                _selectedTeam = val;
                                _selectedMemberIds.clear();
                              });
                            }
                          }
                        : null,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Deadline Picker
              const Text('Deadline',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              InkWell(
                onTap: _pickDeadline,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        DateFormat('EEE, MMM d, yyyy • h:mm a').format(_selectedDeadline),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                      ),
                      const Icon(Icons.schedule, size: 20, color: Color(0xFF4F46E5)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Task Instructions / Description',
                hint: 'Specific guidelines, dimensions, resources, or notes...',
                controller: _descController,
                maxLines: 4,
              ),
              const SizedBox(height: 20),

              // Assign Members from Team
              const Text(
                'Assign Team Members (Optional)',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              ),
              const SizedBox(height: 8),
              teamMembersAsync.when(
                data: (members) {
                  if (members.isEmpty) {
                    return const Text(
                      'No members in this team yet.',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                    );
                  }

                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: members.map((member) {
                      final isSelected = _selectedMemberIds.contains(member.uid);
                      return FilterChip(
                        label: Text('${member.name} (${member.teamRole ?? "Member"})'),
                        selected: isSelected,
                        onSelected: (val) {
                          setState(() {
                            if (val) {
                              _selectedMemberIds.add(member.uid);
                            } else {
                              _selectedMemberIds.remove(member.uid);
                            }
                          });
                        },
                      );
                    }).toList(),
                  );
                },
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Error: $e'),
              ),
              const SizedBox(height: 32),

              CustomButton(
                label: 'Assign Task',
                isLoading: _isSaving,
                onPressed: _saveTask,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
