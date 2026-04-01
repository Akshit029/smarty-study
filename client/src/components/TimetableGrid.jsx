import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TimetableGrid = ({ initialData }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
        setTasks(initialData);
    } else {
        setTasks([{ id: 'mock-1', content: 'No Active Schedule (Use Generator)', type: 'break' }]);
    }
  }, [initialData]);

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
                      backgroundColor: snapshot.isDragging ? 'var(--accent-hover)' : 'var(--bg-secondary)',
                      color: 'white',
                      borderLeft: `4px solid ${task.type === 'break' ? 'var(--warning)' : 'var(--accent-color)'}`,
                      boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.2s',
                      ...provided.draggableProps.style,
                    }}
                  >
                    {task.content}
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
