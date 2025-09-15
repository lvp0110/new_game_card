import { useEffect, useRef, useState } from "react";
import img1 from "../assets/plan1.png";
import img2 from "../assets/plan2.png";
import img3 from "../assets/plan3.png";

const images = [
  {
    src: img1,
    alt: "- стена монолитная 200 мм, стены пеноблок 200 мм, перекрытие монолитная ж/б плита 200 мм ",
  },
  {
    src: img2,
    alt: "- несущая кирпичная стена 380 мм, каркасная деревянная стена со штукатуркой на дранке, перкрытие монлитная ж/б плита по профнастилу и металлическим балкам 140 мм",
  },
  {
    src: img3,
    alt: "- фасадная ж/б панель 200 мм, стены ж/б панель 180 мм, перекрытие пустотная ж/б плита 220 мм",
  },
];

export default function Solution() {
  const [index, setIndex] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const imgRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!imgRef.current) return;

    const update = () => {
      if (imgRef.current) setImgWidth(imgRef.current.clientWidth || 0);
    };

    update(); // первичное измерение

    const ro = new ResizeObserver(update);
    ro.observe(imgRef.current);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div style={{ display: "inline-block" }}>
      <h2
        style={{
          position: "absolute",
          zIndex: 3,
          margin: 0,
          padding: "2rem",
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          fontWeight: 300,
        }}
      >
        Решение
      </h2>

      <img
        ref={imgRef}
        src={images[index].src}
        alt={images[index].alt}
        width={1400}
        height={900}
        onLoad={() => setImgWidth(imgRef.current?.clientWidth || 0)}
        onClick={next}
        style={{
          cursor: "pointer",
          userSelect: "none",
          display: "block",
          maxWidth: "100%", // если у родителя когда-то появится ограничение
          height: "auto",
        }}
      />

      <div
        style={{
          marginTop: 8,
          width: imgWidth || undefined, // ширина панели = ширине изображения
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <button
          onClick={prev}
          style={{
            display: "inline-block",
            transform: "scaleX(-1)",
            height: 40,
          }}
        >
          ▷▷
        </button>
        <button onClick={next} style={{ marginLeft: 8, height: 40 }}>
          ▷▷
        </button>
          <span
            aria-live="polite"
            style={{
              marginLeft: 12,
              flex: 1,
              overflow: "hidden",
              overflowWrap: "anywhere",
              whiteSpace: "normal",
              fontFamily: "monospace",
              fontSize: "16px",
            }}
          >
            {images[index].alt}
          </span>
      </div>
    </div>
  );
}
