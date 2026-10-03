import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_providers.dart';
import '../../../widgets/app_drawer.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_view.dart';
import '../providers/gallery_providers.dart';

class GalleryScreen extends ConsumerStatefulWidget {
  const GalleryScreen({super.key});

  @override
  ConsumerState<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends ConsumerState<GalleryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: AppConstants.galleryCategories.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProfileProvider).value;
    final canUpload = user?.canUploadGallery ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Club Gallery & Media'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: AppConstants.galleryCategories
              .map((c) => Tab(text: c.toUpperCase()))
              .toList(),
        ),
      ),
      drawer: user != null ? AppDrawer(user: user) : null,
      floatingActionButton: canUpload
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/gallery/upload'),
              icon: const Icon(Icons.cloud_upload_outlined),
              label: const Text('Upload Media'),
            )
          : null,
      body: TabBarView(
        controller: _tabController,
        children: AppConstants.galleryCategories.map((cat) {
          final filter = GalleryFilter(category: cat);
          final docsAsync = ref.watch(documentsStreamProvider(filter));

          return docsAsync.when(
            data: (docs) {
              if (docs.isEmpty) {
                return EmptyStateWidget(
                  icon: cat == 'photos'
                      ? Icons.photo_library_outlined
                      : cat == 'videos'
                          ? Icons.video_library_outlined
                          : Icons.description_outlined,
                  title: 'No ${cat.toUpperCase()} Found',
                  description: canUpload
                      ? 'Upload media and event records using the button below.'
                      : 'No documents have been uploaded to this category yet.',
                  actionLabel: canUpload ? 'Upload Now' : null,
                  onAction: canUpload ? () => context.push('/gallery/upload') : null,
                );
              }

              if (cat == 'photos') {
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1,
                  ),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final item = docs[index];
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        item.downloadUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: const Color(0xFFF1F5F9),
                          child: const Icon(Icons.broken_image, color: Colors.grey),
                        ),
                      ),
                    );
                  },
                );
              }

              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: docs.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = docs[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                        child: Icon(
                          cat == 'videos'
                              ? Icons.play_circle_outline
                              : Icons.insert_drive_file_outlined,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      title: Text(
                        item.fileName,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        'Event ID: ${item.eventId} • Uploaded by ${item.teamId}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.open_in_new),
                        onPressed: () {},
                      ),
                    ),
                  );
                },
              );
            },
            loading: () => const LoadingView(message: 'Loading gallery files...'),
            error: (e, _) => Center(child: Text('Error: $e')),
          );
        }).toList(),
      ),
    );
  }
}
