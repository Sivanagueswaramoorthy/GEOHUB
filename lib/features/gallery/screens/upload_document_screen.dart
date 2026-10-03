import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../events/providers/event_providers.dart';
import '../providers/gallery_providers.dart';

class UploadDocumentScreen extends ConsumerStatefulWidget {
  const UploadDocumentScreen({super.key});

  @override
  ConsumerState<UploadDocumentScreen> createState() => _UploadDocumentScreenState();
}

class _UploadDocumentScreenState extends ConsumerState<UploadDocumentScreen> {
  final _titleController = TextEditingController();
  final _urlController = TextEditingController();

  String? _selectedEventId;
  String _selectedCategory = AppConstants.galleryCategories.first;
  PlatformFile? _pickedFile;
  bool _isUploading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.any,
      withData: true,
    );

    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _pickedFile = result.files.first;
        if (_titleController.text.isEmpty) {
          _titleController.text = _pickedFile!.name;
        }
      });
    }
  }

  Future<void> _handleUpload() async {
    if (_selectedEventId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an event')),
      );
      return;
    }

    final title = _titleController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide a document title / file name')),
      );
      return;
    }

    setState(() => _isUploading = true);
    try {
      if (_pickedFile != null && _pickedFile!.bytes != null) {
        await ref.read(galleryActionsControllerProvider).uploadDocumentFile(
              eventId: _selectedEventId!,
              academicYear: '2025-26',
              category: _selectedCategory,
              fileName: title,
              bytes: _pickedFile!.bytes!,
            );
      } else if (_urlController.text.trim().isNotEmpty) {
        await ref.read(galleryActionsControllerProvider).saveDocumentLink(
              eventId: _selectedEventId!,
              category: _selectedCategory,
              fileName: title,
              directUrl: _urlController.text.trim(),
            );
      } else {
        throw Exception('Please select a file or enter an external document URL');
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document uploaded successfully to gallery!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final eventsAsync = ref.watch(eventsStreamProvider(const EventFilter()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload to Gallery & Docs'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Associated Event',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 6),
            eventsAsync.when(
              data: (events) {
                if (events.isEmpty) {
                  return const Text('No events available. Please create an event first.');
                }
                _selectedEventId ??= events.first.id;

                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _selectedEventId,
                      items: events.map((e) {
                        return DropdownMenuItem(
                          value: e.id,
                          child: Text(e.title),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() => _selectedEventId = val);
                      },
                    ),
                  ),
                );
              },
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 16),

            // Category Selector
            const Text(
              'Document / Media Category',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
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
                  value: _selectedCategory,
                  items: AppConstants.galleryCategories.map((c) {
                    return DropdownMenuItem(
                      value: c,
                      child: Text(c.toUpperCase()),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedCategory = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            CustomTextField(
              label: 'Document / Asset Title',
              hint: 'e.g. Inauguration Stage Photo / Speaker Voucher',
              controller: _titleController,
            ),
            const SizedBox(height: 20),

            // Pick File Container
            InkWell(
              onTap: _pickFile,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  border: Border.all(
                    color: Theme.of(context).primaryColor.withOpacity(0.4),
                    style: BorderStyle.solid,
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.cloud_upload_outlined,
                        size: 40,
                        color: Theme.of(context).primaryColor,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _pickedFile != null
                            ? 'Selected: ${_pickedFile!.name}'
                            : 'Tap to choose file from device',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: _pickedFile != null
                              ? const Color(0xFF16A34A)
                              : const Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Supports PNG, JPG, MP4, PDF, DOCX',
                        style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            const Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12.0),
                  child: Text('OR PROVIDE DIRECT LINK', style: TextStyle(fontSize: 11, color: Colors.grey)),
                ),
                Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 16),

            CustomTextField(
              label: 'External Drive / Hosted Media URL',
              hint: 'https://drive.google.com/... or https://...',
              controller: _urlController,
              prefixIcon: Icons.link,
            ),
            const SizedBox(height: 32),

            CustomButton(
              label: 'Upload Asset',
              isLoading: _isUploading,
              onPressed: _handleUpload,
            ),
          ],
        ),
      ),
    );
  }
}
