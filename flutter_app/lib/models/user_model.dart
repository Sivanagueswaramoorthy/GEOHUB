class UserModel {
  final String id;
  final String? rollNo;
  final String email;
  final String name;
  final String role;
  final String? department;
  final String? yearOfStudy;
  final String? phone;
  final bool isVolunteer;
  final String status;

  const UserModel({
    required this.id,
    this.rollNo,
    required this.email,
    required this.name,
    required this.role,
    this.department = 'Geoinformatics Engineering',
    this.yearOfStudy,
    this.phone,
    this.isVolunteer = false,
    this.status = 'active',
  });

  bool get isSuperAdmin => role == 'super_admin';
  bool get isFaculty => role == 'faculty_advisor';
  bool get isCoordinator => role == 'general_coordinator';
  bool get isTreasurer => role == 'treasurer';
  bool get isLead => role.endsWith('_lead');

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      rollNo: json['roll_no']?.toString(),
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Scholar',
      role: json['role']?.toString() ?? 'student',
      department: json['department']?.toString() ?? 'Geoinformatics Engineering',
      yearOfStudy: json['year_of_study']?.toString(),
      phone: json['phone']?.toString(),
      isVolunteer: json['is_volunteer'] == true,
      status: json['status']?.toString() ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'roll_no': rollNo,
      'email': email,
      'name': name,
      'role': role,
      'department': department,
      'year_of_study': yearOfStudy,
      'phone': phone,
      'is_volunteer': isVolunteer,
      'status': status,
    };
  }
}
