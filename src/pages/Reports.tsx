import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';
import { calculateProductivityScore, getStreak, calculateBurnoutIndicator } from '../utils/helpers';

export default function Reports() {
  const { state, productivityScore, streak, totalXP, levelInfo, earnedBadges } = useApp();

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Smart StudyOS', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic Performance Report', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 12;

    // Student Profile
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Student Profile', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${state.user?.name || 'N/A'}`, 25, y); y += 6;
    doc.text(`Academic Level: ${state.user?.academicLevel || 'N/A'}`, 25, y); y += 6;
    doc.text(`Daily Study Target: ${state.user?.dailyStudyTarget || 0} hours`, 25, y); y += 10;

    // Performance Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Performance Summary', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const totalHours = (state.focusSessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
    const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
    const burnout = calculateBurnoutIndicator(state.focusSessions, state.studyDays);

    doc.text(`Productivity Score: ${productivityScore}/100`, 25, y); y += 6;
    doc.text(`Current Streak: ${streak.current} days (Best: ${streak.best})`, 25, y); y += 6;
    doc.text(`Total Study Hours: ${totalHours}h`, 25, y); y += 6;
    doc.text(`Completed Tasks: ${completedTasks}/${state.tasks.length}`, 25, y); y += 6;
    doc.text(`Focus Sessions: ${state.focusSessions.length}`, 25, y); y += 6;
    doc.text(`Total XP: ${totalXP} (Level ${levelInfo.level} - ${levelInfo.title})`, 25, y); y += 6;
    doc.text(`Burnout Risk: ${burnout === 'healthy' ? 'Healthy' : burnout === 'moderate' ? 'Moderate' : 'High Risk'}`, 25, y); y += 10;

    // Streaks & Badges
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Badges Earned', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const earnedB = earnedBadges.filter(b => b.earnedAt);
    if (earnedB.length === 0) {
      doc.text('No badges earned yet. Keep studying!', 25, y);
    } else {
      earnedB.forEach(b => {
        doc.text(`- ${b.name}: ${b.description}`, 25, y);
        y += 6;
      });
    }
    y += 6;

    // Subject Analysis
    if (state.subjects.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text('Subject Analysis', 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      state.subjects.forEach(s => {
        const tasksForSubject = state.tasks.filter(t => t.subjectId === s.id);
        const completedForSubject = tasksForSubject.filter(t => t.status === 'completed').length;
        doc.text(`- ${s.name}: Weakness ${s.weaknessLevel}/5, Tasks ${completedForSubject}/${tasksForSubject.length}${s.deadline ? `, Deadline: ${s.deadline}` : ''}`, 25, y);
        y += 6;
      });
      y += 4;
    }

    // Weak Subjects
    const weakSubjects = state.subjects.filter(s => s.weaknessLevel >= 4);
    if (weakSubjects.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 50, 50);
      doc.text('Areas Needing Attention', 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      weakSubjects.forEach(s => {
        doc.text(`- ${s.name} (Weakness: ${s.weaknessLevel}/5)`, 25, y);
        y += 6;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Smart StudyOS - AI-Powered Academic Productivity', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`SmartStudyOS_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report downloaded!');
  };

  const totalHours = (state.focusSessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const burnout = calculateBurnoutIndicator(state.focusSessions, state.studyDays);
  const earnedB = earnedBadges.filter(b => b.earnedAt);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reports</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Generate and download performance reports</p>
          </div>
          <button onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </motion.div>

      {/* Preview card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Report Preview</h2>
            <p className="text-xs text-surface-400">This is what your report will include</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">Student Profile</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-surface-400 text-xs">Name</span><p className="text-surface-900 dark:text-white font-medium">{state.user?.name || 'N/A'}</p></div>
              <div><span className="text-surface-400 text-xs">Level</span><p className="text-surface-900 dark:text-white font-medium">{state.user?.academicLevel || 'N/A'}</p></div>
              <div><span className="text-surface-400 text-xs">Target</span><p className="text-surface-900 dark:text-white font-medium">{state.user?.dailyStudyTarget || 0}h/day</p></div>
            </div>
          </div>

          {/* Performance */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-500" />
                <div><span className="text-surface-400 text-xs">Score</span><p className="text-surface-900 dark:text-white font-medium">{productivityScore}/100</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <div><span className="text-surface-400 text-xs">Streak</span><p className="text-surface-900 dark:text-white font-medium">{streak.current} days</p></div>
              </div>
              <div><span className="text-surface-400 text-xs">Hours</span><p className="text-surface-900 dark:text-white font-medium">{totalHours}h</p></div>
              <div><span className="text-surface-400 text-xs">Tasks</span><p className="text-surface-900 dark:text-white font-medium">{completedTasks}/{state.tasks.length}</p></div>
            </div>
          </div>

          {/* Wellness */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">Wellness</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              burnout === 'healthy' ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-300' :
              burnout === 'moderate' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
              'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
            }`}>
              Burnout Risk: {burnout === 'healthy' ? 'Healthy' : burnout === 'moderate' ? 'Moderate' : 'High Risk'}
            </div>
          </div>

          {/* Badges */}
          {earnedB.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">Badges ({earnedB.length})</h3>
              <div className="flex flex-wrap gap-2">
                {earnedB.map(b => (
                  <span key={b.id} className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">{b.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
