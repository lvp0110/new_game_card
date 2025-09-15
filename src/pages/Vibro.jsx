"use client";
import { useEffect, useState, useMemo } from "react";

export default function Vibro() {
  const [items, setItems] = useState([]);
  const [valueA, setValueA] = useState("");
  const [valueB, setValueB] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/v2/material/list/vibro", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.items)
          ? json.items
          : [];

        // ФИЛЬТРАЦИЯ ПО "Sylomer" (регистронезависимо)
        const filtered = list.filter(
          (it) =>
            typeof it?.Name === "string" &&
            it.Name.toLowerCase().includes("sylomer")
        );

        setItems(filtered);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const itemA = useMemo(
    () => items.find((it) => it?.Name === valueA),
    [items, valueA]
  );
  const itemB = useMemo(
    () => items.find((it) => it?.Name === valueB),
    [items, valueB]
  );

  // Настройка игнорируемых полей при сравнении (при необходимости добавьте сюда служебные поля)
  const ignoredKeys = useMemo(() => new Set(["__typename"]), []);

  // Сервисные хелперы
  const isObject = (v) => v !== null && typeof v === "object";
  const areValuesEqual = (a, b) => {
    if (a === b) return true; // покрывает примитивы и ссылки на один объект
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    if (isObject(a) || isObject(b)) {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    }
    return false;
  };
  const formatVal = (v) => {
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  // Считаем отличия по объединённому набору ключей
  const diffs = useMemo(() => {
    if (!itemA || !itemB) return [];
    const keys = Array.from(
      new Set([...Object.keys(itemA || {}), ...Object.keys(itemB || {})])
    ).filter((k) => !ignoredKeys.has(k));

    return keys.reduce((acc, key) => {
      const a = itemA[key];
      const b = itemB[key];
      if (!areValuesEqual(a, b)) acc.push({ key, a, b });
      return acc;
    }, []);
  }, [itemA, itemB, ignoredKeys]);

  const isComparable = !!itemA && !!itemB;
  // Равенство теперь определяется отсутствием отличий
  const isEqual = isComparable && diffs.length === 0;
  const labelA = useMemo(() => itemA?.Name || "Материал A", [itemA]);
  const labelB = useMemo(() => itemB?.Name || "Материал B", [itemB]);

  return (
    <div style={{ width: 720, padding: 16 }}>
      {loading && <p>Загрузка.....</p>}
      {error && <p style={{ color: "crimson" }}>Ошибка: {error}</p>}

      {!loading && !error && (
        <>
          <h2>Сравнение виброизоляционных материалов</h2>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <label>
              {/* Материал A: */}
              <select
                value={valueA}
                onChange={(e) => setValueA(e.target.value)}
                style={{
                  display: "block",
                  marginTop: 8,
                  padding: 8,
                  width: "100%",
                }}
              >
                <option value="">Выберите материал...</option>
                {items.map((item) => (
                  <option
                    key={item?.Id ?? item?.id ?? item?.Name}
                    value={item?.Name}
                  >
                    {item?.Name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {/* Материал B: */}
              <select
                value={valueB}
                onChange={(e) => setValueB(e.target.value)}
                style={{
                  display: "block",
                  marginTop: 8,
                  padding: 8,
                  width: "100%",
                }}
              >
                <option value="">Выберите материал...</option>
                {items.map((item) => (
                  <option
                    key={(item?.Id ?? item?.id ?? item?.Name) + "-b"}
                    value={item?.Name}
                  >
                    {item?.Name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isComparable && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginTop: 8 }}>
                <strong>
                  Сравнение {labelA} vs {labelB}:
                </strong>{" "}
                <span style={{ color: isEqual ? "green" : "orange" }}>
                  {isEqual ? "совпадают" : "разные"}
                </span>
              </div>

              {!isEqual && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    Отличия ({diffs.length}):
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {diffs.map(({ key, a, b }) => (
                      <li key={key} style={{ marginBottom: 4 }}>
                        {/* <span style={{ fontWeight: 600 }}>{key}:</span>{" "} */}
                        <span style={{ color: "#555" }}>{labelA}</span> ={" "}
                        <code>{formatVal(a)}</code> <br />
                        <span style={{ color: "#555" }}>{labelB}</span> ={" "}
                        <code>{formatVal(b)}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 12,
            }}
          >
            {/* <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Выбор A</div>
                  <pre
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      maxHeight: 260,
                      overflow: 'auto',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(itemA, null, 2)}
                  </pre>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Выбор B</div>
                  <pre
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      maxHeight: 260,
                      overflow: 'auto',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(itemB, null, 2)}
                  </pre>
                </div> */}
          </div>
        </>
      )}
    </div>
  );
}
