import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import home from "../assets/home1.png";
import img1 from "../assets/quest1.png";
import img2 from "../assets/quest2.png";
import img3 from "../assets/quest3.png";
import img4 from "../assets/quest4.png";
import img5 from "../assets/quest5.png";
import img6 from "../assets/quest6.png";
import img7 from "../assets/quest7.png";
import img8 from "../assets/quest8.png";
import img9 from "../assets/quest9.png";
import img10 from "../assets/quest10.png";
import img11 from "../assets/quest11.png";
import img12 from "../assets/quest12.png";

export default function Card() {
  const navigate = useNavigate();

  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12];

  // Перемешивание (Фишера-Йетса)
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Очередь индексов без повторов в пределах цикла
  const [queue, setQueue] = useState(() => shuffle(images.map((_, i) => i)));
  const [currentIndex, setCurrentIndex] = useState(null); // индекс текущей верхней картинки
  const [showTop, setShowTop] = useState(false);
  const [questionDisabled, setQuestionDisabled] = useState(false);
  const [solutionDisabled, setSolutionDisabled] = useState(true); // НЕ активна до выбора вопроса

  const advanceToNext = () => {
    setQueue((prevQ) => {
      let q = prevQ;

      // Если очередь исчерпана — создаём новую случайную перестановку
      if (q.length === 0) {
        q = shuffle(images.map((_, i) => i));
        // Избегаем соприкосновения одинаковых элементов на границе циклов
        if (images.length > 1 && currentIndex != null && q[0] === currentIndex) {
          const swapWith = Math.floor(Math.random() * (q.length - 1)) + 1;
          [q[0], q[swapWith]] = [q[swapWith], q[0]];
        }
      }

      const nextIdx = q[0];
      setCurrentIndex(nextIdx);
      return q.slice(1);
    });
  };

  // Нажатие на "Вопрос": показать рандомный вопрос, заблокировать "Вопрос", разблокировать "Решение"
  const handleQuestionClick = () => {
    if (questionDisabled) return;
    setShowTop(true);
    advanceToNext();
    setQuestionDisabled(true);
    setSolutionDisabled(false);
  };

  // Нажатие на "Решение": переход на страницу решения
  const handleSolutionClick = () => {
    if (solutionDisabled) return;
    navigate("/solution");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "85vh" }}>
      {/* Верхняя панель с управлением */}
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          top: 0,
          left: 0,
          right: 0,
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={handleQuestionClick}
          disabled={questionDisabled}
          aria-pressed={showTop}
          style={{
            margin: 0,
            background: "transparent",
            border: "none",
            color: questionDisabled ? "rgba(255,255,255,0.6)" : "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            fontWeight: 300,
            fontSize: "1.5rem",
            cursor: questionDisabled ? "not-allowed" : "pointer",
            padding: 0,
          }}
        >
          Вопрос
        </button>

        <span
          aria-hidden
          style={{
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            fontWeight: 300,
            fontSize: "1.5rem",
            userSelect: "none",
          }}
        >
          /
        </span>

        <button
          type="button"
          onClick={handleSolutionClick}
          disabled={solutionDisabled}
          style={{
            margin: 0,
            background: "transparent",
            border: "none",
            color: solutionDisabled ? "rgba(255,255,255,0.6)" : "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            fontWeight: 300,
            fontSize: "1.5rem",
            cursor: solutionDisabled ? "not-allowed" : "pointer",
            padding: 0,
          }}
        >
          Решение
        </button>
      </div>

      {/* Нижний фон (без кликов) */}
      <div
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "0.5",
        }}
      />

      {/* Верхняя картинка — показывается/скрывается через opacity */}
      {currentIndex !== null && (
        <img
          src={images[currentIndex]}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 2,
            pointerEvents: "none",
            opacity: showTop ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />
      )}
    </div>
  );
}
