import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../models/join_request_model.dart';
import '../providers/team_providers.dart';

class PendingJoinRequestsDialog extends ConsumerStatefulWidget {
  final String teamName;

  const PendingJoinRequestsDialog({super.key, required this.teamName});

  @override
  ConsumerState<PendingJoinRequestsDialog> createState() =>
      _PendingJoinRequestsDialogState();
}

class _PendingJoinRequestsDialogState
    extends ConsumerState<PendingJoinRequestsDialog> {
  final Map<String, String> _selectedRoles = {};
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(pendingJoinRequestsProvider(widget.teamName));

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 600),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Join Requests (${widget.teamName})',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(),
            Expanded(
              child: requestsAsync.when(
                data: (requests) {
                  if (requests.isEmpty) {
                    return const Center(
                      child: Text('No pending join requests for this team.'),
                    );
                  }

                  return ListView.separated(
                    itemCount: requests.length,
                    separatorBuilder: (_, __) => const Divider(),
                    itemBuilder: (context, index) {
                      final req = requests[index];
                      final currentRole = _selectedRoles[req.id] ??
                          req.requestedRole ??
                          AppConstants.commonTeamRoles.first;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            req.userName,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            req.userEmail,
                            style: const TextStyle(
                                color: Color(0xFF64748B), fontSize: 13),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              const Text('Assign Team Role: ',
                                  style: TextStyle(fontSize: 13)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: DropdownButton<String>(
                                  isExpanded: true,
                                  value: currentRole,
                                  items: AppConstants.commonTeamRoles
                                      .map((r) => DropdownMenuItem(
                                            value: r,
                                            child: Text(r,
                                                style: const TextStyle(fontSize: 13)),
                                          ))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() {
                                        _selectedRoles[req.id] = val;
                                      });
                                    }
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton(
                                onPressed: _isProcessing
                                    ? null
                                    : () async {
                                        setState(() => _isProcessing = true);
                                        try {
                                          await ref
                                              .read(teamActionsControllerProvider)
                                              .rejectJoinRequest(requestId: req.id);
                                        } finally {
                                          if (mounted) {
                                            setState(() => _isProcessing = false);
                                          }
                                        }
                                      },
                                child: const Text('Reject',
                                    style: TextStyle(color: Colors.red)),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton(
                                onPressed: _isProcessing
                                    ? null
                                    : () async {
                                        setState(() => _isProcessing = true);
                                        try {
                                          await ref
                                              .read(teamActionsControllerProvider)
                                              .approveJoinRequest(
                                                requestId: req.id,
                                                teamRole: currentRole,
                                              );
                                          if (mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text(
                                                    'Approved ${req.userName} as $currentRole'),
                                              ),
                                            );
                                          }
                                        } catch (e) {
                                          if (mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Failed: $e'),
                                                backgroundColor: Colors.red,
                                              ),
                                            );
                                          }
                                        } finally {
                                          if (mounted) {
                                            setState(() => _isProcessing = false);
                                          }
                                        }
                                      },
                                child: const Text('Approve & Add'),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
