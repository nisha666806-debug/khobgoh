// Khobgoh Translations dictionary (Tajik & English) v2.4
export const translations = {
  tg: {
    brand_title: "Хобгоҳ",
    brand_subtitle: "Идоракунии Хобгоҳ",
    role_manager: "Мудир (Админ)",
    role_head: "Сармураббӣ",
    role_supervisor: "Мураббӣ",
    role_student: "Талаба",

    // Nav
    nav_dashboard: "Панели асосӣ",
    nav_students: "Талабагон",
    nav_rooms: "Ҳуҷраҳо",
    nav_attendance: "Давомот",
    nav_activities: "Ҷадвали фаъолиятҳо",
    nav_violations: "Қоидавайронкунӣ",
    nav_cleanliness: "Озмуни тозагӣ",
    nav_roster: "Навбатдорӣ",
    nav_tea: "Чойнӯшӣ",
    nav_settings: "Танзимот",

    // Dashboard
    dash_total_students: "Ҳамаи талабагон",
    dash_occupancy: "Ҷойҳои бандшуда",
    dash_vacant_beds: "Ҷойҳои холӣ",
    dash_attendance_today: "Давомоти имрӯз",
    dash_supervisor_on_duty: "Мураббии навбатдори имрӯз",
    dash_quick_actions: "Амалҳои фаврӣ",
    dash_weekly_attendance: "Омори давомоти ҳафтаина",
    dash_recent_activity: "Ҳаракатҳои охирин",
    dash_btn_add_student: "Иловаи талаба",
    dash_btn_mark_attendance: "Сабти давомот",
    dash_btn_report_violation: "Сабти қоидавайронкунӣ",

    // Students / Residents (Талабагон)
    students_title: "Рӯйхати талабагон",
    students_subtitle: "Идоракунии истиқоматкунандагон ва сабти ҷойҳо",
    students_search: "Ҷустуҷӯ аз рӯи ном ё ID...",
    students_filter_room: "Ҳамаи ҳуҷраҳо",
    students_filter_status: "Ҳамаи вазъиятҳо",
    students_col_name: "Ному насаб",
    students_col_room: "Ҳуҷра",
    students_col_bed: "Ҷой",
    students_col_course: "Синф / Гурӯҳ",
    students_col_phone: "Телефон",
    students_col_status: "Ҳолат",
    students_col_actions: "Амалҳо",
    students_status_active: "Фаъол",
    students_status_absent: "Ғоиб",
    students_status_transferred: "Кӯчида",
    students_status_removed: "Хориҷшуда",
    students_btn_add: "+ Талабаи нав",
    students_btn_print_id: "Корти талаба",

    // Rooms
    rooms_title: "Ҳуҷраҳо ва катҳо",
    rooms_subtitle: "Харитаи ҷойгиршавӣ, сардорони ҳуҷра ва мураббиён",
    rooms_student_rooms: "Ҳуҷраҳои талабагон",
    rooms_supervisor_rooms: "Ҳуҷраҳои мураббиён",
    rooms_bed: "Ҷой",
    rooms_vacant: "Холӣ",
    rooms_btn_assign: "Таъин кардани ҷой",
    room_leader: "Сардори ҳуҷра",

    // Activities
    act_title: "Ҷадвали фаъолиятҳо",
    act_subtitle: "Фаъолиятҳои ҳаррӯзаи синфҳо дар рӯзҳои ҳафта",
    act_btn_add: "+ Иловаи фаъолият",
    act_class: "Синф / Гурӯҳ",
    act_time: "Вақт",
    act_activity: "Фаъолият / Дарс",
    act_room: "Макон",

    // Attendance
    att_title: "Давомоти ҳаррӯза",
    att_subtitle: "Санҷиш ва сабти ҳузури талабагон дар хобгоҳ",
    att_date: "Сана",
    att_btn_all_present: "Ҳама ҳастанд",
    att_btn_export: "Боргирии ҳисобот",
    att_present: "Ҳаст (Ҳозир)",
    att_absent: "Нест (Ғоиб)",
    att_absent_list_title: "⚠️ Талабаҳое, ки имрӯз дар хобгоҳ нестанд:",

    // Violations (бидуни дараҷа)
    viol_title: "Қоидавайронкунӣ ва интизом",
    viol_subtitle: "Баҳисобгирии огоҳиномаҳо ва чораҳои интизомӣ",
    viol_btn_add: "+ Сабти қоидавайронкунӣ",
    viol_col_student: "Талаба",
    viol_col_room: "Ҳуҷра",
    viol_col_date: "Сана",
    viol_col_reason: "Сабаб / Санад",
    viol_col_status: "Ҳолат",
    viol_status_pending: "Баррасишаванда",
    viol_status_resolved: "Ҳалшуда",

    // Cleanliness
    clean_title: "Озмуни тозагии ҳуҷраҳо",
    clean_subtitle: "Рейтинги ҳафтаинаи тозагӣ ва тартибот аз рӯи 5 меъёр (50 хол)",
    clean_podium_gold: "Ҷойи 1-ум (Ғолиб)",
    clean_podium_silver: "Ҷойи 2-юм",
    clean_podium_bronze: "Ҷойи 3-юм",
    clean_btn_rate: "+ Баҳогузории ҳуҷра",
    clean_inspector: "Масъули озмуни тозагӣ",
    clean_pts_max: "аз 50 хол",

    // Cleanliness 5 criteria
    clean_c1: "Намуди умумии ҳуҷра (макс. 15)",
    clean_c2: "Ҷевонҳо (макс. 10)",
    clean_c3: "Ҷойи хоб (макс. 10)",
    clean_c4: "Чанги ҳуҷра (макс. 10)",
    clean_c5: "Тароват ва ҳаво (макс. 5)",

    // Roster
    roster_title: "Ҷадвали навбатдорӣ",
    roster_subtitle: "Ҷадвали ҳафтаинаи навбатдории мураббиён",
    roster_alert_active: "🔔 Шумо имрӯз мураббии навбатдори хобгоҳ ҳастед!",
    roster_today: "Навбатдори имрӯз",

    // Tea & Kitchen
    tea_title: "Чойнӯшӣ ва ошхона",
    tea_subtitle: "Навбатдории самовор, хӯрок ва захираи маҳсулот",
    tea_samovar_duty: "Навбатдори чой",
    tea_recipes: "Ресептҳои чой ва нӯшокиҳо",

    // Settings
    settings_title: "Танзимоти система",
    settings_subtitle: "Идоракунии профил, масъулон ва нусхабардорӣ",
    settings_theme: "Намуди зоҳирӣ (Theme)",
    settings_lang: "Забон (Language)",
    settings_active_role: "Нақши фаъол (Role Simulator)",
    settings_clean_inspector: "Масъули тозагӣ (Inspector)",
    settings_backup_title: "Нусхабардорӣ ва барқароркунӣ",
    settings_btn_export_json: "Нусхабардорӣ (Export JSON)",
    settings_btn_import_json: "Воридоти додаҳо (Import JSON)",
    settings_btn_reset_demo: "Барқароркунии додаҳои намунавӣ (Reset)",

    // Common
    save: "Сабт кардан",
    cancel: "Бекор кардан",
    delete: "Нобуд кардан",
    edit: "Таҳрир",
    view: "Дидан",
    close: "Пӯшидан",
    confirm: "Тасдиқ",
    success_saved: "Бо муваффақият сабт шуд!",
    logout: "Баромадан"
  },
  en: {
    brand_title: "Khobgoh",
    brand_subtitle: "Dormitory Management",
    role_manager: "Manager (Admin)",
    role_head: "Head Supervisor",
    role_supervisor: "Supervisor",
    role_student: "Student",

    // Nav
    nav_dashboard: "Dashboard",
    nav_students: "Students",
    nav_rooms: "Rooms & Beds",
    nav_attendance: "Attendance",
    nav_activities: "Activities Matrix",
    nav_violations: "Violations",
    nav_cleanliness: "Cleanliness Cup",
    nav_roster: "Duty Roster",
    nav_tea: "Kitchen & Tea",
    nav_settings: "Settings",

    // Dashboard
    dash_total_students: "Total Students",
    dash_occupancy: "Occupied Beds",
    dash_vacant_beds: "Vacant Beds",
    dash_attendance_today: "Today's Attendance",
    dash_supervisor_on_duty: "Supervisor On Duty Today",
    dash_quick_actions: "Quick Actions",
    dash_weekly_attendance: "Weekly Attendance Overview",
    dash_recent_activity: "Recent Activity Log",
    dash_btn_add_student: "New Student",
    dash_btn_mark_attendance: "Take Attendance",
    dash_btn_report_violation: "Report Infraction",

    // Students
    students_title: "Students Directory",
    students_subtitle: "Manage room assignments, student records, and status",
    students_search: "Search by name or ID...",
    students_filter_room: "All Rooms",
    students_filter_status: "All Statuses",
    students_col_name: "Full Name",
    students_col_room: "Room",
    students_col_bed: "Bed",
    students_col_course: "Class / Grade",
    students_col_phone: "Phone",
    students_col_status: "Status",
    students_col_actions: "Actions",
    students_status_active: "Active",
    students_status_absent: "Absent",
    students_status_transferred: "Transferred",
    students_status_removed: "Withdrawn",
    students_btn_add: "+ New Student",
    students_btn_print_id: "Print ID Pass",

    // Rooms
    rooms_title: "Rooms & Bed Layout",
    rooms_subtitle: "Interactive visual bed occupancy map, supervisors and leaders",
    rooms_student_rooms: "Student Dormitories",
    rooms_supervisor_rooms: "Supervisor Quarters",
    rooms_bed: "Bed",
    rooms_vacant: "Vacant",
    rooms_btn_assign: "Assign Bed",
    room_leader: "Room Leader",

    // Activities
    act_title: "Daily Activities Matrix",
    act_subtitle: "Weekly class-specific schedules and routines",
    act_btn_add: "+ Add Activity",
    act_class: "Class / Grade",
    act_time: "Time",
    act_activity: "Activity / Class",
    act_room: "Location",

    // Attendance
    att_title: "Daily Attendance Sheet",
    att_subtitle: "Verification of present and absent students",
    att_date: "Date",
    att_btn_all_present: "Mark All Present",
    att_btn_export: "Export Log",
    att_present: "Present",
    att_absent: "Absent",
    att_absent_list_title: "⚠️ Students absent from dormitory today:",

    // Violations
    viol_title: "Discipline & Violations",
    viol_subtitle: "Track conduct notices and disciplinary measures",
    viol_btn_add: "+ Report Infraction",
    viol_col_student: "Student",
    viol_col_room: "Room",
    viol_col_date: "Date",
    viol_col_reason: "Reason / Incident",
    viol_col_status: "Status",
    viol_status_pending: "Pending",
    viol_status_resolved: "Resolved",

    // Cleanliness
    clean_title: "Room Cleanliness Cup",
    clean_subtitle: "Weekly hygiene leaderboard evaluated across 5 criteria (50 pts)",
    clean_podium_gold: "1st Place (Champion)",
    clean_podium_silver: "2nd Place",
    clean_podium_bronze: "3rd Place",
    clean_btn_rate: "+ Inspect Room",
    clean_inspector: "Designated Inspector",
    clean_pts_max: "out of 50 pts",

    // Cleanliness 5 criteria
    clean_c1: "General room appearance (max 15)",
    clean_c2: "Wardrobes & closets (max 10)",
    clean_c3: "Beds & bedding (max 10)",
    clean_c4: "Dust & surfaces (max 10)",
    clean_c5: "Freshness & air (max 5)",

    // Roster
    roster_title: "Weekly Duty Roster",
    roster_subtitle: "Shift assignments and daily notifications",
    roster_alert_active: "🔔 You are on duty as dormitory supervisor today!",
    roster_today: "Supervisor on Duty",

    // Tea & Kitchen
    tea_title: "Kitchen & Tea Time",
    tea_subtitle: "Samovar duties, traditional teas, and kitchen stock",
    tea_samovar_duty: "Tea Duty Today",
    tea_recipes: "Tea Recipes & Blends",

    // Settings
    settings_title: "System Settings",
    settings_subtitle: "Profile, designated roles, and backup",
    settings_theme: "Theme",
    settings_lang: "Language",
    settings_active_role: "Active Role (Simulator)",
    settings_clean_inspector: "Cleanliness Inspector",
    settings_backup_title: "Backup & Restore",
    settings_btn_export_json: "Export Backup (JSON)",
    settings_btn_import_json: "Import Data (JSON)",
    settings_btn_reset_demo: "Reset to Demo Data",

    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    confirm: "Confirm",
    success_saved: "Successfully saved!",
    logout: "Log Out"
  }
};
