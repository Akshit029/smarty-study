import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart2, Calendar, Clock, Plus, Activity, Layers, Target, Bell, Settings } from 'lucide-react';
import api from '../api';
import AnalyticsChart from '../components/AnalyticsChart';
import TimetableGrid from '../components/TimetableGrid';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [timetables, setTimetables] = useState([]);
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [tasksToSchedule, setTasksToSchedule] = useState([]);
  const [dailyPredictionScore, setDailyPredictionScore] = useState(null);

  // Advanced Features State
  const [timerMode, setTimerMode] = useState('stopwatch'); 
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [dailyGoal, setDailyGoal] = useState(4);
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    if(!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchLogs();
    fetchTimetables();
    fetchDailyPrediction();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs');
      setLogs(data);
    } catch (err) { console.error('Failed to fetch logs', err); }
  }

  const fetchTimetables = async () => {
    try {
      const { data } = await api.get('/timetables');
      setTimetables(data);
    } catch (err) { console.error('Failed to fetch timetables', err); }
  }

  const fetchDailyPrediction = async () => {
    try {
      const currentHour = new Date().getHours();
      const { data } = await api.post('/ml/predict', {
         time_of_day: currentHour,
         duration_minutes: 60,
         mood: 7, 
         distraction_level: 3
      });
      setDailyPredictionScore(data.predicted_efficiency_score);
    } catch (err) { console.error('Failed to predict', err); }
  }

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
           setTimerSeconds(s => {
             if (s <= 1) {
                setIsTimerActive(false);
                if (Notification.permission === 'granted') {
                   new Notification('Pomodoro Complete!', { body: 'Take a break.' });
                }
                return 0;
             }
             return s - 1;
           });
        } else {
           setTimerSeconds(s => s + 1);
        }
      }, 1000);
    } else if (!isTimerActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds, timerMode]);

  const toggleTimer = () => {
    if (!isTimerActive && timerSeconds === 0 && timerMode === 'pomodoro') {
      setTimerSeconds(pomodoroMinutes * 60);
    }
    setIsTimerActive(!isTimerActive);
  };

  const saveSessionLog = async () => {
    setIsTimerActive(false);
    
    let actualElapsedSeconds = timerSeconds;
    if (timerMode === 'pomodoro') {
       actualElapsedSeconds = (pomodoroMinutes * 60) - timerSeconds;
    }

    try {
      if(actualElapsedSeconds < 60) return alert('Session must be at least 1 minute!');
      await api.post('/logs', {
        subject: currentSubject || 'General Study',
        startTime: new Date(Date.now() - actualElapsedSeconds * 1000),
        endTime: new Date(),
        durationMinutes: Math.ceil(actualElapsedSeconds / 60),
        mood: 8, 
        distractionLevel: 3,
        energyLevel: 7
      });
      setTimerSeconds(0);
      setCurrentSubject('');
      fetchLogs();
    } catch (err) { console.error(err); }
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAddTask = () => {
    if(!newTaskTitle) return;
    setTasksToSchedule([...tasksToSchedule, { title: newTaskTitle, subject: currentSubject || 'General', targetDuration: newTaskDuration }]);
    setNewTaskTitle('');
  }

  const generateTimetable = async () => {
    if(tasksToSchedule.length === 0) return alert('Add tasks first!');
    try {
      await api.post('/timetables/generate', {
        date: new Date(),
        tasksToSchedule
      });
      setTasksToSchedule([]);
      fetchTimetables();
    } catch (err) { console.error(err); }
  }

  // Dynamic Aggregation Hooks for the new top-level UI row
  const totalLogs = logs.length;
  const todayHours = useMemo(() => {
    const today = new Date().toDateString();
    return logs
      .filter(log => new Date(log.startTime).toDateString() === today)
      .reduce((acc, log) => acc + (log.durationMinutes || 0), 0) / 60;
  }, [logs]);

  const totalHours = useMemo(() => {
    return logs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0) / 60;
  }, [logs]);

  const avgFocus = useMemo(() => {
     if(logs.length === 0) return 0;
     const total = logs.reduce((acc, log) => acc + (log.energyLevel || 0), 0);
     return (total / logs.length).toFixed(1);
  }, [logs]);

  const chartData = logs.slice(0, 10).map((log) => ({
    date: new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: log.durationMinutes 
  }));

  const activeTimetableTasks = timetables.length > 0 ? timetables[0].tasks.map(t => ({
    id: t._id || Math.random().toString(),
    content: `${t.title} (${t.durationMinutes}m)`,
    type: t.type,
    startTime: t.startTime,
    endTime: t.endTime
  })) : [];

  // Background Reminder Loop
  useEffect(() => {
    const reminderInterval = setInterval(() => {
       if (Notification.permission === 'granted') {
          const now = new Date();
          activeTimetableTasks.forEach(task => {
             if (!task.startTime) return;
             const taskTime = new Date(task.startTime);
             const diffMs = taskTime.getTime() - now.getTime();
             if (diffMs > 0 && diffMs <= 2 * 60 * 1000) { // starting in <= 2 mins
                if (!notifiedTasks.current.has(task.id)) {
                   new Notification('Reminder: Upcoming Task', { body: `${task.content} begins in 2 minutes!` });
                   notifiedTasks.current.add(task.id);
                }
             }
          });
       }
    }, 30000);
    return () => clearInterval(reminderInterval);
  }, [activeTimetableTasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Real-Time Database Metrics Row */}
      <div className="grid grid-3-col">
         <div className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'}}>
            <Clock size={24} color="var(--text-secondary)" style={{marginBottom: '0.5rem'}} />
            <div style={{fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 'bold'}}>{todayHours.toFixed(1)} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>hrs</span></div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((todayHours / dailyGoal) * 100, 100)}%`, height: '100%', background: 'var(--success)' }}></div>
            </div>
            <h4 style={{color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '0.5rem', textAlign: 'center'}}>Today's Goal: {dailyGoal} hrs</h4>
         </div>
         <div className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'}}>
            <Layers size={24} color="var(--text-secondary)" style={{marginBottom: '0.5rem'}} />
            <div style={{fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 'bold'}}>{totalLogs}</div>
            <h4 style={{color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '0.25rem', textAlign: 'center'}}>Lifetimes Sessions</h4>
         </div>
         <div className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'}}>
            <Target size={24} color="var(--text-secondary)" style={{marginBottom: '0.5rem'}} />
            <div style={{fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 'bold'}}>{avgFocus} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/ 10</span></div>
            <h4 style={{color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '0.25rem', textAlign: 'center'}}>Average Focus Rating</h4>
         </div>
      </div>

      <div className="grid">
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <h3>Today's ML Focus Prediction</h3>
             <Activity size={18} color="var(--accent-hover)" />
          </div>
          <div style={{ marginTop: '1rem', fontSize: '4rem', fontWeight: 'bold', color: 'var(--text-primary)', letterSpacing: '-2px' }}>
            {dailyPredictionScore ? `${dailyPredictionScore}%` : '---'}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Based on your historical productivity patterns via Scikit-Learn.</p>
        </div>
        
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <h3>Active Session Timer</h3>
             <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
               <button 
                 className={`btn ${timerMode === 'stopwatch' ? 'btn-primary' : 'btn-secondary'}`} 
                 style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem'}} 
                 onClick={() => { setTimerMode('stopwatch'); setTimerSeconds(0); setIsTimerActive(false); }}>
                 Stopwatch
               </button>
               <button 
                 className={`btn ${timerMode === 'pomodoro' ? 'btn-primary' : 'btn-secondary'}`} 
                 style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem'}} 
                 onClick={() => { setTimerMode('pomodoro'); setTimerSeconds(pomodoroMinutes * 60); setIsTimerActive(false); }}>
                 Pomodoro
               </button>
             </div>
          </div>
          <input 
            className="input" 
            placeholder="Subject (e.g., Math)" 
            value={currentSubject}
            onChange={(e) => setCurrentSubject(e.target.value)} 
            disabled={isTimerActive}
            style={{marginTop: '1.5rem'}}
          />
          <div style={{ fontSize: '3.5rem', fontWeight: 'bold', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '-1px' }}>
            {formatTime(timerSeconds)}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button className={`btn ${isTimerActive ? 'btn-secondary' : 'btn-primary'}`} style={{flex: 1}} onClick={toggleTimer}>
              {isTimerActive ? 'Pause' : 'Start Timer'}
            </button>
            <button className="btn btn-secondary" style={{flex: 1}} onClick={saveSessionLog} disabled={timerSeconds === 0}>
              Save Log
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <h3>Schedule Tasks</h3>
             <Calendar size={18} color="var(--accent-hover)" />
          </div>
          <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', marginTop: '0.5rem'}}>Auto-generate an optimized timetable slotting longest tasks into high-focus blocks.</p>
          <input className="input" placeholder="Task Name" value={newTaskTitle} onChange={(e)=>setNewTaskTitle(e.target.value)} />
          <input className="input" type="number" placeholder="Duration (min)" value={newTaskDuration} onChange={(e)=>setNewTaskDuration(Number(e.target.value))} />
          <button className="btn btn-secondary" style={{width: '100%', marginBottom: '1.5rem'}} onClick={handleAddTask}>
             <Plus size={16}/> Queue Task
          </button>
          
          <ul style={{marginBottom: '1.5rem', color: 'var(--text-primary)', listStyleType: 'none', padding: 0}}>
             {tasksToSchedule.map((t, i) => <li key={i} style={{marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)'}}>{t.title} <span style={{color: 'var(--text-secondary)', float: 'right'}}>{t.targetDuration}m</span></li>)}
          </ul>

          <button className="btn btn-primary" style={{width: '100%'}} onClick={generateTimetable}>
             Generate Timetable
          </button>
        </div>
        
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <TimetableGrid initialData={activeTimetableTasks} />
        </div>
      </div>

      <div className="grid">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 color="var(--text-primary)" />
                  <h3>Productivity Patterns (Mins)</h3>
               </div>
            </div>
            {chartData.length > 0 ? (
               <AnalyticsChart data={chartData} />
            ) : (
               <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 0'}}>No logs recorded yet. Start the timer to generate graph algorithms!</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
