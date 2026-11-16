import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submitLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authProvider.notifier).login(
          _identifierController.text,
          _passwordController.text,
        );

    if (success && mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: GeoColors.obsidianForest,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Branding & Crest
                    Center(
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: GeoColors.deepJungle,
                          shape: BoxShape.circle,
                          border: Border.all(color: GeoColors.emeraldShadow, width: 2),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x268EB69B),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.eco_rounded,
                          size: 38,
                          color: GeoColors.sageGlow,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'GEO HUB',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: GeoColors.crispCanvas,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Department of Geoinformatics',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xB2DAF1DE),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 36),

                    // Card Wrapper
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: GeoColors.deepJungle,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: GeoColors.emeraldShadow),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Sign In',
                            style: TextStyle(
                              color: GeoColors.crispCanvas,
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Enter your roll number or executive credentials.',
                            style: TextStyle(
                              color: Color(0xA6DAF1DE),
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Error Banner
                          if (authState.errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0x1FEF4444),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: const Color(0x80EF4444),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.error_outline_rounded,
                                    color: GeoColors.statusRuby,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      authState.errorMessage!,
                                      style: const TextStyle(
                                        color: GeoColors.crispCanvas,
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 18),
                          ],

                          // Roll No / Identifier Field
                          TextFormField(
                            controller: _identifierController,
                            textCapitalization: TextCapitalization.characters,
                            keyboardType: TextInputType.text,
                            style: const TextStyle(color: GeoColors.crispCanvas),
                            decoration: const InputDecoration(
                              labelText: 'Roll Number or Email',
                              hintText: 'e.g. 23IT001 or SA01',
                              prefixIcon: Icon(Icons.badge_outlined, color: GeoColors.sageGlow, size: 20),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please enter your roll number or email.';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 18),

                          // Password Field
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            style: const TextStyle(color: GeoColors.crispCanvas),
                            decoration: InputDecoration(
                              labelText: 'Password',
                              hintText: 'Enter account password',
                              prefixIcon: const Icon(Icons.lock_outline_rounded, color: GeoColors.sageGlow, size: 20),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                  color: const Color(0x99DAF1DE),
                                  size: 20,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your password.';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // Submit Button
                          ElevatedButton(
                            onPressed: authState.isLoading ? null : _submitLogin,
                            child: authState.isLoading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      valueColor: AlwaysStoppedAnimation(GeoColors.obsidianForest),
                                    ),
                                  )
                                : const Text('Access Portal'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Footer note
                    const Center(
                      child: Text(
                        'GeoHub Mobile • Powered by Python FastAPI & TiDB Cloud',
                        style: TextStyle(
                          color: Color(0x66DAF1DE),
                          fontSize: 11.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
