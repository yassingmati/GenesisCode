exports.validateExerciseStructure = (exercise) => {
  const validTypes = ['QCM', 'DragDrop', 'TextInput', 'Code'];
  
  if (!validTypes.includes(exercise.type)) {
    return { valid: false, message: 'Invalid exercise type' };
  }

  if (exercise.type === 'QCM') {
    if (!exercise.answers || exercise.answers.length < 2) {
      return { valid: false, message: 'QCM requires at least 2 answers' };
    }
    
    const correctAnswers = exercise.answers.filter(a => a.correct).length;
    if (correctAnswers === 0) {
      return { valid: false, message: 'QCM requires at least 1 correct answer' };
    }
  }

  return { valid: true };
};