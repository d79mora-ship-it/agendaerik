/**
 * DataService — Supabase Database CRUD service
 */

// eslint-disable-next-line no-var
var DataService = (function () {
    'use strict';

    const DEFAULT_LEVEL = '1º ESO';
    let _activeLevel = localStorage.getItem('agenda_active_level') || DEFAULT_LEVEL;

    // We no longer simulate initialization. Supabase handles state.
    async function initialize() { }

    /* ── Helper ── */
    function _getUser() {
        return AuthService.getCurrentUser();
    }

    /* ── Academic Level Management ── */
    function getActiveLevel() {
        return _activeLevel;
    }

    function setActiveLevel(level) {
        _activeLevel = level;
        localStorage.setItem('agenda_active_level', level);
        // Reload the page to fetch the new level data seamlessly
        window.location.reload();
    }

    /* ── Generic CRUD ── */
    async function _getAll(table) {
        if (!window.supabase) return [];
        const user = _getUser();
        if (!user) return [];

        let query = supabase
            .from(table)
            .select('*')
            .eq('user_id', user.id);

        // Filter by academic level if available in the table
        const tablesWithLevels = ['subjects', 'tasks', 'exams', 'schedules', 'grades', 'notes'];
        if (tablesWithLevels.includes(table)) {
            query = query.eq('academic_level', _activeLevel);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error fetching ${table}:`, error);
            return [];
        }
        return data || [];
    }

    async function _create(table, item) {
        if (!window.supabase) return null;
        const user = _getUser();
        if (!user) return null;

        const insertData = { ...item, user_id: user.id };
        const tablesWithLevels = ['subjects', 'tasks', 'exams', 'schedules', 'grades', 'notes'];
        if (tablesWithLevels.includes(table)) {
            insertData.academic_level = _activeLevel;
        }

        const { data, error } = await supabase
            .from(table)
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error(`Error creating in ${table}:`, error);
            return null;
        }
        return data;
    }

    async function _update(table, id, updates) {
        if (!window.supabase) return null;
        const user = _getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating in ${table}:`, error);
            return null;
        }
        return data;
    }

    async function _delete(table, id) {
        if (!window.supabase) return false;
        const user = _getUser();
        if (!user) return false;

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }
        return true;
    }

    /* ── Profile ── */
    async function getProfile() {
        if (!window.supabase) return null;
        const user = _getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // not found
            console.error('Error fetching profile:', error);
        }
        return data;
    }

    async function updateProfile(updates) {
        if (!window.supabase) return null;
        const user = _getUser();
        if (!user) return null;

        // Upsert style because profile might not exist yet if just registered
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return null;
        }
        return data;
    }

    /* ── Subjects ── */
    async function getAllSubjects() { return _getAll('subjects'); }
    async function getSubjectById(id) {
        const subjects = await getAllSubjects();
        return subjects.find(s => s.id === id) || null;
    }
    async function createSubject(subject) { return _create('subjects', subject); }
    async function updateSubject(id, updates) { return _update('subjects', id, updates); }
    async function deleteSubject(id) { return _delete('subjects', id); }

    /* ── Tasks ── */
    async function getAllTasks() { return _getAll('tasks'); }
    async function getTasksByStatus(status) {
        const tasks = await getAllTasks();
        return tasks.filter(t => t.status === status);
    }
    async function getPendingTasksCount() {
        const tasks = await getAllTasks();
        return tasks.filter(t => t.status !== 'done').length;
    }
    async function createTask(task) { return _create('tasks', task); }
    async function updateTask(id, updates) { return _update('tasks', id, { ...updates, updated_at: new Date().toISOString() }); }
    async function deleteTask(id) { return _delete('tasks', id); }

    /* ── Exams ── */
    async function getAllExams() { return _getAll('exams'); }
    async function getUpcomingExams() {
        const today = Helpers.todayStr();
        const exams = await getAllExams();
        return exams
            .filter(e => e.exam_date >= today)
            .sort((a, b) => a.exam_date.localeCompare(b.exam_date));
    }
    async function createExam(exam) { return _create('exams', exam); }
    async function updateExam(id, updates) { return _update('exams', id, updates); }
    async function deleteExam(id) { return _delete('exams', id); }

    /* ── Schedules ── */
    async function getAllSchedules() { return _getAll('schedules'); }

    async function getSchedulesByDay(day) {
        const schedules = await getAllSchedules();
        return schedules.filter(s => s.day_of_week === day);
    }
    async function createSchedule(schedule) { return _create('schedules', schedule); }
    async function updateSchedule(id, updates) { return _update('schedules', id, updates); }
    async function deleteSchedule(id) { return _delete('schedules', id); }

    /* ── Grades ── */
    async function getAllGrades() { return _getAll('grades'); }

    /**
     * Get grades grouped by subject with averages
     * @returns {Promise<Array<{subject: Object, grades: Array, average: number}>>}
     */
    async function getGradesBySubject() {
        const [grades, subjects] = await Promise.all([
            getAllGrades(),
            getAllSubjects()
        ]);

        return subjects.map(subject => {
            const subjectGrades = grades.filter(g => g.subject_id === subject.id);
            return {
                subject,
                grades: subjectGrades.sort((a, b) => (b.graded_at || '').localeCompare(a.graded_at || '')),
                average: Helpers.calculateWeightedAverage(subjectGrades)
            };
        }).filter(g => g.grades.length > 0);
    }

    /**
     * Get overall weighted average across all subjects
     * @returns {Promise<number>}
     */
    async function getOverallAverage() {
        const allGrades = await getAllGrades();
        return Helpers.calculateWeightedAverage(allGrades);
    }

    async function createGrade(grade) { return _create('grades', grade); }
    async function updateGrade(id, updates) { return _update('grades', id, updates); }
    async function deleteGrade(id) { return _delete('grades', id); }

    /* ── Pomodoro Sessions ── */
    async function getPomodoroSessions() { return _getAll('pomodoro_sessions'); }
    async function createPomodoroSession(item) { return _create('pomodoro_sessions', item); }

    /* ── Gamification (XP System) ── */
    async function getXP() {
        const user = _getUser();
        if (!user) return 0;
        const key = `agenda_xp_${user.id}`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    async function addXP(amount) {
        const user = _getUser();
        if (!user) return 0;
        const key = `agenda_xp_${user.id}`;
        let current = parseInt(localStorage.getItem(key) || '0', 10);
        current += amount;
        localStorage.setItem(key, current);
        return current;
    }

    /* ── Notes ── */
    async function getAllNotes() { return _getAll('notes'); }
    async function createNote(note) { return _create('notes', note); }
    async function updateNote(id, updates) { return _update('notes', id, { ...updates, updated_at: new Date().toISOString() }); }
    async function deleteNote(id) { return _delete('notes', id); }

    /**
     * Get task completion percentages per subject
     * @returns {Promise<Array<{subject: Object, total: number, done: number, pct: number}>>}
     */
    async function getSubjectTaskProgress() {
        const [tasks, subjects] = await Promise.all([
            getAllTasks(),
            getAllSubjects()
        ]);

        return subjects.map(subject => {
            const subjectTasks = tasks.filter(t => t.subject_id === subject.id);
            const doneTasks = subjectTasks.filter(t => t.status === 'done');
            const total = subjectTasks.length;
            return {
                subject,
                total,
                done: doneTasks.length,
                pct: total > 0 ? Math.round((doneTasks.length / total) * 100) : 0
            };
        });
    }

    /**
     * Data resets shouldn't happen for Real DB usually, but keeping structure for compat
     */
    async function resetToDefaults() {
        console.log('Reset to defaults is disabled in real Supabase mode');
    }

    return {
        initialize,
        getProfile,
        updateProfile,
        getAllSubjects,
        getSubjectById,
        createSubject,
        updateSubject,
        deleteSubject,
        getAllTasks,
        getTasksByStatus,
        getPendingTasksCount,
        createTask,
        updateTask,
        deleteTask,
        getAllExams,
        getUpcomingExams,
        createExam,
        updateExam,
        deleteExam,
        getAllSchedules,
        getSchedulesByDay,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        getAllGrades,
        getGradesBySubject,
        getOverallAverage,
        createGrade,
        updateGrade,
        deleteGrade,
        getSubjectTaskProgress,
        resetToDefaults,
        getAllNotes,
        createNote,
        updateNote,
        deleteNote,
        getActiveLevel,
        setActiveLevel,
        getXP,
        addXP
    };
})();
