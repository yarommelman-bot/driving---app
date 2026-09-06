import React, { useState, useMemo } from 'react';

// ==========================================
// 1. טיפוסים וממשקים (Types & Interfaces)
// ==========================================

export interface Lesson {
  id: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'approved' | 'pending' | 'rejected';
}

export interface DayTemplate {
  dayOfWeek: number; // 0 = ראשון, 1 = שני...
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

export interface TeacherStats {
  approvedToday: number;
  approvedThisWeek: number;
  approvedThisMonth: number;
  pendingRequests: number;
  totalHoursThisWeek: number;
}

const DAYS_OF_WEEK = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// ==========================================
// 2. רכיב הלוח הראשי (Main Teacher Dashboard)
// ==========================================

export const TeacherDashboard: React.FC = () => {
  // --- מצבי סרגל סטטיסטיקה ---
  const [selectedRange, setSelectedRange] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'lessons' | 'template'>('lessons');

  // --- נתוני דוגמה לשיעורים ---
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: '1', studentName: 'דניאל כהן', date: '2026-09-06', startTime: '08:00', endTime: '08:40', status: 'approved' },
    { id: '2', studentName: 'מיכל לוי', date: '2026-09-06', startTime: '09:00', endTime: '09:40', status: 'approved' },
    { id: '3', studentName: 'עומר אברהם', date: '2026-09-06', startTime: '10:00', endTime: '10:40', status: 'pending' },
    { id: '4', studentName: 'נועה ישראלי', date: '2026-09-07', startTime: '11:00', endTime: '11:40', status: 'approved' },
    { id: '5', studentName: 'איתי שמעוני', date: '2026-09-08', startTime: '14:00', endTime: '14:40', status: 'pending' },
  ]);

  // --- מצב תבנית שעות עבודה ---
  const [slotDuration, setSlotDuration] = useState<number>(40);
  const [weeklySchedule, setWeeklySchedule] = useState<DayTemplate[]>(
    DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      isEnabled: index < 5, // ימים א'-ה' פעילים ברירת מחדל
      startTime: '08:00',
      endTime: '16:00',
    }))
  );

  // --- חישוב סטטיסטיקות בזמן אמת ---
  const stats = useMemo<TeacherStats>(() => {
    const todayStr = '2026-09-06';

    const approvedToday = lessons.filter(l => l.status === 'approved' && l.date === todayStr).length;
    const approvedThisWeek = lessons.filter(l => l.status === 'approved').length;
    const approvedThisMonth = approvedThisWeek + 12;
    const pendingRequests = lessons.filter(l => l.status === 'pending').length;
    
    // חישוב שעות
    const totalHoursThisWeek = Math.round((approvedThisWeek * slotDuration) / 60 * 10) / 10;

    return {
      approvedToday,
      approvedThisWeek,
      approvedThisMonth,
      pendingRequests,
      totalHoursThisWeek,
    };
  }, [lessons, slotDuration]);

  // --- פעולות אישור/דחייה ---
  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    setLessons(prev =>
      prev.map(lesson => (lesson.id === id ? { ...lesson, status: newStatus } : lesson))
    );
  };

  // --- עדכון תבנית יומית ---
  const handleDayToggle = (dayIndex: number) => {
    setWeeklySchedule(prev =>
      prev.map(d => (d.dayOfWeek === dayIndex ? { ...d, isEnabled: !d.isEnabled } : d))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev =>
      prev.map(d => (d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans dir-rtl" dir="rtl">
      {/* ניווט עליון ראשי */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              Drive
            </div>
            <span className="font-bold text-slate-900 text-lg">אזור מורה</span>
          </div>

          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl text-sm font-medium">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'lessons'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ניהול שיעורים
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'template'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              תבנית שעות
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ==========================================
            3. סרגל סטטיסטיקות עליון (Analytics Bar)
           ========================================== */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">שלום, המורה 👋</h1>
              <p className="text-sm text-slate-500 mt-0.5">מבט על על השיעורים והפעילות שלך</p>
            </div>

            {/* כפתורי סינון טווח זמן */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setSelectedRange('day')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === 'day' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                היום
              </button>
              <button
                onClick={() => setSelectedRange('week')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === 'week' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                השבוע
              </button>
              <button
                onClick={() => setSelectedRange('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === 'month' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                החודש
              </button>
            </div>
          </div>

          {/* כרטיסיות נתונים מדורגות */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-xs font-medium text-slate-500 block">
                שיעורים מאושרים ({selectedRange === 'day' ? 'היום' : selectedRange === 'week' ? 'השבוע' : 'החודש'})
              </span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">
                {selectedRange === 'day'
                  ? stats.approvedToday
                  : selectedRange === 'week'
                  ? stats.approvedThisWeek
                  : stats.approvedThisMonth}
              </span>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-xs font-medium text-blue-700 block">ממתינים לאישורך</span>
              <span className="text-3xl font-black text-blue-900 mt-2 block">
                {stats.pendingRequests}
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-xs font-medium text-slate-500 block">סה"כ שעות מתוכננות</span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">
                {stats.totalHoursThisWeek} ש'
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-xs font-medium text-slate-500 block">אחוז אישור פניות</span>
              <span className="text-3xl font-black text-emerald-600 mt-2 block">94%</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. לשונית 1: ניהול ואישור שיעורים
           ========================================== */}
        {activeTab === 'lessons' && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">רשימת שיעורים קרובים</h2>

            <div className="space-y-3">
              {lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-xl border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        lesson.status === 'approved'
                          ? 'bg-emerald-500'
                          : lesson.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-bold text-slate-900">{lesson.studentName}</h3>
                      <p className="text-xs text-slate-500">
                        {lesson.date} | {lesson.startTime} - {lesson.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lesson.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(lesson.id, 'approved')}
                          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                        >
                          אשר שיעור
                        </button>
                        <button
                          onClick={() => handleStatusChange(lesson.id, 'rejected')}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                        >
                          דחה
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                          lesson.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {lesson.status === 'approved' ? 'מאושר' : 'נדחה'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================
            5. לשונית 2: תבנית שעות עבודה (Template)
           ========================================== */}
        {activeTab === 'template' && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">הגדרת תבנית שעות קבועה</h2>
              <p className="text-sm text-slate-500 mt-1">
                הגדר את שעות העבודה שלך כדי שהתלמידים יוכלו לקבוע שיעורים רק בחלונות הזמן הפעילים.
              </p>
            </div>

            {/* הגדרת אורך שיעור */}
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">משך שיעור בודד בדקות:</label>
              <select
                value={slotDuration}
                onChange={e => setSlotDuration(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value={35}>35 דקות</option>
                <option value={40}>40 דקות</option>
                <option value={45}>45 דקות</option>
                <option value={60}>60 דקות</option>
              </select>
            </div>

            {/* ימי השבוע */}
            <div className="space-y-3 mb-8">
              {weeklySchedule.map(day => (
                <div
                  key={day.dayOfWeek}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    day.isEnabled
                      ? 'bg-white border-slate-300'
                      : 'bg-slate-50/50 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={day.isEnabled}
                      onChange={() => handleDayToggle(day.dayOfWeek)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                    />
                    <span className="font-bold text-sm text-slate-900">
                      יום {DAYS_OF_WEEK[day.dayOfWeek]}
                    </span>
                  </div>

                  {day.isEnabled ? (
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>מ-</span>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={e => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>עד-</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={e => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">יום מנוחה</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('תבנית השעות נשמרה בהצלחה!')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99]"
            >
              שמור תבנית שעות
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;