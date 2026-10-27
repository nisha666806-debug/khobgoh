// Khobgoh default seed data v2.2
export const initialData = {
  // App designations
  cleanlinessInspectorId: "sup_1", // Default designated inspector (Сарвар Усмонов)
  roomLeaders: {
    "101": "std_101_1", // Рустам Назаров
    "102": "std_102_1", // Беҳрӯз Раҳимов
    "103": "std_103_1", // Муҳаммадҷон Ғафуров
    "104": "std_104_1", // Олимҷон Сафаров
    "105": "std_105_1", // Амир Ҳамидов
    "106": "std_106_1", // Шоҳрух Қосимов
    "107": "std_107_1"  // Парвиз Холов
  },

  rooms: [
    { id: "101", name: "Ҳуҷраи 101", floor: 1, type: "student", capacity: 8 },
    { id: "102", name: "Ҳуҷраи 102", floor: 1, type: "student", capacity: 8 },
    { id: "103", name: "Ҳуҷраи 103", floor: 1, type: "student", capacity: 8 },
    { id: "104", name: "Ҳуҷраи 104", floor: 1, type: "student", capacity: 8 },
    { id: "105", name: "Ҳуҷраи 105", floor: 2, type: "student", capacity: 8 },
    { id: "106", name: "Ҳуҷраи 106", floor: 2, type: "student", capacity: 8 },
    { id: "107", name: "Ҳуҷраи 107", floor: 2, type: "student", capacity: 8 },
    { id: "201", name: "Мураббиён 201", floor: 2, type: "supervisor", capacity: 4 },
    { id: "202", name: "Мураббиён 202", floor: 2, type: "supervisor", capacity: 4 },
    { id: "203", name: "Мураббиён 203", floor: 2, type: "supervisor", capacity: 4 }
  ],

  supervisors: [
    { id: "sup_1", name: "Сарвар Усмонов", email: "sarvar@khobgoh.tj", phone: "+992 900 11 22 33", role: "head", room: "201", bed: 1 },
    { id: "sup_2", name: "Бахтиёр Шарипов", email: "bakhtiyor@khobgoh.tj", phone: "+992 918 44 55 66", role: "supervisor", room: "201", bed: 2 },
    { id: "sup_3", name: "Нигина Холова", email: "nigina@khobgoh.tj", phone: "+992 927 77 88 99", role: "supervisor", room: "202", bed: 1 },
    { id: "sup_4", name: "Давлат Ҷабборов", email: "davlat@khobgoh.tj", phone: "+992 935 00 11 22", role: "supervisor", room: "203", bed: 1 }
  ],

  students: [
    { id: "std_101_1", name: "Рустам Назаров", studentId: "KH-2024-01", room: "101", bed: 1, course: "Синфи 10-А", phone: "+992 901 23 45 67", admissionDate: "2024-09-01", status: "Active", guardian: "Назаров Карим (+992 900 12 34 56)" },
    { id: "std_101_2", name: "Дилшод Каримов", studentId: "KH-2024-02", room: "101", bed: 2, course: "Синфи 10-А", phone: "+992 902 34 56 78", admissionDate: "2024-09-01", status: "Active", guardian: "Каримова Зебо (+992 901 98 76 54)" },
    { id: "std_101_3", name: "Фаридун Саидов", studentId: "KH-2024-03", room: "101", bed: 3, course: "Синфи 10-Б", phone: "+992 903 45 67 89", admissionDate: "2024-09-02", status: "Active", guardian: "Саидов Аҳмад (+992 902 11 22 33)" },
    { id: "std_101_4", name: "Алишер Мирзоев", studentId: "KH-2024-04", room: "101", bed: 4, course: "Синфи 10-Б", phone: "+992 904 56 78 90", admissionDate: "2024-09-02", status: "Active", guardian: "Мирзоев Ҷамшед (+992 903 22 33 44)" },

    { id: "std_102_1", name: "Беҳрӯз Раҳимов", studentId: "KH-2024-05", room: "102", bed: 1, course: "Синфи 11-А", phone: "+992 905 67 89 01", admissionDate: "2024-09-01", status: "Active", guardian: "Раҳимова Сабоҳат (+992 904 33 44 55)" },
    { id: "std_102_2", name: "Шаҳром Ҷӯраев", studentId: "KH-2024-06", room: "102", bed: 2, course: "Синфи 11-А", phone: "+992 906 78 90 12", admissionDate: "2024-09-01", status: "Absent", guardian: "Ҷӯраев Ғаффор (+992 905 44 55 66)" },
    { id: "std_102_3", name: "Комрон Ҳасанов", studentId: "KH-2024-07", room: "102", bed: 3, course: "Синфи 11-Б", phone: "+992 907 89 01 23", admissionDate: "2024-09-03", status: "Active", guardian: "Ҳасанов Тоҳир (+992 906 55 66 77)" },
    { id: "std_102_4", name: "Далер Зокиров", studentId: "KH-2024-08", room: "102", bed: 4, course: "Синфи 11-Б", phone: "+992 908 90 12 34", admissionDate: "2024-09-03", status: "Active", guardian: "Зокирова Малоҳат (+992 907 66 77 88)" },

    { id: "std_103_1", name: "Муҳаммадҷон Ғафуров", studentId: "KH-2024-09", room: "103", bed: 1, course: "Синфи 9-А", phone: "+992 911 11 22 33", admissionDate: "2024-09-01", status: "Active", guardian: "Ғафуров Солеҳ (+992 911 22 33 44)" },
    { id: "std_103_2", name: "Сино Сатторов", studentId: "KH-2024-10", room: "103", bed: 2, course: "Синфи 9-А", phone: "+992 912 22 33 44", admissionDate: "2024-09-01", status: "Absent", guardian: "Сатторова Мунира (+992 912 33 44 55)" },
    { id: "std_103_3", name: "Ҷаҳонгир Юсуфов", studentId: "KH-2024-11", room: "103", bed: 3, course: "Синфи 9-Б", phone: "+992 913 33 44 55", admissionDate: "2024-09-02", status: "Active", guardian: "Юсуфов Раҷаб (+992 913 44 55 66)" },

    { id: "std_104_1", name: "Олимҷон Сафаров", studentId: "KH-2024-12", room: "104", bed: 1, course: "Синфи 8-А", phone: "+992 914 44 55 66", admissionDate: "2024-09-01", status: "Active", guardian: "Сафаров Исмоил (+992 914 55 66 77)" },
    { id: "std_104_2", name: "Хуршед Маҳмудов", studentId: "KH-2024-13", room: "104", bed: 2, course: "Синфи 8-А", phone: "+992 915 55 66 77", admissionDate: "2024-09-01", status: "Active", guardian: "Маҳмудова Нилуфар (+992 915 66 77 88)" },
    { id: "std_104_3", name: "Сӯҳроб Давлатов", studentId: "KH-2024-14", room: "104", bed: 3, course: "Синфи 8-Б", phone: "+992 916 66 77 88", admissionDate: "2024-09-04", status: "Active", guardian: "Давлатов Баҳодур (+992 916 77 88 99)" },

    { id: "std_105_1", name: "Амир Ҳамидов", studentId: "KH-2024-15", room: "105", bed: 1, course: "Синфи 10-А", phone: "+992 917 77 88 99", admissionDate: "2024-09-01", status: "Active", guardian: "Ҳамидов Шоҳин (+992 917 88 99 00)" },
    { id: "std_105_2", name: "Умар Самадов", studentId: "KH-2024-16", room: "105", bed: 2, course: "Синфи 10-А", phone: "+992 918 88 99 00", admissionDate: "2024-09-01", status: "Active", guardian: "Самадова Гулчеҳра (+992 918 99 00 11)" },

    { id: "std_106_1", name: "Шоҳрух Қосимов", studentId: "KH-2024-17", room: "106", bed: 1, course: "Синфи 11-Б", phone: "+992 919 99 00 11", admissionDate: "2024-09-01", status: "Active", guardian: "Қосимов Валӣ (+992 919 00 11 22)" },
    { id: "std_106_2", name: "Зокир Набиев", studentId: "KH-2024-18", room: "106", bed: 2, course: "Синфи 11-Б", phone: "+992 920 00 11 22", admissionDate: "2024-09-02", status: "Active", guardian: "Набиев Абдулло (+992 920 11 22 33)" },

    { id: "std_107_1", name: "Парвиз Холов", studentId: "KH-2024-19", room: "107", bed: 1, course: "Синфи 9-А", phone: "+992 921 11 22 33", admissionDate: "2024-09-01", status: "Active", guardian: "Холов Шариф (+992 921 22 33 44)" },
    { id: "std_107_2", name: "Фирӯз Бобоев", studentId: "KH-2024-20", room: "107", bed: 2, course: "Синфи 9-А", phone: "+992 922 22 33 44", admissionDate: "2024-09-01", status: "Active", guardian: "Бобоева Рухшона (+992 922 33 44 55)" }
  ],

  // Class activities matrix across weekdays
  activities: [
    { id: "act_1", day: "mon", class: "Синфи 8", time: "15:00 - 16:30", activity: "Тайёрии вазифаи хонагӣ (Математика ва Физика)", location: "Китобхонаи ошёнаи 1" },
    { id: "act_2", day: "mon", class: "Синфи 9", time: "16:30 - 18:00", activity: "Машғулияти варзишӣ (Футзал)", location: "Майдончаи варзишӣ" },
    { id: "act_3", day: "mon", class: "Синфи 10", time: "15:30 - 17:00", activity: "Клуби забони англисӣ (Speaking Club)", location: "Толори маҷлисгоҳ" },
    { id: "act_4", day: "mon", class: "Синфи 11", time: "17:00 - 18:30", activity: "Омодагӣ ба озмунҳо ва ММТ", location: "Ҳуҷраи компютерӣ" },

    { id: "act_5", day: "tue", class: "Синфи 8", time: "16:00 - 17:30", activity: "Машғулияти расмкашӣ ва эҷодиёт", location: "Ошёнаи 1" },
    { id: "act_6", day: "tue", class: "Синфи 9", time: "15:00 - 16:30", activity: "Омӯзиши фанҳои табиӣ (Химия/Биология)", location: "Озмоишгоҳ" },
    { id: "act_7", day: "tue", class: "Синфи 10", time: "16:30 - 18:00", activity: "Шахмат ва бозиҳои мантиқӣ", location: "Клуб" },
    { id: "act_8", day: "tue", class: "Синфи 11", time: "15:30 - 17:00", activity: "Худомӯзии барномасозӣ (IT/Coding)", location: "Синфхонаи IT" }
  ],

  attendance: {
    "2026-10-27": {
      "std_101_1": "present",
      "std_101_2": "present",
      "std_101_3": "present",
      "std_101_4": "present",
      "std_102_1": "present",
      "std_102_2": "absent",  // Ғоиб
      "std_102_3": "present",
      "std_102_4": "present",
      "std_103_1": "present",
      "std_103_2": "absent",  // Ғоиб
      "std_103_3": "present",
      "std_104_1": "present",
      "std_104_2": "present",
      "std_104_3": "present",
      "std_105_1": "present",
      "std_105_2": "present",
      "std_106_1": "present",
      "std_106_2": "present",
      "std_107_1": "present",
      "std_107_2": "present"
    }
  },

  violations: [
    {
      id: "viol_1",
      studentId: "std_102_2",
      studentName: "Шаҳром Ҷӯраев",
      room: "102",
      date: "2026-10-26",
      reason: "Дер омадан ба хобгоҳ баъд аз соати 21:30 бе иҷозатнома",
      severity: "medium",
      status: "pending",
      reporter: "Сарвар Усмонов"
    },
    {
      id: "viol_2",
      studentId: "std_101_3",
      studentName: "Фаридун Саидов",
      room: "101",
      date: "2026-10-24",
      reason: "Истифодаи асбобҳои гармидиҳандаи барқӣ дар ҳуҷра",
      severity: "low",
      status: "resolved",
      reporter: "Бахтиёр Шарипов"
    }
  ],

  // 5 criteria scoring: Appearance(15) + Wardrobes(10) + Beds(10) + Dust(10) + Air(5) = 50 total
  cleanliness: [
    { room: "101", score: 48, appearance: 15, wardrobes: 10, beds: 10, dust: 9, air: 4, rank: 1, notes: "Намунавӣ ва хеле тоза" },
    { room: "104", score: 46, appearance: 14, wardrobes: 9, beds: 10, dust: 9, air: 4, rank: 2, notes: "Тартиботи аъло" },
    { room: "102", score: 44, appearance: 13, wardrobes: 9, beds: 9, dust: 9, air: 4, rank: 3, notes: "Тозагии хуб" },
    { room: "106", score: 41, appearance: 12, wardrobes: 8, beds: 9, dust: 8, air: 4, rank: 4, notes: "Чанд либос дар рӯи кат буд" },
    { room: "103", score: 39, appearance: 11, wardrobes: 8, beds: 8, dust: 8, air: 4, rank: 5, notes: "Тирезаҳо кушода шаванд" },
    { room: "105", score: 37, appearance: 10, wardrobes: 7, beds: 8, dust: 8, air: 4, rank: 6, notes: "Китобҳо дар ҷояш гузошта шавад" },
    { room: "107", score: 35, appearance: 10, wardrobes: 7, beds: 7, dust: 7, air: 4, rank: 7, notes: "Фарш тоза карда шавад" }
  ],

  roster: [
    { day: "mon", label: "Душанбе", supervisorId: "sup_1", supervisorName: "Сарвар Усмонов", phone: "+992 900 11 22 33", active: false },
    { day: "tue", label: "Сешанбе", supervisorId: "sup_2", supervisorName: "Бахтиёр Шарипов", phone: "+992 918 44 55 66", active: true },
    { day: "wed", label: "Чоршанбе", supervisorId: "sup_3", supervisorName: "Нигина Холова", phone: "+992 927 77 88 99", active: false },
    { day: "thu", label: "Панҷшанбе", supervisorId: "sup_4", supervisorName: "Давлат Ҷабборов", phone: "+992 935 00 11 22", active: false },
    { day: "fri", label: "Ҷумъа", supervisorId: "sup_1", supervisorName: "Сарвар Усмонов", phone: "+992 900 11 22 33", active: false },
    { day: "sat", label: "Шанбе", supervisorId: "sup_2", supervisorName: "Бахтиёр Шарипов", phone: "+992 918 44 55 66", active: false },
    { day: "sun", label: "Якшанбе", supervisorId: "sup_3", supervisorName: "Нигина Холова", phone: "+992 927 77 88 99", active: false }
  ],

  tea: {
    todayDuty: "Ҳуҷраи 102 (Шаҳром Ҷӯраев)",
    samovarStatus: "Омода ва гарм",
    recipes: [
      { name: "Чойи кабуди кӯҳӣ бо лиму", ingredients: "Чойи сабз 95, райҳон, пудинаи кӯҳӣ, лиму", time: "10 дақиқа дам хӯрдан" },
      { name: "Чойи сиёҳ бо шир (Ширчой)", ingredients: "Чойи сиёҳ, шири тару тоза, маска, каме намак", time: "15 дақиқа ҷӯшондан" },
      { name: "Чойи занҷабил ва асал", ingredients: "Занҷабил (имбирь), оби ҷӯш, асали табиӣ, дорчин", time: "8 дақиқа дам хӯрдан" }
    ],
    schedule: [
      { meal: "Чойи субҳона", time: "07:00 - 08:00", description: "Нон, маска, асал, тухм, ширчой ва чойи сиёҳ" },
      { meal: "Чойи шомгоҳӣ", time: "17:30 - 18:30", description: "Чойи кабуд, қандолот, меваи хушк" },
      { meal: "Чойи шабона", time: "21:00 - 21:30", description: "Чойи оромбахши гиёҳӣ пеш аз хоб" }
    ]
  }
};
