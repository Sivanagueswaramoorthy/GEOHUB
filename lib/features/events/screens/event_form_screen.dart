import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_constants.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../models/event_model.dart';
import '../providers/event_providers.dart';

class EventFormScreen extends ConsumerStatefulWidget {
  final String? eventId;

  const EventFormScreen({super.key, this.eventId});

  @override
  ConsumerState<EventFormScreen> createState() => _EventFormScreenState();
}

class _EventFormScreenState extends ConsumerState<EventFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _venueController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _budgetController = TextEditingController(text: '0');
  final _posterUrlController = TextEditingController();

  String _selectedType = AppConstants.eventTypes.first;
  String _selectedYear = '2025-26';
  DateTime _selectedDateTime = DateTime.now().add(const Duration(days: 3));
  bool _isSaving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _venueController.dispose();
    _descriptionController.dispose();
    _budgetController.dispose();
    _posterUrlController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDateTime,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (pickedDate == null || !mounted) return;

    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDateTime),
    );
    if (pickedTime == null || !mounted) return;

    setState(() {
      _selectedDateTime = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );
    });
  }

  Future<void> _saveEvent() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final budget = double.tryParse(_budgetController.text) ?? 0.0;
      final newEvent = EventModel(
        id: widget.eventId ?? '',
        title: _titleController.text.trim(),
        type: _selectedType,
        dateTime: _selectedDateTime,
        venue: _venueController.text.trim(),
        description: _descriptionController.text.trim(),
        budget: budget,
        posterUrl: _posterUrlController.text.trim().isNotEmpty
            ? _posterUrlController.text.trim()
            : null,
        academicYear: _selectedYear,
        createdBy: '',
        createdAt: DateTime.now(),
      );

      if (widget.eventId == null) {
        await ref.read(eventActionsControllerProvider).createEvent(newEvent);
      } else {
        await ref.read(eventActionsControllerProvider).updateEvent(newEvent);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Event saved successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save event: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.eventId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Event' : 'Create New Event'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomTextField(
                label: 'Event Title',
                hint: 'e.g. Annual Tech Symposium 2026',
                controller: _titleController,
                validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              // Event Type Dropdown
              const Text('Event Type', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
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
                    value: _selectedType,
                    items: AppConstants.eventTypes.map((t) {
                      return DropdownMenuItem(value: t, child: Text(t));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedType = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Date & Time Picker
              const Text('Date & Time', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 6),
              InkWell(
                onTap: _pickDateTime,
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
                        DateFormat('EEEE, MMM d, yyyy • h:mm a').format(_selectedDateTime),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                      ),
                      const Icon(Icons.calendar_today, size: 20, color: Color(0xFF4F46E5)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Venue / Location',
                hint: 'e.g. Main Auditorium, Block C',
                controller: _venueController,
                prefixIcon: Icons.location_on_outlined,
                validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Allocated Budget (\$)',
                hint: '0.00',
                controller: _budgetController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                prefixIcon: Icons.attach_money,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Poster Image URL (Optional)',
                hint: 'https://...',
                controller: _posterUrlController,
                prefixIcon: Icons.image_outlined,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Event Description',
                hint: 'Provide an overview, schedule, rules, and speaker details...',
                controller: _descriptionController,
                maxLines: 4,
              ),
              const SizedBox(height: 32),

              CustomButton(
                label: isEditing ? 'Update Event' : 'Submit Event for Review',
                isLoading: _isSaving,
                onPressed: _saveEvent,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
