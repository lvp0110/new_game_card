import { useEffect, useState } from "react";

function findFirstArrayDeep(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    for (const key of Object.keys(input)) {
      const found = findFirstArrayDeep(input[key]);
      if (found) return found;
    }
  }
  return null;
}

function normalizeList(list) {
  return list.map((it, idx) => {
    const name =
      it?.Name ?? it?.name ?? it?.Title ?? it?.title ?? `Элемент ${idx + 1}`;
    const specification =
      it?.Specification ??
      it?.specification ??
      it?.Description ??
      it?.description ??
      "";
    const id = it?.Id ?? it?.id ?? it?.ID ?? it?._id ?? `${name}-${idx}`;
    return { id, Name: name, Specification: specification, __raw: it };
  });
}

// БАЗОВЫЙ URL ДЛЯ КАРТИНОК
const IMG_BASE = "http://51.250.123.41:3005/api/v1/constr/";

// === ХЕЛПЕРЫ ДЛЯ ОПРЕДЕЛЕНИЯ И ПОСТРОЕНИЯ URL(ОВ) КАРТИНОК ===
const isImageFilename = (s) =>
  typeof s === "string" && /\.(png|jpe?g|gif|webp|svg)$/i.test(s.trim());

const pickCadImageField = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const keys = [
    "CadImg",
    "cadImg",
    "CADImg",
    "CadImage",
    "cadImage",
    "CADImage",
    "CAD",
    "Cad",
    "cad",
    "Drawing",
    "drawing",
    "Schema",
    "schema",
  ];
  for (const k of keys) {
    if (k in raw) {
      const v = raw[k];
      if (typeof v === "string" && (isImageFilename(v) || /^https?:\/\//i.test(v))) return v;
    }
  }
  return null;
};

const pickPhotoImageField = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const keys = [
    "Img",
    "img",
    "Image",
    "image",
    "Photo",
    "photo",
    "Picture",
    "picture",
    "Filename",
    "filename",
    "File",
    "file",
    "ImageUrl",
    "imageUrl",
  ];
  for (const k of keys) {
    if (k in raw) {
      const v = raw[k];
      if (typeof v === "string" && (isImageFilename(v) || /^https?:\/\//i.test(v))) return v;
    }
  }
  // Фолбэк: любое поле, похожее на имя файла
  for (const [, v] of Object.entries(raw)) {
    if (typeof v === "string" && isImageFilename(v)) return v;
  }
  return null;
};

const toAbsoluteImageUrl = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (/^https?:\/\//i.test(s)) return s; // уже абсолютный URL
  if (s.startsWith("/")) return s; // абсолютный путь относительно текущего домена
  const encoded = s
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return IMG_BASE + encoded;
};

const resolveImageUrls = (raw) => {
  const urls = [];
  const photo = pickPhotoImageField(raw); // СНАЧАЛА Img/фото
  const cad = pickCadImageField(raw);     // ПОТОМ CadImg/чертеж
  if (photo) urls.push({ url: toAbsoluteImageUrl(photo), kind: "IMG" });
  if (cad) urls.push({ url: toAbsoluteImageUrl(cad), kind: "CAD" });
  // Удаляем дубликаты по URL
  const seen = new Set();
  return urls.filter((x) => (seen.has(x.url) ? false : (seen.add(x.url), true)));
};

export default function Home() {
  const API_URL = "/api/v1/AllIsolationConstr";

  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, {
          signal: ctrl.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        let list = Array.isArray(json) ? json : null;
        if (!list) list = json?.data && Array.isArray(json.data) ? json.data : null;
        if (!list) list = json?.items && Array.isArray(json.items) ? json.items : null;
        if (!list) list = json?.result && Array.isArray(json.result) ? json.result : null;
        if (!list) list = json?.rows && Array.isArray(json.rows) ? json.rows : null;
        if (!list) list = findFirstArrayDeep(json);

        if (!list || !Array.isArray(list)) {
          console.debug("API response (unexpected shape):", json);
          throw new Error("Неверный формат ответа: не найден массив с данными");
        }

        const normalized = normalizeList(list);
        if (normalized.length === 0) throw new Error("Сервер вернул пустой список");

        setItems(normalized);
        setSelectedIndex(0);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort();
  }, []);

  const selected = items[selectedIndex];
  const goToTests = () => window.location.assign("/tests");

  // ===== ХЕЛПЕРЫ ДЛЯ НОВОГО СПИСКА ПОД Specification =====
  const stripHtml = (s) => {
    if (s == null) return "";
    return String(s)
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const cleanDescription = (s) => {
    const text = stripHtml(s);
    return text.replace(/^\s*описани[ея]:?\s*/i, "").trim();
  };

  const buildExtraList = (raw) => {
    if (!raw) return [];

    const code = raw?.Code ?? raw?.code ?? raw?.Код ?? null;

    const descRaw =
      raw?.Description ?? raw?.description ?? raw?.Spec ?? raw?.spec ?? "";
    const description = cleanDescription(descRaw);

    const thickness = raw?.Thickness ?? raw?.thickness;
    const soundIndex = raw?.SoundIndex ?? raw?.soundIndex;

    const impactRaw =
      raw?.ImpactNoseIndex ??
      raw?.impactNoseIndex ??
      raw?.ImpactNoiseIndex ??
      raw?.impactNoiseIndex;

    const lines = [];
    if (code) lines.push(`Код: ${code}`);
    if (description) lines.push(description);

    if (
      thickness !== undefined &&
      thickness !== null &&
      String(thickness).trim() !== ""
    ) {
      lines.push(`Толщина: ${thickness} мм`);
    }
    if (
      soundIndex !== undefined &&
      soundIndex !== null &&
      String(soundIndex).trim() !== ""
    ) {
      lines.push(`Индекс изоляции воздушного шума: ${soundIndex} дБ`);
    }

    const impactNum =
      impactRaw === undefined || impactRaw === null || String(impactRaw).trim() === ""
        ? null
        : Number(impactRaw);
    if (Number.isFinite(impactNum) && impactNum !== 0) {
      lines.push(`Индекс снижения ударного шума: ${impactNum} дБ`);
    }

    return lines;
  };

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 16,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 16,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ЛЕВЫЙ */}
      <aside
        style={{
          height: "calc(100vh - 32px)",
          borderRight: "1px solid #eee",
          paddingRight: 12,
          overflowY: "auto",
        }}
        aria-label="Список конструкций"
      >
        <h2 style={{ marginTop: 0 }}>Конструкции</h2>

        {loading && <div>Загрузка…</div>}
        {error && <div style={{ color: "crimson" }}>Ошибка: {error}</div>}
        {!loading && !error && items.length === 0 && <div>Данные отсутствуют</div>}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((it, idx) => (
            <li key={it.id ?? it.Name ?? idx} style={{ marginBottom: 6 }}>
              <button
                onClick={() => setSelectedIndex(idx)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: idx === selectedIndex ? "2px solid #555" : "1px solid #ddd",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                title={it.Name}
                aria-pressed={idx === selectedIndex}
              >
                {it.Name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ПРАВЫЙ */}
      <section
        style={{
          position: "sticky",
          top: 16,
          alignSelf: "start",
          height: "calc(100vh - 32px)",
          overflow: "hidden",
          paddingLeft: 4,
          display: "flex",
          flexDirection: "column",
        }}
        aria-label="Описание конструкции"
      >
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: 8,
          }}
        >
          <h2 style={{ margin: 0 }}>{selected?.Name ?? "Описание"}</h2>
          <button
            onClick={goToTests}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              backgroundColor: "gray",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Перейти к тестам"
          >
            Перейти к тестам
          </button>
        </div>

        {/* Прокручиваемая область справа */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {/* ДВА ИЗОБРАЖЕНИЯ: слева фото (Img), справа чертеж (CadImg) */}
          {selected && (() => {
            const images = resolveImageUrls(selected.__raw ?? selected);
            return images.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {images.map((img) => (
                  <div key={img.url} style={{
                    border: "1px solid #eee",
                    borderRadius: 8,
                    // background: "#fafafa",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 200,
                  }}>
                    <img
                      src={img.url}
                      alt={
                        selected?.Name
                          ? `${img.kind === "CAD" ? "Чертеж (CAD)" : "Изображение"}: ${selected.Name}`
                          : img.kind === "CAD" ? "Чертеж (CAD)" : "Изображение"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: 400,
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                      onError={(e) => {
                        e.currentTarget.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, marginBottom: 12 }}>
            {selected?.Specification || "Описание отсутствует"}
          </div>

          {/* Новый список под Specification */}
          {selected && (() => {
            const extraLines = buildExtraList(selected.__raw ?? selected);
            return extraLines.length > 0 ? (
              <ul style={{ margin: "0 0 12px 18px", padding: 0 }}>
                {extraLines.map((line, idx) => (
                  <li key={idx} style={{ listStyle: "disc", marginBottom: 4 }}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null;
          })()}
        </div>
      </section>
    </main>
  );
}