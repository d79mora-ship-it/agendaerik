/**
 * Demo Data — Pre-populated seed data for standalone mode
 * All data mirrors the Supabase schema structure
 */

// eslint-disable-next-line no-var
var DemoData = (function () {
  'use strict';

  const DEMO_USER_ID = 'demo-user-001';

  /** @type {import('./types').Profile} */
  const profile = {
    id: DEMO_USER_ID,
    full_name: 'Erik',
    avatar_url: null,
    school_name: 'Instituto de Tecnología',
    grade_level: '2° ESO',
    created_at: '2025-09-01T08:00:00Z',
    updated_at: new Date().toISOString()
  };

  /** @type {import('./types').Subject[]} */
  const subjects = [
    { id: 'sub-001', user_id: DEMO_USER_ID, name: 'Lengua', teacher_name: 'Prof. López', color: '#22c55e', room: 'B-203', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-002', user_id: DEMO_USER_ID, name: 'Mates', teacher_name: 'Prof. García', color: '#6366f1', room: 'A-101', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-003', user_id: DEMO_USER_ID, name: 'E.F', teacher_name: 'Prof. Ruiz', color: '#ef4444', room: 'Gimnasio', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-004', user_id: DEMO_USER_ID, name: 'Plástica', teacher_name: 'Prof. Navarro', color: '#ec4899', room: 'Taller-1', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-005', user_id: DEMO_USER_ID, name: 'TIC', teacher_name: 'Prof. Torres', color: '#8b5cf6', room: 'Lab-2', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-006', user_id: DEMO_USER_ID, name: 'Historia', teacher_name: 'Prof. Hernández', color: '#f59e0b', room: 'C-105', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-007', user_id: DEMO_USER_ID, name: 'Inglés', teacher_name: 'Prof. Smith', color: '#06b6d4', room: 'B-110', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-008', user_id: DEMO_USER_ID, name: 'Francés', teacher_name: 'Prof. Dupont', color: '#14b8a6', room: 'B-112', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-009', user_id: DEMO_USER_ID, name: 'Música', teacher_name: 'Prof. Vega', color: '#a855f7', room: 'Aula Música', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-010', user_id: DEMO_USER_ID, name: 'Biología', teacher_name: 'Prof. Martínez', color: '#10b981', room: 'Lab-1', created_at: '2025-09-01T08:00:00Z' },
    { id: 'sub-011', user_id: DEMO_USER_ID, name: 'Valores', teacher_name: 'Prof. Ramos', color: '#f97316', room: 'C-102', created_at: '2025-09-01T08:00:00Z' }
  ];

  /** @type {import('./types').Task[]} */
  const tasks = [
    { id: 'task-001', user_id: DEMO_USER_ID, subject_id: 'sub-002', title: 'Resolver ejercicios de ecuaciones', description: 'Páginas 45-48 del libro', status: 'pending', priority: 'high', due_date: _futureDate(2), created_at: _pastDate(1), updated_at: _pastDate(1) },
    { id: 'task-002', user_id: DEMO_USER_ID, subject_id: 'sub-010', title: 'Informe de laboratorio: célula', description: 'Dibujar y describir las partes de la célula', status: 'in_progress', priority: 'medium', due_date: _futureDate(3), created_at: _pastDate(3), updated_at: _pastDate(0) },
    { id: 'task-003', user_id: DEMO_USER_ID, subject_id: 'sub-001', title: 'Ensayo sobre Don Quijote', description: 'Mínimo 1500 palabras, análisis del capítulo 8', status: 'pending', priority: 'high', due_date: _futureDate(5), created_at: _pastDate(2), updated_at: _pastDate(2) },
    { id: 'task-004', user_id: DEMO_USER_ID, subject_id: 'sub-005', title: 'Proyecto página web', description: 'Crear landing page con HTML y CSS', status: 'in_progress', priority: 'high', due_date: _futureDate(7), created_at: _pastDate(5), updated_at: _pastDate(0) },
    { id: 'task-005', user_id: DEMO_USER_ID, subject_id: 'sub-006', title: 'Línea temporal: Guerra Civil', description: 'Crear infografía con fechas clave', status: 'done', priority: 'medium', due_date: _pastDate(1), created_at: _pastDate(7), updated_at: _pastDate(1) },
    { id: 'task-006', user_id: DEMO_USER_ID, subject_id: 'sub-007', title: 'Reading comprehension B2', description: 'Complete exercises 1-5 from unit 7', status: 'done', priority: 'low', due_date: _pastDate(2), created_at: _pastDate(6), updated_at: _pastDate(2) },
    { id: 'task-007', user_id: DEMO_USER_ID, subject_id: 'sub-002', title: 'Problemas de geometría', description: 'Ejercicios 12-20 áreas y perímetros', status: 'pending', priority: 'medium', due_date: _futureDate(4), created_at: _pastDate(1), updated_at: _pastDate(1) },
    { id: 'task-008', user_id: DEMO_USER_ID, subject_id: 'sub-008', title: 'Rédaction: Ma ville', description: 'Escribir 200 palabras sobre tu ciudad en francés', status: 'in_progress', priority: 'medium', due_date: _futureDate(3), created_at: _pastDate(3), updated_at: _pastDate(0) },
    { id: 'task-009', user_id: DEMO_USER_ID, subject_id: 'sub-005', title: 'Presentación sobre ciberseguridad', description: 'PowerPoint de 10 diapositivas', status: 'pending', priority: 'medium', due_date: _futureDate(6), created_at: _pastDate(2), updated_at: _pastDate(2) },
    { id: 'task-010', user_id: DEMO_USER_ID, subject_id: 'sub-007', title: 'Prepare oral presentation', description: 'Topic: Technology in education, 5 min', status: 'in_progress', priority: 'high', due_date: _futureDate(1), created_at: _pastDate(4), updated_at: _pastDate(0) },
    { id: 'task-011', user_id: DEMO_USER_ID, subject_id: 'sub-004', title: 'Lámina de perspectiva', description: 'Dibujo en perspectiva cónica', status: 'pending', priority: 'low', due_date: _futureDate(8), created_at: _pastDate(2), updated_at: _pastDate(2) },
    { id: 'task-012', user_id: DEMO_USER_ID, subject_id: 'sub-009', title: 'Análisis de pieza musical', description: 'Analizar estructura de "Las cuatro estaciones"', status: 'done', priority: 'medium', due_date: _pastDate(3), created_at: _pastDate(8), updated_at: _pastDate(3) },
    { id: 'task-013', user_id: DEMO_USER_ID, subject_id: 'sub-011', title: 'Trabajo sobre ética digital', description: 'Reflexión 500 palabras sobre uso responsable de redes sociales', status: 'pending', priority: 'low', due_date: _futureDate(9), created_at: _pastDate(1), updated_at: _pastDate(1) }
  ];

  /** @type {import('./types').Exam[]} */
  const exams = [
    { id: 'exam-001', user_id: DEMO_USER_ID, subject_id: 'sub-002', title: 'Parcial de Ecuaciones', exam_date: _futureDate(5), location: 'A-101', notes: 'Temas: ecuaciones 1er y 2do grado', created_at: _pastDate(5) },
    { id: 'exam-002', user_id: DEMO_USER_ID, subject_id: 'sub-010', title: 'Examen de Biología: La Célula', exam_date: _futureDate(8), location: 'Lab-1', notes: 'Incluye parte práctica con microscopio', created_at: _pastDate(3) },
    { id: 'exam-003', user_id: DEMO_USER_ID, subject_id: 'sub-001', title: 'Control de lectura', exam_date: _futureDate(3), location: 'B-203', notes: 'Don Quijote, capítulos 1-12', created_at: _pastDate(7) },
    { id: 'exam-004', user_id: DEMO_USER_ID, subject_id: 'sub-005', title: 'Evaluación práctica: HTML/CSS', exam_date: _futureDate(14), location: 'Lab-2', notes: 'Crear una web desde cero en 1 hora', created_at: _pastDate(2) },
    { id: 'exam-005', user_id: DEMO_USER_ID, subject_id: 'sub-007', title: 'B2 Listening + Writing', exam_date: _futureDate(6), location: 'B-110', notes: 'Bring headphones', created_at: _pastDate(4) },
    { id: 'exam-006', user_id: DEMO_USER_ID, subject_id: 'sub-006', title: 'Examen de Historia: Edad Moderna', exam_date: _futureDate(10), location: 'C-105', notes: 'Desde el Renacimiento hasta la Revolución Francesa', created_at: _pastDate(3) },
    { id: 'exam-007', user_id: DEMO_USER_ID, subject_id: 'sub-008', title: 'Examen de Francés: Unité 5', exam_date: _futureDate(12), location: 'B-112', notes: 'Vocabulaire, grammaire et rédaction', created_at: _pastDate(2) },
    { id: 'exam-008', user_id: DEMO_USER_ID, subject_id: 'sub-009', title: 'Examen de Música: Teoría musical', exam_date: _futureDate(18), location: 'Aula Música', notes: 'Notas, escalas y compases', created_at: _pastDate(1) },
    { id: 'exam-009', user_id: DEMO_USER_ID, subject_id: 'sub-003', title: 'Test de resistencia', exam_date: _futureDate(4), location: 'Gimnasio', notes: 'Course de 2km + circuito de fuerza', created_at: _pastDate(6) },
    { id: 'exam-010', user_id: DEMO_USER_ID, subject_id: 'sub-004', title: 'Entrega láminas Plástica', exam_date: _futureDate(16), location: 'Taller-1', notes: 'Portfolio completo del trimestre', created_at: _pastDate(4) },
    { id: 'exam-011', user_id: DEMO_USER_ID, subject_id: 'sub-011', title: 'Debate: Valores éticos', exam_date: _futureDate(20), location: 'C-102', notes: 'Tema: Igualdad y diversidad', created_at: _pastDate(2) }
  ];

  /** @type {import('./types').ScheduleEntry[]} */
  const schedules = [
    // Monday (0)
    { id: 'sch-001', user_id: DEMO_USER_ID, subject_id: 'sub-002', day_of_week: 0, start_time: '08:00', end_time: '09:00', room: 'A-101' },
    { id: 'sch-002', user_id: DEMO_USER_ID, subject_id: 'sub-001', day_of_week: 0, start_time: '09:00', end_time: '10:00', room: 'B-203' },
    { id: 'sch-003', user_id: DEMO_USER_ID, subject_id: 'sub-007', day_of_week: 0, start_time: '10:30', end_time: '11:30', room: 'B-110' },
    { id: 'sch-004', user_id: DEMO_USER_ID, subject_id: 'sub-003', day_of_week: 0, start_time: '11:30', end_time: '12:30', room: 'Gimnasio' },
    { id: 'sch-005', user_id: DEMO_USER_ID, subject_id: 'sub-010', day_of_week: 0, start_time: '12:30', end_time: '13:30', room: 'Lab-1' },
    // Tuesday (1)
    { id: 'sch-006', user_id: DEMO_USER_ID, subject_id: 'sub-006', day_of_week: 1, start_time: '08:00', end_time: '09:00', room: 'C-105' },
    { id: 'sch-007', user_id: DEMO_USER_ID, subject_id: 'sub-005', day_of_week: 1, start_time: '09:00', end_time: '10:00', room: 'Lab-2' },
    { id: 'sch-008', user_id: DEMO_USER_ID, subject_id: 'sub-008', day_of_week: 1, start_time: '10:30', end_time: '11:30', room: 'B-112' },
    { id: 'sch-009', user_id: DEMO_USER_ID, subject_id: 'sub-004', day_of_week: 1, start_time: '11:30', end_time: '12:30', room: 'Taller-1' },
    { id: 'sch-010', user_id: DEMO_USER_ID, subject_id: 'sub-009', day_of_week: 1, start_time: '12:30', end_time: '13:30', room: 'Aula Música' },
    // Wednesday (2)
    { id: 'sch-011', user_id: DEMO_USER_ID, subject_id: 'sub-002', day_of_week: 2, start_time: '08:00', end_time: '09:00', room: 'A-101' },
    { id: 'sch-012', user_id: DEMO_USER_ID, subject_id: 'sub-010', day_of_week: 2, start_time: '09:00', end_time: '10:00', room: 'Lab-1' },
    { id: 'sch-013', user_id: DEMO_USER_ID, subject_id: 'sub-001', day_of_week: 2, start_time: '10:30', end_time: '11:30', room: 'B-203' },
    { id: 'sch-014', user_id: DEMO_USER_ID, subject_id: 'sub-011', day_of_week: 2, start_time: '11:30', end_time: '12:30', room: 'C-102' },
    { id: 'sch-015', user_id: DEMO_USER_ID, subject_id: 'sub-007', day_of_week: 2, start_time: '12:30', end_time: '13:30', room: 'B-110' },
    // Thursday (3)
    { id: 'sch-016', user_id: DEMO_USER_ID, subject_id: 'sub-003', day_of_week: 3, start_time: '08:00', end_time: '09:00', room: 'Gimnasio' },
    { id: 'sch-017', user_id: DEMO_USER_ID, subject_id: 'sub-006', day_of_week: 3, start_time: '09:00', end_time: '10:00', room: 'C-105' },
    { id: 'sch-018', user_id: DEMO_USER_ID, subject_id: 'sub-005', day_of_week: 3, start_time: '10:30', end_time: '11:30', room: 'Lab-2' },
    { id: 'sch-019', user_id: DEMO_USER_ID, subject_id: 'sub-008', day_of_week: 3, start_time: '11:30', end_time: '12:30', room: 'B-112' },
    { id: 'sch-020', user_id: DEMO_USER_ID, subject_id: 'sub-002', day_of_week: 3, start_time: '12:30', end_time: '13:30', room: 'A-101' },
    // Friday (4)
    { id: 'sch-021', user_id: DEMO_USER_ID, subject_id: 'sub-001', day_of_week: 4, start_time: '08:00', end_time: '09:00', room: 'B-203' },
    { id: 'sch-022', user_id: DEMO_USER_ID, subject_id: 'sub-009', day_of_week: 4, start_time: '09:00', end_time: '10:00', room: 'Aula Música' },
    { id: 'sch-023', user_id: DEMO_USER_ID, subject_id: 'sub-004', day_of_week: 4, start_time: '10:30', end_time: '11:30', room: 'Taller-1' },
    { id: 'sch-024', user_id: DEMO_USER_ID, subject_id: 'sub-007', day_of_week: 4, start_time: '11:30', end_time: '12:30', room: 'B-110' },
    { id: 'sch-025', user_id: DEMO_USER_ID, subject_id: 'sub-010', day_of_week: 4, start_time: '12:30', end_time: '13:30', room: 'Lab-1' },
    // Custom one-off events
    { id: 'sch-026', user_id: DEMO_USER_ID, subject_id: null, custom_name: 'Visita Museo', day_of_week: 2, date: _futureDate(2), start_time: '10:30', end_time: '13:30', room: 'Centro' },
    { id: 'sch-027', user_id: DEMO_USER_ID, subject_id: null, custom_name: 'Tutoría Especial', day_of_week: 4, date: _futureDate(4), start_time: '14:00', end_time: '14:45', room: 'B-101' }
  ];

  /** @type {import('./types').Grade[]} */
  const grades = [
    { id: 'gr-001', user_id: DEMO_USER_ID, subject_id: 'sub-002', title: 'Parcial 1: Álgebra', score: 8.5, max_score: 10, weight: 1.0, graded_at: _pastDate(30) },
    { id: 'gr-002', user_id: DEMO_USER_ID, subject_id: 'sub-002', title: 'Trabajo práctico', score: 9.0, max_score: 10, weight: 0.5, graded_at: _pastDate(20) },
    { id: 'gr-003', user_id: DEMO_USER_ID, subject_id: 'sub-010', title: 'Parcial 1: Seres vivos', score: 7.5, max_score: 10, weight: 1.0, graded_at: _pastDate(25) },
    { id: 'gr-004', user_id: DEMO_USER_ID, subject_id: 'sub-010', title: 'Informe de laboratorio', score: 9.2, max_score: 10, weight: 0.5, graded_at: _pastDate(15) },
    { id: 'gr-005', user_id: DEMO_USER_ID, subject_id: 'sub-001', title: 'Análisis literario', score: 8.0, max_score: 10, weight: 1.0, graded_at: _pastDate(28) },
    { id: 'gr-006', user_id: DEMO_USER_ID, subject_id: 'sub-006', title: 'Examen: Edad Media', score: 7.0, max_score: 10, weight: 1.0, graded_at: _pastDate(22) },
    { id: 'gr-007', user_id: DEMO_USER_ID, subject_id: 'sub-006', title: 'Presentación oral', score: 8.5, max_score: 10, weight: 0.5, graded_at: _pastDate(12) },
    { id: 'gr-008', user_id: DEMO_USER_ID, subject_id: 'sub-007', title: 'Writing test', score: 8.8, max_score: 10, weight: 1.0, graded_at: _pastDate(18) },
    { id: 'gr-009', user_id: DEMO_USER_ID, subject_id: 'sub-005', title: 'Proyecto: Landing page', score: 9.5, max_score: 10, weight: 1.0, graded_at: _pastDate(10) },
    { id: 'gr-010', user_id: DEMO_USER_ID, subject_id: 'sub-005', title: 'Quiz: HTML', score: 8.0, max_score: 10, weight: 0.5, graded_at: _pastDate(20) },
    { id: 'gr-011', user_id: DEMO_USER_ID, subject_id: 'sub-008', title: 'Dictée', score: 7.8, max_score: 10, weight: 1.0, graded_at: _pastDate(14) },
    { id: 'gr-012', user_id: DEMO_USER_ID, subject_id: 'sub-009', title: 'Interpretación flauta', score: 8.2, max_score: 10, weight: 1.0, graded_at: _pastDate(16) },
    { id: 'gr-013', user_id: DEMO_USER_ID, subject_id: 'sub-003', title: 'Test de resistencia', score: 9.0, max_score: 10, weight: 1.0, graded_at: _pastDate(18) },
    { id: 'gr-014', user_id: DEMO_USER_ID, subject_id: 'sub-004', title: 'Lámina perspectiva', score: 7.5, max_score: 10, weight: 1.0, graded_at: _pastDate(12) },
    { id: 'gr-015', user_id: DEMO_USER_ID, subject_id: 'sub-011', title: 'Trabajo: Derechos humanos', score: 8.8, max_score: 10, weight: 1.0, graded_at: _pastDate(10) }
  ];

  /* ── Helpers ── */
  function _futureDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function _pastDate(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  return {
    DEMO_USER_ID,
    profile,
    subjects,
    tasks,
    exams,
    schedules,
    grades
  };
})();
