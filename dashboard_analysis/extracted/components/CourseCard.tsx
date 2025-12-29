
import React from 'react';
import { Course } from '../types';

interface Props {
  course: Course;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group card-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl shadow-lg`}>
          {course.icon}
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
          {course.category} <span className="text-white ml-2">{course.progress}%</span>
        </div>
      </div>
      
      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-300 transition-colors">{course.title}</h3>
      <p className="text-sm text-gray-400 mb-4">{course.completedExercises}/{course.totalExercises} exercices terminés</p>
      
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${course.color} transition-all duration-1000`} 
          style={{ width: `${course.progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CourseCard;
