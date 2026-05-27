import { useEffect, useRef } from "react";

function RepresentativePreview({
  image,
  platformName,
  mainWidth,
  mainHeight,
  tabWidth,
  tabHeight,
  tabImageRequired,
}) {
  const mainCanvasRef = useRef(null);
  const tabCanvasRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    const img = new Image();

    img.onload = () => {
      drawPreview(mainCanvasRef.current, img, mainWidth, mainHeight);

      if (tabImageRequired && tabCanvasRef.current) {
        drawPreview(tabCanvasRef.current, img, tabWidth, tabHeight);
      }
    };

    img.src = image.url;
  }, [image, mainWidth, mainHeight, tabWidth, tabHeight, tabImageRequired]);

  const drawPreview = (canvas, img, targetWidth, targetHeight) => {
    if (!canvas) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    const imageRatio = img.width / img.height;
    const canvasRatio = targetWidth / targetHeight;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
      drawWidth = targetWidth;
      drawHeight = drawWidth / imageRatio;
    } else {
      drawHeight = targetHeight;
      drawWidth = drawHeight * imageRatio;
    }

    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  if (!image) {
    return (
      <div style={styles.emptyBox}>
        대표컷으로 선택된 이미지가 없습니다. 업로드 보드에서 이미지를
        클릭해주세요.
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h3 style={styles.title}>대표컷 미리보기</h3>
        <p style={styles.description}>
          {platformName} 제출용 대표 이미지가 어떻게 보일지 미리 확인합니다.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.previewCard}>
          <div style={styles.previewLabel}>선택한 대표컷</div>
          <img src={image.url} alt={image.name} style={styles.originalImage} />
          <p style={styles.fileName}>{image.name}</p>
        </div>

        <div style={styles.previewCard}>
          <div style={styles.previewLabel}>
            main.png 예상 미리보기
            <span style={styles.sizeText}>
              {mainWidth} × {mainHeight}
            </span>
          </div>

          <div style={styles.canvasWrap}>
            <canvas ref={mainCanvasRef} style={styles.previewCanvas} />
          </div>
        </div>

        {tabImageRequired ? (
          <div style={styles.previewCard}>
            <div style={styles.previewLabel}>
              tab.png 예상 미리보기
              <span style={styles.sizeText}>
                {tabWidth} × {tabHeight}
              </span>
            </div>

            <div style={styles.canvasWrap}>
              <canvas ref={tabCanvasRef} style={styles.previewCanvas} />
            </div>
          </div>
        ) : (
          <div style={styles.previewCard}>
            <div style={styles.previewLabel}>tab.png</div>
            <div style={styles.noTabBox}>
              이 플랫폼은 탭 이미지가 필요하지 않습니다.
            </div>
          </div>
        )}
      </div>

      <div style={styles.tipBox}>
        <strong>확인 포인트</strong>
        <p>
          작게 줄였을 때 캐릭터 얼굴이 잘 보이는지, 너무 한쪽으로 치우치지
          않았는지 확인해주세요. 마음에 들지 않으면 업로드 보드에서 다른
          이미지를 대표컷으로 선택하거나 “위치 조정”으로 다시 편집하면 됩니다.
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#f7fbff",
    border: "1px solid #d8e8ff",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
  },
  description: {
    margin: "6px 0 0",
    color: "#666",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  previewCard: {
    padding: "14px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e7eef8",
    textAlign: "center",
  },
  previewLabel: {
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#333",
  },
  sizeText: {
    display: "block",
    marginTop: "4px",
    fontSize: "12px",
    color: "#777",
    fontWeight: "normal",
  },
  originalImage: {
    width: "100%",
    height: "150px",
    objectFit: "contain",
    backgroundColor: "#f6f6f6",
    borderRadius: "12px",
  },
  fileName: {
    margin: "8px 0 0",
    fontSize: "12px",
    color: "#666",
    wordBreak: "break-all",
  },
  canvasWrap: {
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: "12px",
    padding: "12px",
  },
  previewCanvas: {
    maxWidth: "100%",
    maxHeight: "150px",
    backgroundImage:
      "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
  noTabBox: {
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    color: "#777",
    lineHeight: 1.5,
  },
  tipBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "#fff8dd",
    border: "1px solid #f1dc9a",
    lineHeight: 1.5,
  },
  emptyBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "#fafafa",
    border: "1px solid #eee",
    color: "#777",
  },
};

export default RepresentativePreview;
