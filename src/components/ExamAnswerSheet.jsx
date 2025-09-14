import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Download, RotateCcw, X } from 'lucide-react';

const ExamAnswerSheet = () => {
  const [numQuestions, setNumQuestions] = useState(20);
  const [answers, setAnswers] = useState({});
  const [correctness, setCorrectness] = useState({});
  const [optionsPerQuestion, setOptionsPerQuestion] = useState(4);
  const hasHydrated = useRef(false);

  // Función para validar datos del localStorage
  const validateLocalStorageData = (data, type) => {
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      if (type === 'answers' || type === 'correctness') {
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return null;
        }
        for (const key in parsed) {
          if (isNaN(parseInt(key, 10)) || parseInt(key, 10) <= 0) {
            return null;
          }
        }
      }
      return parsed;
    } catch (error) {
      console.error(`Error parsing ${type} from localStorage:`, error);
      return null;
    }
  };

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedAnswers = localStorage.getItem('examAnswers');
    const savedCorrectness = localStorage.getItem('examCorrectness');
    const savedNumQuestions = localStorage.getItem('examNumQuestions');
    const savedOptionsPerQuestion = localStorage.getItem('examOptionsPerQuestion');

    // Validar y cargar respuestas
    const validAnswers = validateLocalStorageData(savedAnswers, 'answers');
    if (validAnswers) {
      setAnswers(validAnswers);
    }

    // Validar y cargar evaluaciones de correctness
    const validCorrectness = validateLocalStorageData(savedCorrectness, 'correctness');
    if (validCorrectness) {
      setCorrectness(validCorrectness);
    }

    // Validar y cargar número de preguntas
    if (savedNumQuestions) {
      const numQ = parseInt(savedNumQuestions, 10);
      if (!isNaN(numQ) && numQ > 0 && numQ <= 200) {
        setNumQuestions(numQ);
      }
    }

    // Validar y cargar opciones por pregunta
    if (savedOptionsPerQuestion) {
      const optionsNum = parseInt(savedOptionsPerQuestion, 10);
      if (!isNaN(optionsNum) && optionsNum >= 3 && optionsNum <= 6) {
        setOptionsPerQuestion(optionsNum);
      }
    }

    // Importante: no activar hasHydrated aquí para evitar escrituras en el mismo ciclo de efectos
  }, []);

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('examAnswers', JSON.stringify(answers));
  }, [answers]);

  // Guardar evaluación de correctness en localStorage cuando cambie
  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('examCorrectness', JSON.stringify(correctness));
  }, [correctness]);

  // Guardar número de preguntas en localStorage cuando cambie
  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('examNumQuestions', numQuestions.toString());
  }, [numQuestions]);

  // Guardar opciones por pregunta en localStorage cuando cambie
  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('examOptionsPerQuestion', optionsPerQuestion.toString());
  }, [optionsPerQuestion]);

  // Habilitar escrituras en localStorage tras el primer pintado
  useEffect(() => {
    hasHydrated.current = true;
  }, []);

  // Generar las opciones de respuesta (A, B, C, D, E, etc.)
  const generateOptions = (numOptions) => {
    return Array.from({ length: numOptions }, (_, i) =>
      String.fromCharCode(65 + i) // A=65, B=66, etc.
    );
  };

  // Manejar la selección de respuesta
  const handleAnswerChange = (questionNum, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: selectedOption
    }));
  };

  // Manejar si la respuesta es correcta o incorrecta
  const handleCorrectnessChange = (questionNum, isCorrect) => {
    setCorrectness(prev => ({
      ...prev,
      [questionNum]: isCorrect
    }));
  };

  // Limpiar respuesta individual de una pregunta específica
  const clearIndividualAnswer = (questionNum) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionNum];
      return newAnswers;
    });
  };

  // Limpiar evaluación de correctness individual de una pregunta específica
  const clearIndividualCorrectness = (questionNum) => {
    setCorrectness(prev => {
      const newCorrectness = { ...prev };
      delete newCorrectness[questionNum];
      return newCorrectness;
    });
  };

  // Aumentar número de preguntas
  const increaseQuestions = () => {
    setNumQuestions(prev => prev + 5);
  };

  // Disminuir número de preguntas
  const decreaseQuestions = () => {
    if (numQuestions > 5) {
      setNumQuestions(prev => prev - 5);
      // Limpiar respuestas de preguntas eliminadas
      setAnswers(prev => {
        const newAnswers = { ...prev };
        for (let i = numQuestions - 4; i <= numQuestions; i++) {
          delete newAnswers[i];
        }
        return newAnswers;
      });
      // Limpiar evaluaciones de preguntas eliminadas
      setCorrectness(prev => {
        const newCorrectness = { ...prev };
        for (let i = numQuestions - 4; i <= numQuestions; i++) {
          delete newCorrectness[i];
        }
        return newCorrectness;
      });
    }
  };

  // Limpiar todas las respuestas
  const clearAllAnswers = () => {
    setAnswers({});
    setCorrectness({});
    // Limpiar también el localStorage
    localStorage.removeItem('examAnswers');
    localStorage.removeItem('examCorrectness');
  };

  // Exportar respuestas
  const exportAnswers = () => {
    const results = [];
    for (let i = 1; i <= numQuestions; i++) {
      results.push({
        pregunta: i,
        respuesta: answers[i] || 'Sin respuesta',
        correcta: correctness[i] === true ? 'Sí' : correctness[i] === false ? 'No' : 'No evaluada'
      });
    }

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'respuestas_examen.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const options = generateOptions(optionsPerQuestion);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Hoja de Respuestas - Examen
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona una respuesta por pregunta
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de preguntas:
          </label>
          <button
            onClick={decreaseQuestions}
            className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            disabled={numQuestions <= 5}
          >
            <Minus size={16} />
          </button>
          <span className="mx-2 px-3 py-1 bg-white rounded bordert text-black font-medium">
            {numQuestions}
          </span>
          <button
            onClick={increaseQuestions}
            className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Opciones por pregunta:
          </label>
          <select
            value={optionsPerQuestion}
            onChange={(e) => {
              setOptionsPerQuestion(Number(e.target.value));
              setAnswers({});
              setCorrectness({});
            }}
            className="px-3 py-1 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 (A, B, C)</option>
            <option value={4}>4 (A, B, C, D)</option>
            <option value={5}>5 (A, B, C, D, E)</option>
            <option value={6}>6 (A, B, C, D, E, F)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearAllAnswers}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Limpiar
          </button>
          <button
            onClick={exportAnswers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Contador de respuestas */}
      <div className="mb-4 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Respuestas completadas: {Object.keys(answers).length} / {numQuestions}
        </span>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / numQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Grilla de preguntas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: numQuestions }, (_, i) => {
          const questionNum = i + 1;
          const selectedAnswer = answers[questionNum];
          const isCorrect = correctness[questionNum];

          return (
            <div
              key={questionNum}
              className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                selectedAnswer
                  ? isCorrect === true
                    ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                    : isCorrect === false
                    ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20'
                    : 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-400'
              }`}
            >
              <div className="text-center mb-3">
                <span className="inline-block w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {questionNum}
                </span>
              </div>

              <div className="flex justify-center gap-2 flex-wrap mb-3">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange(questionNum, option)}
                    className={`w-10 h-10 rounded-full border-2 font-semibold transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 scale-110'
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedAnswer && (
                <div className="space-y-2">
                  <div className="text-center flex items-center justify-center gap-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Respuesta: {selectedAnswer}
                    </span>
                    <button
                      onClick={() => clearIndividualAnswer(questionNum)}
                      className="p-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                      title="Limpiar respuesta"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Radio buttons para marcar si es correcta o incorrecta */}
                  <div className="flex justify-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correctness-${questionNum}`}
                        value="correct"
                        checked={isCorrect === true}
                        onChange={() => handleCorrectnessChange(questionNum, true)}
                        className="text-green-600 dark:text-green-400 focus:ring-green-500"
                      />
                      <span className="text-green-600 dark:text-green-400 font-medium">✓ Correcta</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correctness-${questionNum}`}
                        value="incorrect"
                        checked={isCorrect === false}
                        onChange={() => handleCorrectnessChange(questionNum, false)}
                        className="text-red-600 dark:text-red-400 focus:ring-red-500"
                      />
                      <span className="text-red-600 dark:text-red-400 font-medium">✗ Incorrecta</span>
                    </label>
                  </div>

                  {/* Botón para limpiar evaluación de correctness */}
                  {(isCorrect === true || isCorrect === false) && (
                    <div className="text-center">
                      <button
                        onClick={() => clearIndividualCorrectness(questionNum)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 mx-auto"
                        title="Limpiar evaluación"
                      >
                        <X size={10} />
                        Limpiar evaluación
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen final */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Resumen de respuestas:</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {Object.keys(answers).length === 0 ? (
            <p>No hay respuestas seleccionadas</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([question, answer]) => {
                  const isCorrect = correctness[question];
                  return (
                    <span
                      key={question}
                      className={`px-2 py-1 rounded text-xs ${
                        isCorrect === true
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : isCorrect === false
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                      }`}
                    >
                      {question}: {answer}
                      {isCorrect === true && ' ✓'}
                      {isCorrect === false && ' ✗'}
                    </span>
                  );
                })
              }
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {Object.keys(answers).length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
              <div className="font-semibold text-green-800 dark:text-green-400">
                {Object.values(correctness).filter(c => c === true).length}
              </div>
              <div className="text-green-600 dark:text-green-400">Correctas</div>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
              <div className="font-semibold text-red-800 dark:text-red-400">
                {Object.values(correctness).filter(c => c === false).length}
              </div>
              <div className="text-red-600 dark:text-red-400">Incorrectas</div>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="font-semibold text-gray-800 dark:text-gray-100">
                {Object.keys(answers).length - Object.keys(correctness).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Sin evaluar</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamAnswerSheet;