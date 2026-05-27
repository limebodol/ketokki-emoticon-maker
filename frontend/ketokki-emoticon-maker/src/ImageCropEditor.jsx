import { useEffect, useRef, useState } from "react";

function ImageCropEditor({
  image,
  targetWidth,
  targetHeight,
  platformName,
  onClose,
  onApply,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [backgroundMode, setBackgroundMode] = useState("transparent");

  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawCanvas(img, zoom, offsetX, offsetY, backgroundMode);
    };
    img.src = image.url;
  }, [image]);

  useEffect(() => {
    if (!imageRef.current) return;
    drawCanvas(imageRef.current, zoom, offsetX, offsetY, backgroundMode);
  }, [zoom, offsetX, offsetY, backgroundMode]);

  const drawCanvas = (
    img,
    currentZoom,
    currentOffsetX,
    currentOffsetY,
    bgMode,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    if (bgMode === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    const imageRatio = img.width / img.height;
    const canvasRatio = targetWidth / targetHeight;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
      drawWidth = targetWidth * currentZoom;
      drawHeight = drawWidth / imageRatio;
    } else {
      drawHeight = targetHeight * currentZoom;
      drawWidth = drawHeight * imageRatio;
    }

    const x = (targetWidth - drawWidth) / 2 + currentOffsetX;
    const y = (targetHeight - drawHeight) / 2 + currentOffsetY;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  const resetEdit = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBackgroundMode("transparent");
  };

  const applyEdit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const editedFileName = makeEditedFileName(image.name);

      const editedFile = new File([blob], editedFileName, {
        type: "image/png",
      });

      const editedPreviewUrl = URL.createObjectURL(blob);

      onApply({
        file: editedFile,
        preview: {
          ...image,
          name: editedFileName,
          size: editedFile.size,
          url: editedPreviewUrl,
          edited: true,
        },
      });
    }, "image/png");
  };

  const makeEditedFileName = (fileName) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}_edited.png`;
  };

  if (!image) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>이미지 위치 조정</h2>
            <p style={styles.description}>
              {platformName} 규격 {targetWidth} × {targetHeight} 기준으로 미리
              조정합니다.
            </p>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            닫기
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.previewArea}>
            <canvas ref={canvasRef} style={styles.canvas} />
            <p style={styles.fileName}>{image.name}</p>
          </div>

          <div style={styles.controlArea}>
            <label style={styles.label}>
              확대 / 축소
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={styles.range}
              />
              <span>{zoom.toFixed(2)}배</span>
            </label>

            <label style={styles.label}>
              좌우 이동
              <input
                type="range"
                min={-targetWidth}
                max={targetWidth}
                step="1"
                value={offsetX}
                onChange={(e) => setOffsetX(Number(e.target.value))}
                style={styles.range}
              />
              <span>{offsetX}px</span>
            </label>

            <label style={styles.label}>
              위아래 이동
              <input
                type="range"
                min={-targetHeight}
                max={targetHeight}
                step="1"
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                style={styles.range}
              />
              <span>{offsetY}px</span>
            </label>

            <div style={styles.backgroundBox}>
              <strong>배경</strong>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  onClick={() => setBackgroundMode("transparent")}
                  style={{
                    ...styles.optionButton,
                    backgroundColor:
                      backgroundMode === "transparent" ? "#222" : "#fff",
                    color: backgroundMode === "transparent" ? "#fff" : "#222",
                  }}
                >
                  투명
                </button>

                <button
                  type="button"
                  onClick={() => setBackgroundMode("white")}
                  style={{
                    ...styles.optionButton,
                    backgroundColor:
                      backgroundMode === "white" ? "#222" : "#fff",
                    color: backgroundMode === "white" ? "#fff" : "#222",
                  }}
                >
                  흰색
                </button>
              </div>
            </div>

            <div style={styles.helperBox}>
              <strong>사용 팁</strong>
              <p>
                AI 이미지에서 캐릭터가 너무 작으면 확대하고, 머리나 발이 잘리면
                좌우/위아래 이동으로 중앙을 맞춰주세요.
              </p>
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={resetEdit}
                style={styles.resetButton}
              >
                초기화
              </button>

              <button
                type="button"
                onClick={applyEdit}
                style={styles.applyButton}
              >
                편집본 적용
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  modal: {
    width: "min(1000px, 95vw)",
    maxHeight: "90vh",
    overflow: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  description: {
    margin: "6px 0 0",
    color: "#666",
  },
  closeButton: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "24px",
  },
  previewArea: {
    padding: "20px",
    borderRadius: "18px",
    backgroundColor: "#f7f7f7",
    textAlign: "center",
  },
  canvas: {
    maxWidth: "100%",
    width: "420px",
    height: "auto",
    backgroundImage:
      "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    border: "1px solid #ddd",
    borderRadius: "14px",
  },
  fileName: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#666",
    wordBreak: "break-all",
  },
  controlArea: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontWeight: "bold",
  },
  range: {
    width: "100%",
  },
  backgroundBox: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #eee",
    backgroundColor: "#fafafa",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
  optionButton: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #ddd",
    cursor: "pointer",
    fontWeight: "bold",
  },
  helperBox: {
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "#fff8dd",
    border: "1px solid #f1dc9a",
    lineHeight: 1.5,
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  resetButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  applyButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#008060",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ImageCropEditor;
