import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Bell, BellRing, Clock } from 'lucide-react';

const TimetableGrid = ({ initialData }) => {
  const [tasks, setTasks] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState(new Set());

  useEffect(() => {
    if (initialData && initialData.length > 0) {
        setTasks(initialData);
    } else {
        setTasks([{ id: 'mock-1', content: 'No Active Schedule (Use Generator)', type: 'break' }]);
    }
  }, [initialData]);

  const toggleAlarm = (taskId, taskContent) => {
     setActiveAlarms(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
           newSet.delete(taskId);
        } else {
           newSet.add(taskId);
           if (Notification.permission === 'granted') {
              new Notification('Alarm Set', { body: `Custom reminder set for ${taskContent}` });
           }
        }
        return newSet;
     });
  };

  const formatTime = (isoString) => {
     if (!isoString) return '';
     return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="timetable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '1rem', minHeight: '300px' }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Interactive Schedule Grid</h3>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: 'none',
                      padding: '1rem 1.5rem',
                      margin: '0 0 12px 0',
                      borderRadius: '0.75rem',
                      backgroundColor: snapshot.isDragging ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderLeft: `4px solid ${task.type === 'break' ? 'var(--warning)' : 'var(--accent-color)'}`,
                      boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: '600' }}>{task.content}</span>
                       <button 
                         onClick={() => toggleAlarm(task.id, task.content)}
                         style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeAlarms.has(task.id) ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                         title="Toggle Manual Reminder"
                         aria-label="Toggle Reminder"
                       >
                          {activeAlarms.has(task.id) ? <BellRing size={16} /> : <Bell size={16} />}
                       </button>
                    </div>
                    {task.startTime && task.endTime && (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                           <Clock size={14} />
                           {formatTime(task.startTime)} - {formatTime(task.endTime)}
                       </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TimetableGrid;
