class AppConstants {
  static const String appName = 'GeoHub';
  static const String appTagline = 'Empowering Campus Clubs & Community';

  // Email Restrictions
  static const String allowedEmailDomain = '@college.edu';

  // Role Identifiers
  static const String roleSuperAdmin = 'super_admin';
  static const String roleAdmin = 'admin';
  static const String roleTeamAdmin = 'team_admin';
  static const String roleMember = 'member';
  static const String roleVolunteer = 'volunteer';

  // User Account Status
  static const String statusPending = 'pending';
  static const String statusActive = 'active';
  static const String statusDisabled = 'disabled';

  // Standard Club Teams
  static const List<String> teams = [
    'Management',
    'Promotion',
    'Documentation',
    'Entertainment',
  ];

  // Team Roles examples
  static const List<String> commonTeamRoles = [
    'Lead',
    'Co-Lead',
    'Designer',
    'Content Writer',
    'Photographer',
    'Videographer',
    'Logistics Coordinator',
    'Anchor / Host',
    'Public Relations',
    'Social Media Manager',
  ];

  // Event Categories & Statuses
  static const List<String> eventTypes = [
    'Academic',
    'Cultural',
    'Sports',
    'Technical Workshop',
    'Hackathon',
    'Seminar',
    'Social Drive',
  ];

  static const String eventStatusDraft = 'draft';
  static const String eventStatusSubmitted = 'submitted';
  static const String eventStatusApproved = 'approved';
  static const String eventStatusLive = 'live';
  static const String eventStatusCompleted = 'completed';
  static const String eventStatusArchived = 'archived';

  // Task Statuses
  static const String taskStatusTodo = 'todo';
  static const String taskStatusInProgress = 'in_progress';
  static const String taskStatusDone = 'done';

  // Gallery Document Categories
  static const List<String> galleryCategories = [
    'photos',
    'videos',
    'bills',
    'reports',
  ];

  // Firestore Collection Names
  static const String colUsers = 'users';
  static const String colTeams = 'teams';
  static const String colJoinRequests = 'join_requests';
  static const String colEvents = 'events';
  static const String colEventRegistrations = 'event_registrations';
  static const String colTasks = 'tasks';
  static const String colQrSessions = 'qr_sessions';
  static const String colAttendance = 'attendance';
  static const String colDocuments = 'documents';
  static const String colNotifications = 'notifications';

  // Cloud Functions
  static const String fnAssignTeamAdmin = 'assignTeamAdmin';
  static const String fnSetUserRole = 'setUserRole';
  static const String fnApproveJoinRequest = 'approveJoinRequest';
  static const String fnGenerateEventQr = 'generateEventQr';
  static const String fnMarkAttendanceFromQr = 'markAttendanceFromQr';
}
