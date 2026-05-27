function FinalSubmissionPreview({
  project,
  platformName,
  platformSpec,
  convertedImages,
  representativeResult,
  validationResult,
  zipFileName,
  getConvertedImageUrl,
}) {
  if (!project || !validationResult) {
    return null;
  }

  const stickerImages = convertedImages.filter(
    (image) => image.itemType === "STICKER",
  );

  const mainImage = representativeResult?.mainImage || null;
  const tabImage = representativeResult?.tabImage || null;

  const finalFiles = [
    ...stickerImages.map((image) => ({
      type: "스티커",
      fileName: image.convertedFileName,
      size: `${image.width} × ${image.height}`,
      fileSize: `${image.fileSize} bytes`,
      imageUrl: getConvertedImageUrl(image.convertedFileName),
    })),

    mainImage
      ? {
          type: "대표 이미지",
          fileName: mainImage.convertedFileName,
          size: `${mainImage.width} × ${mainImage.height}`,
          fileSize: `${mainImage.fileSize} bytes`,
          imageUrl: getConvertedImageUrl(mainImage.convertedFileName),
        }
      : null,

    tabImage
      ? {
          type: "탭 이미지",
          fileName: tabImage.convertedFileName,
          size: `${tabImage.width} × ${tabImage.height}`,
          fileSize: `${tabImage.fileSize} bytes`,
          imageUrl: getConvertedImageUrl(tabImage.convertedFileName),
        }
      : null,
  ].filter(Boolean);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>final check</p>
          <h3 style={styles.title}>최종 제출 파일 확인</h3>
          <p style={styles.description}>
            ZIP 다운로드 전에 생성된 제출 파일 구성을 마지막으로 확인합니다.
          </p>
        </div>

        <div
          style={{
            ...styles.statusBadge,
            backgroundColor: validationResult.valid ? "#effcef" : "#fff3f6",
            color: validationResult.valid ? "#4f8c63" : "#d26181",
            borderColor: validationResult.valid ? "#cce8d3" : "#f7ccd9",
          }}
        >
          {validationResult.valid ? "검수 통과" : "검수 미통과"}
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>프로젝트</span>
          <strong style={styles.summaryValue}>{project.projectName}</strong>
        </div>

        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>플랫폼</span>
          <strong style={styles.summaryValue}>{platformName}</strong>
        </div>

        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>스티커 파일</span>
          <strong style={styles.summaryValue}>{stickerImages.length}개</strong>
        </div>

        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>ZIP 파일명</span>
          <strong style={styles.summaryValue}>{zipFileName}</strong>
        </div>
      </div>

      <div style={styles.noticeBox}>
        {validationResult.valid ? (
          <p>
            모든 기준을 통과했습니다. 아래 파일 목록을 확인한 뒤 ZIP 다운로드를
            진행하면 됩니다.
          </p>
        ) : (
          <p>
            현재 검수 미통과 상태입니다. 테스트용 다운로드는 가능하지만, 실제
            제출 전에는 실패 항목을 먼저 수정하는 것이 좋습니다.
          </p>
        )}
      </div>

      <div style={styles.fileGrid}>
        {finalFiles.map((file, index) => (
          <div
            key={`${file.type}-${file.fileName}-${index}`}
            style={styles.fileCard}
          >
            <div style={styles.fileType}>{file.type}</div>

            <div style={styles.imageWrap}>
              {file.imageUrl ? (
                <img
                  src={file.imageUrl}
                  alt={file.fileName}
                  style={styles.previewImage}
                />
              ) : (
                <div style={styles.noImage}>미리보기 없음</div>
              )}
            </div>

            <p style={styles.fileName}>{file.fileName}</p>

            <div style={styles.fileMeta}>
              <span>{file.size}</span>
              <span>{file.fileSize}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.checkList}>
        <strong>제출 전 체크리스트</strong>

        <ul style={styles.ul}>
          <li>파일명이 플랫폼 규격에 맞게 생성되었는지 확인</li>
          <li>대표 이미지와 탭 이미지가 잘리지 않았는지 확인</li>
          <li>캐릭터가 너무 작거나 한쪽으로 치우치지 않았는지 확인</li>
          <li>검수 미통과 항목이 있다면 실제 제출 전 수정</li>
        </ul>
      </div>

      {platformSpec && (
        <div style={styles.specMiniBox}>
          <span>
            스티커 규격 {platformSpec.stickerWidth} ×{" "}
            {platformSpec.stickerHeight}
          </span>
          <span>
            대표 이미지 {platformSpec.mainWidth} × {platformSpec.mainHeight}
          </span>
          <span>
            탭 이미지{" "}
            {platformSpec.tabImageRequired
              ? `${platformSpec.tabWidth} × ${platformSpec.tabHeight}`
              : "없음"}
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "24px",
    padding: "22px",
    borderRadius: "26px",
    background: "linear-gradient(180deg, #fffdfd 0%, #fff8fb 100%)",
    border: "2px solid #f3e2e8",
    boxShadow: "0 10px 24px rgba(205, 180, 188, 0.12)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: "0 0 6px",
    fontFamily: '"Gaegu", cursive',
    fontSize: "18px",
    color: "#de7997",
    fontWeight: "700",
  },

  title: {
    margin: "0 0 6px",
    fontSize: "26px",
    color: "#5b4a5f",
  },

  description: {
    margin: 0,
    color: "#857976",
    lineHeight: 1.6,
  },

  statusBadge: {
    padding: "9px 14px",
    borderRadius: "999px",
    border: "1.5px solid",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },

  summaryItem: {
    padding: "14px",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #f4dfe7",
  },

  summaryLabel: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#c47f98",
    fontWeight: "800",
  },

  summaryValue: {
    display: "block",
    color: "#5d5350",
    fontSize: "15px",
    wordBreak: "break-all",
  },

  noticeBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.6,
  },

  fileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "14px",
  },

  fileCard: {
    position: "relative",
    padding: "12px",
    borderRadius: "20px",
    backgroundColor: "#fffefd",
    border: "2px solid #f0dfe5",
    textAlign: "center",
    boxShadow: "0 6px 12px rgba(235, 215, 220, 0.08)",
  },

  fileType: {
    display: "inline-block",
    marginBottom: "8px",
    padding: "4px 9px",
    borderRadius: "999px",
    backgroundColor: "#fff3f6",
    color: "#cf6481",
    fontSize: "12px",
    fontWeight: "800",
  },

  imageWrap: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "#fff8fa",
    overflow: "hidden",
  },

  previewImage: {
    maxWidth: "100%",
    maxHeight: "110px",
    objectFit: "contain",
  },

  noImage: {
    color: "#b4aaa7",
    fontSize: "13px",
  },

  fileName: {
    margin: "10px 0 6px",
    fontSize: "13px",
    color: "#5d5452",
    fontWeight: "800",
    wordBreak: "break-all",
  },

  fileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#9a8f8b",
    fontSize: "12px",
  },

  checkList: {
    marginTop: "18px",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f8fcff",
    border: "2px solid #d7ebff",
    color: "#6b7f92",
    lineHeight: 1.7,
  },

  ul: {
    margin: "8px 0 0",
    paddingLeft: "20px",
  },

  specMiniBox: {
    marginTop: "14px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  specMiniBoxSpan: {
    padding: "8px 10px",
  },
};

export default FinalSubmissionPreview;
