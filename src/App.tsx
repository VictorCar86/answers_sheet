import { DarkModeProvider } from './contexts/DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';
import ExamAnswerSheet from './components/ExamAnswerSheet';

function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <DarkModeToggle />
        <ExamAnswerSheet />
      </div>
    </DarkModeProvider>
  );
}

export default App;
