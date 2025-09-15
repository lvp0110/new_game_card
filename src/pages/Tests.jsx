import { useState } from "react";

export default function Tests() {
  const questions = [
    {
      id: 1,
      text: "В каком году началось производсво Шуманет БМ?",
      options: ["1999 год", "2000 год", "2005 год"],
      correctIndex: 1,
    },
    {
      id: 2,
      text: "Какие противопожарные свойства у Шуманет БМ?",
      options: ["КМ1", "НГ", "Н1"],
      correctIndex: 1,
    },
    {
      id: 3,
      text: "Чье сырье используется для производства Шуманет БМ?",
      options: ["Rockwool", "URSA", "ISOVER"],
      correctIndex: 0,
    },
  ];

  // Выборы пользователя по индексам вопросов
  const [selectedByQuestion, setSelectedByQuestion] = useState({});
  // Флаг: нажата ли кнопка проверки
  const [checked, setChecked] = useState(false);

  // БАЗОВЫЙ СТИЛЬ: только развёрнутые свойства границы
  const baseOptionStyle = {
    padding: "12px 14px",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    background: "none",
    transition:
      "background-color .15s ease, border-color .15s ease, box-shadow .15s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    userSelect: "none",
  };

  const getOptionStyle = (qIndex, oIndex, correctIndex) => {
    const isSelected = selectedByQuestion[qIndex] === oIndex;

    // Для невыбранных элементов после проверки запрещаем клик, но не меняем границы
    if (!isSelected) {
      return { ...baseOptionStyle, cursor: checked ? "default" : "pointer" };
    }

    // До нажатия кнопки — светло-серый фон для выбранного
    if (!checked) {
      return {
        ...baseOptionStyle,
        background: "#f3f4f624",
        borderColor: "#d1d5db",
        cursor: "pointer",
      };
    }

    // После нажатия — зелёный/красный для выбранного
    const isCorrect = oIndex === correctIndex;
    return {
      ...baseOptionStyle,
      borderColor: isCorrect ? "#10b981" : "#ef4444",
      boxShadow: isCorrect
        ? "0 0 0 3px rgba(16,185,129,0.25)"
        : "0 0 0 3px rgba(239,68,68,0.25)",
      cursor: "default",
    };
  };

  const onSelect = (qIndex, oIndex) => {
    if (checked) return; // после проверки менять нельзя
    setSelectedByQuestion((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const answeredCount = Object.keys(selectedByQuestion).length;
  const allAnswered = answeredCount === questions.length;

  // Подсчёт результата
  const correctCount = questions.reduce((acc, q, qIndex) => {
    const selected = selectedByQuestion[qIndex];
    return acc + (selected === q.correctIndex ? 1 : 0);
  }, 0);

  const reset = () => {
    setSelectedByQuestion({});
    setChecked(false);
  };

  return (
    <main
      style={{ position: "relative", minHeight: "100vh", paddingTop: "4rem" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "7.5rem",
          margin: "0px 30px",
        }}
      >
        <h2
          style={{
            zIndex: 3,
            margin: 0,
            color: "#fff",
            fontWeight: 300,
            fontSize: 30,
          }}
        >
          Тесты
        </h2>

        {checked && (
          <>
            <div style={{ fontWeight: 600, color: "#f3f4f6" }}>
              Результат: {correctCount} из {questions.length}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        {questions.map((q, qIndex) => (
          <section
            key={q.id}
            style={{
              background: "none",
              borderRadius: "16px",
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#e5e7eb",
            }}
          >
            <h2
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "1.125rem",
                fontWeight: 600,
              }}
            >
              {q.text}
            </h2>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "0.5rem",
              }}
            >
              {q.options.map((opt, oIndex) => (
                <li
                  key={oIndex}
                  onClick={() => onSelect(qIndex, oIndex)}
                  style={getOptionStyle(qIndex, oIndex, q.correctIndex)}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Кнопки и результат */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            disabled={!allAnswered || checked}
            onClick={() => setChecked(true)}
            style={{
              padding: "14px 14px",
              borderRadius: "10px",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: !allAnswered || checked ? "#e5e7eb" : "#111827",
              background: !allAnswered || checked ? "#e5e7eb" : "#f3f4f624",
              color: !allAnswered || checked ? "#9ca3af" : "#fff",
              cursor: !allAnswered || checked ? "not-allowed" : "pointer",
              transition: "all .15s ease",
              fontWeight: 600,
              fontFamily: "sans-serif",
              fontSize: 18,
            }}
          >
            проверить
          </button>

          {checked && (
            <>
              <button
                onClick={reset}
                style={{
                  padding: "14px 10px",
                  borderRadius: "10px",
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: "#e5e7eb",
                  background: "#fff",
                  color: "#111827",
                  cursor: "pointer",
                  transition: "all .15s ease",
                  fontWeight: 600,
                  fontFamily: "sans-serif",
                  fontSize: 18,
                }}
              >
                пройти снова
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}