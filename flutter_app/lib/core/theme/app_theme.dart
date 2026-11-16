import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class GeoColors {
  // Botanical Luxury Palette
  static const Color obsidianForest = Color(0xFF051F20); // Root background
  static const Color deepJungle    = Color(0xFF163832); // Card surface
  static const Color emeraldShadow = Color(0xFF235347); // Borders & Secondary
  static const Color sageGlow      = Color(0xFF8EB69B); // Primary Accent & Glow
  static const Color mintChiffon   = Color(0xFFDAF1DE); // Text & Crisp highlight
  static const Color crispCanvas   = Color(0xFFF6FBF7); // Pure High Contrast

  // Telemetry & Status
  static const Color statusGreen   = Color(0xFF10B981);
  static const Color statusAmber   = Color(0xFFF59E0B);
  static const Color statusRuby    = Color(0xFFEF4444);
  static const Color statusCyan    = Color(0xFF06B6D4);
}

class AppTheme {
  static ThemeData get darkBotanical {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: GoogleFonts.inter().fontFamily,
      scaffoldBackgroundColor: GeoColors.obsidianForest,
      primaryColor: GeoColors.sageGlow,
      colorScheme: const ColorScheme.dark(
        primary: GeoColors.sageGlow,
        onPrimary: GeoColors.obsidianForest,
        surface: GeoColors.deepJungle,
        onSurface: GeoColors.mintChiffon,
        secondary: GeoColors.emeraldShadow,
        onSecondary: GeoColors.crispCanvas,
        error: GeoColors.statusRuby,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: GeoColors.obsidianForest,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: GeoColors.crispCanvas,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        iconTheme: IconThemeData(color: GeoColors.mintChiffon),
      ),
      cardTheme: CardThemeData(
        color: GeoColors.deepJungle,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: GeoColors.emeraldShadow, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: GeoColors.deepJungle,
        hintStyle: const TextStyle(
          color: Color(0x80DAF1DE),
          fontSize: 14,
        ),
        labelStyle: const TextStyle(
          color: GeoColors.sageGlow,
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GeoColors.emeraldShadow),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GeoColors.emeraldShadow),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GeoColors.sageGlow, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GeoColors.statusRuby),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GeoColors.statusRuby, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: GeoColors.sageGlow,
          foregroundColor: GeoColors.obsidianForest,
          minimumSize: const Size(double.infinity, 48),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: GeoColors.obsidianForest,
        selectedItemColor: GeoColors.sageGlow,
        unselectedItemColor: Color(0xFF6B8B78),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
