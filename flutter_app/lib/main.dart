import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/network/api_client.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure edge-to-edge transparent system overlay
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: GeoColors.obsidianForest,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Dio API client
  ApiClient.init();

  runApp(
    const ProviderScope(
      child: GeoHubMobileApp(),
    ),
  );
}

class GeoHubMobileApp extends ConsumerWidget {
  const GeoHubMobileApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'GeoHub Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkBotanical,
      routerConfig: router,
    );
  }
}
