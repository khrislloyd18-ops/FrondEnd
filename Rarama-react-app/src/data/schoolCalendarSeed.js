export const SCHOOL_CALENDAR_START_YEAR = 2025;
export const SCHOOL_CALENDAR_END_YEAR = 2027;
export const SCHOOL_CALENDAR_YEARS = Array.from(
  { length: SCHOOL_CALENDAR_END_YEAR - SCHOOL_CALENDAR_START_YEAR + 1 },
  (_, index) => SCHOOL_CALENDAR_START_YEAR + index
);

const createDate = (year, monthIndex, day) => new Date(year, monthIndex, day);

const addDays = (date, amount) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateInput = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return createDate(year, month - 1, day);
  }

  return null;
};

const getNthWeekdayOfMonth = (year, monthIndex, weekday, occurrence) => {
  const date = createDate(year, monthIndex, 1);

  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() + 1);
  }

  date.setDate(date.getDate() + (occurrence - 1) * 7);
  return date;
};

const getLastWeekdayOfMonth = (year, monthIndex, weekday) => {
  const date = createDate(year, monthIndex + 1, 0);

  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1);
  }

  return date;
};

const getBusinessDayOnOrAfter = (date) => {
  const next = normalizeDateInput(date);
  if (!next) return null;

  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const getEasterSunday = (year) => {
  const century = Math.floor(year / 100);
  const yearOfCentury = year % 100;
  const leapCentury = Math.floor(century / 4);
  const centuryRemainder = century % 4;
  const correction = Math.floor((century + 8) / 25);
  const adjustment = Math.floor((century - correction + 1) / 3);
  const goldenNumber = year % 19;
  const epact = (19 * goldenNumber + century - leapCentury - adjustment + 15) % 30;
  const yearLeap = Math.floor(yearOfCentury / 4);
  const yearRemainder = yearOfCentury % 4;
  const weekdayOffset = (32 + 2 * centuryRemainder + 2 * yearLeap - epact - yearRemainder) % 7;
  const monthFactor = Math.floor((goldenNumber + 11 * epact + 22 * weekdayOffset) / 451);
  const month = Math.floor((epact + weekdayOffset - 7 * monthFactor + 114) / 31);
  const day = ((epact + weekdayOffset - 7 * monthFactor + 114) % 31) + 1;

  return createDate(year, month - 1, day);
};

const getRegularAttendancePercentage = (date) => {
  const weekdayBase = [0, 91, 90, 92, 93, 89, 0][date.getDay()] || 88;
  const monthAdjustment = [0, 1, 0, -1, 1, 0, -1, 2, 1, 0, -1, -2][date.getMonth()] || 0;
  return Math.max(84, Math.min(97, weekdayBase + monthAdjustment));
};

const buildEntry = ({ date, dayType, description, attendancePercentage }) => {
  const parsedDate = normalizeDateInput(date);
  if (!parsedDate) return null;

  return {
    date: toDateKey(parsedDate),
    day_type: dayType,
    description,
    attendance_percentage: attendancePercentage,
    day_of_week: parsedDate.toLocaleDateString('en-US', { weekday: 'long' }),
  };
};

const putEntry = (map, payload, priority) => {
  const entry = buildEntry(payload);
  if (!entry) return;

  const existing = map.get(entry.date);
  if (!existing || priority >= existing.priority) {
    map.set(entry.date, { ...entry, priority });
  }
};

const putRange = (map, startDate, endDate, payload, priority) => {
  const start = normalizeDateInput(startDate);
  const end = normalizeDateInput(endDate);
  if (!start || !end) return;

  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cursor <= end) {
    putEntry(map, { ...payload, date: cursor }, priority);
    cursor.setDate(cursor.getDate() + 1);
  }
};

const addPublicHolidays = (map, year) => {
  const fixedHolidays = [
    { month: 0, day: 1, description: "New Year's Day" },
    { month: 1, day: 25, description: 'EDSA People Power Anniversary' },
    { month: 3, day: 9, description: 'Araw ng Kagitingan' },
    { month: 4, day: 1, description: 'Labor Day' },
    { month: 5, day: 12, description: 'Independence Day' },
    { month: 7, day: 21, description: 'Ninoy Aquino Day' },
    { month: 10, day: 1, description: "All Saints' Day" },
    { month: 10, day: 2, description: "All Souls' Day" },
    { month: 10, day: 30, description: 'Bonifacio Day' },
    { month: 11, day: 8, description: 'Feast of the Immaculate Conception' },
    { month: 11, day: 24, description: 'Christmas Eve' },
    { month: 11, day: 25, description: 'Christmas Day' },
    { month: 11, day: 30, description: 'Rizal Day' },
    { month: 11, day: 31, description: 'New Year\'s Eve' },
  ];

  fixedHolidays.forEach((holiday) => {
    putEntry(
      map,
      {
        date: createDate(year, holiday.month, holiday.day),
        dayType: 'holiday',
        description: holiday.description,
        attendancePercentage: 0,
      },
      4
    );
  });

  const nationalHeroesDay = getLastWeekdayOfMonth(year, 7, 1);
  putEntry(
    map,
    {
      date: nationalHeroesDay,
      dayType: 'holiday',
      description: 'National Heroes Day',
      attendancePercentage: 0,
    },
    4
  );

  const easterSunday = getEasterSunday(year);
  const holyWeek = [
    { date: addDays(easterSunday, -3), description: 'Maundy Thursday' },
    { date: addDays(easterSunday, -2), description: 'Good Friday' },
    { date: addDays(easterSunday, -1), description: 'Black Saturday' },
  ];

  holyWeek.forEach((holiday) => {
    putEntry(
      map,
      {
        date: holiday.date,
        dayType: 'holiday',
        description: holiday.description,
        attendancePercentage: 0,
      },
      4
    );
  });
};

const addAcademicMilestones = (map, year) => {
  const secondSemesterRegistration = getBusinessDayOnOrAfter(createDate(year, 0, 6));
  const secondSemesterOpening = addDays(secondSemesterRegistration, 2);
  putRange(
    map,
    secondSemesterRegistration,
    addDays(secondSemesterRegistration, 1),
    {
      dayType: 'event',
      description: 'Second semester registration and advising',
      attendancePercentage: 0,
    },
    2
  );
  putEntry(
    map,
    {
      date: secondSemesterOpening,
      dayType: 'event',
      description: 'Opening of second semester classes',
      attendancePercentage: 0,
    },
    2
  );

  const secondSemesterMidterms = addDays(secondSemesterOpening, 56);
  putRange(
    map,
    secondSemesterMidterms,
    addDays(secondSemesterMidterms, 2),
    {
      dayType: 'exam',
      description: 'Second semester midterm examinations',
      attendancePercentage: 96,
    },
    3
  );

  const researchCongress = getNthWeekdayOfMonth(year, 2, 4, 2);
  putEntry(
    map,
    {
      date: researchCongress,
      dayType: 'event',
      description: 'Research congress and academic showcase',
      attendancePercentage: 0,
    },
    2
  );

  const secondSemesterFinals = getNthWeekdayOfMonth(year, 4, 1, 2);
  putRange(
    map,
    secondSemesterFinals,
    addDays(secondSemesterFinals, 4),
    {
      dayType: 'exam',
      description: 'Second semester final examinations',
      attendancePercentage: 97,
    },
    3
  );
  putRange(
    map,
    addDays(secondSemesterFinals, 5),
    addDays(secondSemesterFinals, 16),
    {
      dayType: 'break',
      description: 'Inter-semester break and enrollment period',
      attendancePercentage: 0,
    },
    1
  );

  const midyearRegistration = getNthWeekdayOfMonth(year, 5, 1, 1);
  const midyearOpening = addDays(midyearRegistration, 2);
  putRange(
    map,
    midyearRegistration,
    addDays(midyearRegistration, 1),
    {
      dayType: 'event',
      description: 'Midyear term registration and orientation',
      attendancePercentage: 0,
    },
    2
  );
  putEntry(
    map,
    {
      date: midyearOpening,
      dayType: 'event',
      description: 'Opening of midyear classes',
      attendancePercentage: 0,
    },
    2
  );

  const midyearFinals = addDays(midyearOpening, 39);
  putRange(
    map,
    midyearFinals,
    addDays(midyearFinals, 2),
    {
      dayType: 'exam',
      description: 'Midyear final examinations',
      attendancePercentage: 95,
    },
    3
  );

  const commencement = getLastWeekdayOfMonth(year, 6, 5);
  putEntry(
    map,
    {
      date: commencement,
      dayType: 'event',
      description: 'Commencement exercises',
      attendancePercentage: 0,
    },
    2
  );
  putRange(
    map,
    addDays(midyearFinals, 3),
    addDays(commencement, -3),
    {
      dayType: 'break',
      description: 'Academic break, admissions, and enrollment period',
      attendancePercentage: 0,
    },
    1
  );

  const firstSemesterRegistration = getNthWeekdayOfMonth(year, 7, 1, 1);
  const firstSemesterOpening = getNthWeekdayOfMonth(year, 7, 1, 2);
  putRange(
    map,
    firstSemesterRegistration,
    addDays(firstSemesterRegistration, 2),
    {
      dayType: 'event',
      description: 'First semester registration and orientation',
      attendancePercentage: 0,
    },
    2
  );
  putEntry(
    map,
    {
      date: firstSemesterOpening,
      dayType: 'event',
      description: 'Opening of first semester classes',
      attendancePercentage: 0,
    },
    2
  );

  const organizationFair = getNthWeekdayOfMonth(year, 8, 5, 2);
  putEntry(
    map,
    {
      date: organizationFair,
      dayType: 'event',
      description: 'Student organization fair',
      attendancePercentage: 0,
    },
    2
  );

  const firstSemesterMidterms = addDays(firstSemesterOpening, 56);
  putRange(
    map,
    firstSemesterMidterms,
    addDays(firstSemesterMidterms, 2),
    {
      dayType: 'exam',
      description: 'First semester midterm examinations',
      attendancePercentage: 96,
    },
    3
  );

  const foundationDay = getNthWeekdayOfMonth(year, 9, 4, 4);
  putRange(
    map,
    foundationDay,
    addDays(foundationDay, 1),
    {
      dayType: 'event',
      description: 'Foundation day and intramurals',
      attendancePercentage: 0,
    },
    2
  );

  const universityWeek = getNthWeekdayOfMonth(year, 10, 1, 2);
  putRange(
    map,
    universityWeek,
    addDays(universityWeek, 2),
    {
      dayType: 'event',
      description: 'University week activities',
      attendancePercentage: 0,
    },
    2
  );

  const firstSemesterFinals = getNthWeekdayOfMonth(year, 11, 1, 2);
  putRange(
    map,
    firstSemesterFinals,
    addDays(firstSemesterFinals, 4),
    {
      dayType: 'exam',
      description: 'First semester final examinations',
      attendancePercentage: 97,
    },
    3
  );
  putRange(
    map,
    addDays(firstSemesterFinals, 5),
    createDate(year, 11, 31),
    {
      dayType: 'break',
      description: 'Christmas break and year-end recess',
      attendancePercentage: 0,
    },
    1
  );
};

export const generateSeededSchoolCalendar = () => {
  const calendarMap = new Map();

  SCHOOL_CALENDAR_YEARS.forEach((year) => {
    const cursor = createDate(year, 0, 1);
    const endOfYear = createDate(year, 11, 31);

    while (cursor <= endOfYear) {
      const isWeekend = cursor.getDay() === 0 || cursor.getDay() === 6;
      putEntry(
        calendarMap,
        {
          date: cursor,
          dayType: isWeekend ? 'break' : 'regular',
          description: isWeekend ? 'Weekend and student wellness break' : 'Regular class day',
          attendancePercentage: isWeekend ? 0 : getRegularAttendancePercentage(cursor),
        },
        0
      );

      cursor.setDate(cursor.getDate() + 1);
    }

    addPublicHolidays(calendarMap, year);
    addAcademicMilestones(calendarMap, year);
  });

  return Array.from(calendarMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ priority, ...entry }) => entry);
};

export const mergeSchoolCalendarEntries = (baseEntries, overrideEntries = []) => {
  const calendarMap = new Map(
    (Array.isArray(baseEntries) ? baseEntries : []).map((entry) => [entry.date, { ...entry, priority: 0 }])
  );

  (Array.isArray(overrideEntries) ? overrideEntries : []).forEach((entry) => {
    const normalizedDate = normalizeDateInput(entry?.date);
    if (!normalizedDate) return;

    const normalizedEntry = buildEntry({
      date: normalizedDate,
      dayType: entry.day_type || 'regular',
      description: entry.description || 'School day entry',
      attendancePercentage: Number.isFinite(Number(entry.attendance_percentage))
        ? Number(entry.attendance_percentage)
        : 0,
    });

    if (!normalizedEntry) return;

    calendarMap.set(normalizedEntry.date, {
      ...normalizedEntry,
      priority: 10,
    });
  });

  return Array.from(calendarMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ priority, ...entry }) => entry);
};