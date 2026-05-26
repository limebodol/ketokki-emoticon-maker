import { useState } from "react";

const API_BASE_URL = "http://localhost:8080";
const REQUIRED_OGQ_COUNT = 24;

function App() {
  const [projectName, setProjectName] = useState("케로 캠핑 이모티콘");
  const [characterName, setCharacterName] = useState("케로");

  const [project, setProject] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [convertedImages, setConvertedImages] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(1);
  const [representativeResult, setRepresentativeResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCount = selectedFiles.length;
  const lackCount = Math.max(REQUIRED_OGQ_COUNT - selectedCount, 0);
  const overCount = Math.max(selectedCount - REQUIRED_OGQ_COUNT, 0);

  const isExactRequiredCount = selectedCount === REQUIRED_OGQ_COUNT;
  const isTestMode = selectedCount > 0 && selectedCount < REQUIRED_OGQ_COUNT;
  const isOverCount = selectedCount > REQUIRED_OGQ_COUNT;

  const stepStatus = {
    project: project ? "완료" : "진행 중",
    upload: uploadedImages.length > 0 ? "완료" : project ? "진행 가능" : "대기",
    convert:
      convertedImages.length > 0
        ? "완료"
        : uploadedImages.length > 0
          ? "진행 가능"
          : "대기",
    representative: representativeResult
      ? "완료"
      : convertedImages.length > 0
        ? "진행 가능"
        : "대기",
    validation: validationResult
      ? "완료"
      : representativeResult
        ? "진행 가능"
        : "대기",
    download: validationResult ? "진행 가능" : "대기",
  };

  const getErrorMessage = async (response, defaultMessage) => {
    try {
      const data = await response.json();

      if (data.message) {
        return data.message;
      }

      if (data.error) {
        return data.error;
      }

      return defaultMessage;
    } catch {
      return defaultMessage;
    }
  };

  const resetAfterProject = () => {
    setSelectedFiles([]);
    setPreviewImages([]);
    setUploadedImages([]);
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);
    setSelectedOrder(1);
  };

  const createProject = async () => {
    setError("");
    setMessage("");
    setProject(null);
    resetAfterProject();

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          characterName,
          targetPlatform: "OGQ",
          uploadType: "INDIVIDUAL",
        }),
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "프로젝트 생성에 실패했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setProject(data);
      setMessage("프로젝트가 생성되었습니다.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setSelectedFiles(files);
    setUploadedImages([]);
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);
    setSelectedOrder(1);
    setError("");
    setMessage("");

    if (files.length > REQUIRED_OGQ_COUNT) {
      setError(
        `OGQ는 ${REQUIRED_OGQ_COUNT}칸 기준입니다. 현재 ${files.length}개를 선택했습니다. 초과된 이미지는 업로드 전 정리하는 것을 추천합니다.`,
      );
    }

    const previews = files.map((file, index) => ({
      id: `${file.name}-${index}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages(previews);
  };

  const uploadImages = async () => {
    setError("");
    setMessage("");
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("업로드할 이미지를 선택해주세요.");
      return;
    }

    if (selectedFiles.length > REQUIRED_OGQ_COUNT) {
      setError(
        `최대 ${REQUIRED_OGQ_COUNT}개까지만 업로드하는 것을 추천합니다.`,
      );
      return;
    }

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/images`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "이미지 업로드에 실패했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUploadedImages(data);
      setMessage(`${data.length}개의 이미지가 업로드되었습니다.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const convertOgq = async () => {
    setError("");
    setMessage("");
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    if (uploadedImages.length === 0) {
      setError("먼저 이미지를 업로드해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/convert/ogq`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "OGQ 변환에 실패했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setConvertedImages(data);
      setMessage(`${data.length}개의 이미지가 OGQ 규격으로 변환되었습니다.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const createRepresentativeImages = async () => {
    setError("");
    setMessage("");
    setRepresentativeResult(null);
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    if (convertedImages.length === 0) {
      setError("먼저 OGQ 변환을 해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/representatives/ogq?selectedOrder=${selectedOrder}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "main.png / tab.png 생성에 실패했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRepresentativeResult(data);
      setMessage("main.png와 tab.png가 생성되었습니다.");
    } catch (err) {
      setError(err.message);
    }
  };

  const validateOgq = async () => {
    setError("");
    setMessage("");
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    if (!representativeResult) {
      setError("먼저 main.png / tab.png를 생성해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/validate/ogq`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "OGQ 검수에 실패했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setValidationResult(data);
      setMessage("OGQ 제출 전 검수가 완료되었습니다.");
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadOgqZip = () => {
    setError("");
    setMessage("");

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    window.location.href = `${API_BASE_URL}/api/projects/${project.id}/download/ogq`;
  };

  const getConvertedImageUrl = (fileName) => {
    if (!project || !fileName) {
      return "";
    }

    return `${API_BASE_URL}/files/converted/${project.id}/OGQ/${fileName}`;
  };

  const selectRepresentativeSlot = (slot) => {
    if (!slot.image) {
      setError("이미지가 들어있는 칸만 대표컷으로 선택할 수 있습니다.");
      return;
    }

    setSelectedOrder(slot.slotNumber);
    setRepresentativeResult(null);
    setValidationResult(null);
    setError("");
    setMessage(`${slot.slotNumber}번 이미지를 대표컷으로 선택했습니다.`);
  };

  const slotItems = Array.from({ length: REQUIRED_OGQ_COUNT }, (_, index) => {
    return {
      slotNumber: index + 1,
      image: previewImages[index] || null,
    };
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.badge}>OGQ MVP</p>
        <h1 style={styles.title}>케토끼 이모티콘 메이커</h1>
        <p style={styles.subtitle}>
          캐릭터 이미지를 업로드하고 OGQ 제출용 파일로 변환하는 제작 보조 도구
        </p>
      </header>

      <section style={styles.stepBoard}>
        <StepCard
          number="1"
          title="프로젝트 생성"
          status={stepStatus.project}
        />
        <StepCard number="2" title="이미지 업로드" status={stepStatus.upload} />
        <StepCard number="3" title="OGQ 변환" status={stepStatus.convert} />
        <StepCard
          number="4"
          title="대표 이미지"
          status={stepStatus.representative}
        />
        <StepCard number="5" title="검수" status={stepStatus.validation} />
        <StepCard
          number="6"
          title="ZIP 다운로드"
          status={stepStatus.download}
        />
      </section>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>오류: {error}</div>}

      <main style={styles.layout}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.stepNumber}>1</span>
            <div>
              <h2 style={styles.cardTitle}>프로젝트 생성</h2>
              <p style={styles.cardDescription}>
                작업할 이모티콘 프로젝트 정보를 먼저 생성합니다.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.label}>
              프로젝트명
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              캐릭터명
              <input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              플랫폼
              <input value="OGQ" disabled style={styles.disabledInput} />
            </label>

            <label style={styles.label}>
              업로드 방식
              <input
                value="개별 이미지 업로드"
                disabled
                style={styles.disabledInput}
              />
            </label>
          </div>

          <button onClick={createProject} style={styles.primaryButton}>
            프로젝트 만들기
          </button>

          {project && (
            <div style={styles.resultBox}>
              <h3>프로젝트 생성 성공</h3>
              <p>프로젝트 번호: {project.id}</p>
              <p>프로젝트명: {project.projectName}</p>
              <p>캐릭터명: {project.characterName}</p>
              <p>상태: {project.status}</p>
            </div>
          )}
        </section>

        {project && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>2</span>
              <div>
                <h2 style={styles.cardTitle}>이미지 업로드</h2>
                <p style={styles.cardDescription}>
                  프로젝트 {project.id}번에 원본 이미지를 업로드합니다.
                </p>
              </div>
            </div>

            <div style={styles.uploadBox}>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleFileChange}
              />
              <p>선택된 파일 수: {selectedFiles.length}개</p>
            </div>

            <div style={styles.countBox}>
              <div>
                <strong>OGQ 업로드 현황</strong>
                <p style={styles.countText}>
                  현재 {selectedCount} / {REQUIRED_OGQ_COUNT}개 선택
                </p>
              </div>

              {selectedCount === REQUIRED_OGQ_COUNT && (
                <span style={styles.countGood}>24개 준비 완료</span>
              )}

              {selectedCount < REQUIRED_OGQ_COUNT && selectedCount > 0 && (
                <span style={styles.countWarn}>{lackCount}개 부족</span>
              )}

              {selectedCount > REQUIRED_OGQ_COUNT && (
                <span style={styles.countBad}>{overCount}개 초과</span>
              )}
            </div>

            <div
              style={{
                ...styles.modeBox,
                backgroundColor: isExactRequiredCount
                  ? "#e9ffe9"
                  : isOverCount
                    ? "#fff0f0"
                    : isTestMode
                      ? "#fff8dd"
                      : "#f7fbff",
              }}
            >
              {isExactRequiredCount && (
                <>
                  <strong>현재 모드: 최종 제출 준비 가능</strong>
                  <p>
                    OGQ 기준 24장이 모두 준비되었습니다. 변환 후 검수까지
                    완료하면 제출용 ZIP을 만들 수 있습니다.
                  </p>
                </>
              )}

              {isTestMode && (
                <>
                  <strong>현재 모드: 테스트 모드</strong>
                  <p>
                    24장 미만이지만 테스트용 변환은 가능합니다. 단, 최종 제출용
                    OGQ 스티커는 24장이 필요합니다.
                  </p>
                </>
              )}

              {isOverCount && (
                <>
                  <strong>현재 모드: 파일 개수 초과</strong>
                  <p>
                    OGQ 기준은 24장입니다. 현재 {selectedCount}장을 선택했으므로{" "}
                    {overCount}장을 줄이는 것을 추천합니다.
                  </p>
                </>
              )}

              {selectedCount === 0 && (
                <>
                  <strong>현재 모드: 이미지 선택 대기</strong>
                  <p>
                    이미지를 선택하면 테스트 모드 또는 최종 제출 준비 상태가
                    표시됩니다.
                  </p>
                </>
              )}
            </div>

            {previewImages.length > 0 && (
              <div style={styles.previewSection}>
                <h3>OGQ 24칸 업로드 보드</h3>
                <p style={styles.helperText}>
                  선택한 이미지가 1번부터 순서대로 들어갑니다. 이미지를 클릭하면
                  대표컷으로 선택됩니다.
                </p>

                <div style={styles.slotGrid}>
                  {slotItems.map((slot) => (
                    <div
                      key={slot.slotNumber}
                      onClick={() => selectRepresentativeSlot(slot)}
                      style={{
                        ...styles.slotCard,
                        cursor: slot.image ? "pointer" : "default",
                        borderColor:
                          selectedOrder === slot.slotNumber
                            ? "#ff7a00"
                            : slot.image
                              ? "#008060"
                              : "#ddd",
                        borderWidth:
                          selectedOrder === slot.slotNumber ? "3px" : "1px",
                        backgroundColor:
                          selectedOrder === slot.slotNumber
                            ? "#fff3e6"
                            : slot.image
                              ? "#f8fff8"
                              : "#fafafa",
                      }}
                    >
                      <div style={styles.slotNumber}>{slot.slotNumber}</div>

                      {slot.image ? (
                        <>
                          {selectedOrder === slot.slotNumber && (
                            <div style={styles.selectedBadge}>대표컷</div>
                          )}

                          <img
                            src={slot.image.url}
                            alt={slot.image.name}
                            style={styles.slotImage}
                          />
                          <p style={styles.slotName}>{slot.image.name}</p>
                          <p style={styles.previewSize}>
                            {(slot.image.size / 1024).toFixed(1)} KB
                          </p>
                        </>
                      ) : (
                        <div style={styles.emptySlot}>비어 있음</div>
                      )}
                    </div>
                  ))}
                </div>

                {previewImages.length > REQUIRED_OGQ_COUNT && (
                  <div style={styles.extraBox}>
                    <strong>24개를 초과한 파일</strong>
                    {previewImages
                      .slice(REQUIRED_OGQ_COUNT)
                      .map((image, index) => (
                        <p key={image.id}>
                          {REQUIRED_OGQ_COUNT + index + 1}. {image.name}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={uploadImages} style={styles.darkButton}>
              이미지 업로드
            </button>

            {uploadedImages.length > 0 && (
              <DataTable
                title="업로드 결과"
                columns={[
                  "순서",
                  "원본 파일명",
                  "가로",
                  "세로",
                  "형식",
                  "용량",
                ]}
                rows={uploadedImages.map((image) => [
                  image.sortOrder,
                  image.originalFileName,
                  image.width,
                  image.height,
                  image.format,
                  `${image.fileSize} bytes`,
                ])}
              />
            )}
          </section>
        )}

        {uploadedImages.length > 0 && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>3</span>
              <div>
                <h2 style={styles.cardTitle}>OGQ 규격 변환</h2>
                <p style={styles.cardDescription}>
                  업로드한 이미지를 OGQ 스티커 규격 740×640 PNG로 변환합니다.
                </p>
              </div>
            </div>

            <div style={styles.convertNoticeBox}>
              {isExactRequiredCount ? (
                <p>
                  24장이 모두 준비되었습니다. 현재 변환 결과는 제출용 기준에
                  가깝게 생성됩니다.
                </p>
              ) : (
                <p>
                  현재 {selectedCount}장 기준으로 테스트 변환합니다. 최종
                  제출용은 24장이 필요합니다.
                </p>
              )}
            </div>

            <button onClick={convertOgq} style={styles.blueButton}>
              {isExactRequiredCount
                ? "OGQ 제출용으로 변환하기"
                : "테스트용 OGQ 변환하기"}
            </button>

            {convertedImages.length > 0 && (
              <>
                <DataTable
                  title="OGQ 변환 결과"
                  columns={["순서", "파일명", "구분", "가로", "세로", "용량"]}
                  rows={convertedImages.map((image) => [
                    image.sortOrder,
                    image.convertedFileName,
                    image.itemType,
                    image.width,
                    image.height,
                    `${image.fileSize} bytes`,
                  ])}
                />

                <p style={styles.pathText}>
                  저장 위치:{" "}
                  <code>
                    C:\dev\ketokki-sticker-maker\storage\converted\{project.id}
                    \OGQ
                  </code>
                </p>

                <div style={styles.convertedPreviewSection}>
                  <h3>OGQ 변환 이미지 미리보기</h3>

                  <div style={styles.convertedPreviewGrid}>
                    {convertedImages.map((image) => (
                      <div key={image.id} style={styles.convertedPreviewCard}>
                        <div style={styles.previewNumber}>
                          {image.sortOrder}
                        </div>

                        <img
                          src={getConvertedImageUrl(image.convertedFileName)}
                          alt={image.convertedFileName}
                          style={styles.convertedPreviewImage}
                        />

                        <p style={styles.previewName}>
                          {image.convertedFileName}
                        </p>
                        <p style={styles.previewSize}>
                          {image.width} × {image.height}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {convertedImages.length > 0 && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>4</span>
              <div>
                <h2 style={styles.cardTitle}>대표 이미지 생성</h2>
                <p style={styles.cardDescription}>
                  24칸 보드에서 이미지를 클릭하거나 번호를 입력해 대표컷을
                  선택합니다.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              대표컷 번호
              <input
                type="number"
                min="1"
                max={REQUIRED_OGQ_COUNT}
                value={selectedOrder}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  setSelectedOrder(value);
                  setRepresentativeResult(null);
                  setValidationResult(null);
                  setMessage(`${value}번 이미지를 대표컷으로 선택했습니다.`);
                }}
                style={{ ...styles.input, width: "120px" }}
              />
            </label>

            <p style={styles.helperText}>
              현재 선택된 대표컷: {selectedOrder}번
            </p>

            <button
              onClick={createRepresentativeImages}
              style={styles.greenButton}
            >
              main.png / tab.png 생성
            </button>

            {representativeResult && (
              <>
                <DataTable
                  title="대표 이미지 생성 결과"
                  columns={["구분", "파일명", "가로", "세로", "용량"]}
                  rows={[
                    [
                      representativeResult.mainImage.itemType,
                      representativeResult.mainImage.convertedFileName,
                      representativeResult.mainImage.width,
                      representativeResult.mainImage.height,
                      `${representativeResult.mainImage.fileSize} bytes`,
                    ],
                    [
                      representativeResult.tabImage.itemType,
                      representativeResult.tabImage.convertedFileName,
                      representativeResult.tabImage.width,
                      representativeResult.tabImage.height,
                      `${representativeResult.tabImage.fileSize} bytes`,
                    ],
                  ]}
                />

                <div style={styles.convertedPreviewSection}>
                  <h3>대표 이미지 미리보기</h3>

                  <div style={styles.convertedPreviewGrid}>
                    <div style={styles.convertedPreviewCard}>
                      <img
                        src={getConvertedImageUrl(
                          representativeResult.mainImage.convertedFileName,
                        )}
                        alt="main.png"
                        style={styles.convertedPreviewImage}
                      />
                      <p style={styles.previewName}>main.png</p>
                      <p style={styles.previewSize}>
                        {representativeResult.mainImage.width} ×{" "}
                        {representativeResult.mainImage.height}
                      </p>
                    </div>

                    <div style={styles.convertedPreviewCard}>
                      <img
                        src={getConvertedImageUrl(
                          representativeResult.tabImage.convertedFileName,
                        )}
                        alt="tab.png"
                        style={styles.convertedPreviewImage}
                      />
                      <p style={styles.previewName}>tab.png</p>
                      <p style={styles.previewSize}>
                        {representativeResult.tabImage.width} ×{" "}
                        {representativeResult.tabImage.height}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {representativeResult && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>5</span>
              <div>
                <h2 style={styles.cardTitle}>OGQ 제출 전 검수</h2>
                <p style={styles.cardDescription}>
                  파일 개수, 크기, 형식, 용량을 자동으로 검사합니다.
                </p>
              </div>
            </div>

            <button onClick={validateOgq} style={styles.purpleButton}>
              OGQ 제출 전 검수하기
            </button>

            {validationResult && (
              <>
                <div style={styles.validationGuideBox}>
                  <h3>
                    {validationResult.valid ? "검수 통과" : "검수 미통과"}
                  </h3>

                  {validationResult.valid ? (
                    <p>
                      모든 기준을 통과했습니다. ZIP 다운로드 후 제출 파일을
                      확인하세요.
                    </p>
                  ) : (
                    <p>
                      아직 최종 제출 조건을 만족하지 못했습니다. 아래 상세
                      결과에서 오류 항목을 확인하세요.
                    </p>
                  )}

                  {validationResult.items
                    .filter((item) => !item.valid)
                    .map((item, index) => (
                      <div key={index} style={styles.validationFailItem}>
                        <strong>{item.fileName}</strong>
                        <p>{item.message}</p>
                        <p>
                          기준: {item.expected} / 현재: {item.actual}
                        </p>
                      </div>
                    ))}
                </div>

                <div
                  style={{
                    ...styles.validationSummary,
                    backgroundColor: validationResult.valid
                      ? "#e9ffe9"
                      : "#fff0f0",
                  }}
                >
                  <p>
                    <strong>최종 통과 여부:</strong>{" "}
                    {validationResult.valid ? "통과" : "미통과"}
                  </p>
                  <p>
                    <strong>총점:</strong> {validationResult.totalScore}점
                  </p>
                  <p>
                    <strong>성공:</strong> {validationResult.successCount}개 /{" "}
                    <strong>실패:</strong> {validationResult.failCount}개
                  </p>
                </div>

                <DataTable
                  title="검수 상세 결과"
                  columns={[
                    "파일명",
                    "검사항목",
                    "결과",
                    "메시지",
                    "기준",
                    "현재값",
                  ]}
                  rows={validationResult.items.map((item) => [
                    item.fileName,
                    item.checkType,
                    item.valid ? "정상" : "오류",
                    item.message,
                    item.expected,
                    item.actual,
                  ])}
                />
              </>
            )}
          </section>
        )}

        {validationResult && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>6</span>
              <div>
                <h2 style={styles.cardTitle}>ZIP 다운로드</h2>
                <p style={styles.cardDescription}>
                  변환된 OGQ 제출 파일을 ZIP으로 다운로드합니다.
                </p>
              </div>
            </div>

            <button onClick={downloadOgqZip} style={styles.blackButton}>
              OGQ ZIP 다운로드
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function StepCard({ number, title, status }) {
  const isDone = status === "완료";
  const isReady = status === "진행 가능" || status === "진행 중";

  return (
    <div
      style={{
        ...styles.stepCard,
        borderColor: isDone ? "#008060" : isReady ? "#0066cc" : "#ddd",
        backgroundColor: isDone ? "#f1fff8" : isReady ? "#f7fbff" : "#fafafa",
      }}
    >
      <div style={styles.stepCircle}>{number}</div>
      <div>
        <strong>{title}</strong>
        <p style={styles.stepStatus}>{status}</p>
      </div>
    </div>
  );
}

function DataTable({ title, columns, rows }) {
  return (
    <div style={{ marginTop: "24px" }}>
      <h3>{title}</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={styles.th}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={styles.td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fffaf4",
    color: "#222",
  },
  header: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "32px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "#ffe8cc",
    fontSize: "13px",
    marginBottom: "8px",
  },
  title: {
    fontSize: "42px",
    margin: "0 0 8px",
  },
  subtitle: {
    margin: 0,
    color: "#666",
  },
  stepBoard: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  stepCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "16px",
  },
  stepCircle: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  stepStatus: {
    margin: "4px 0 0",
    color: "#666",
    fontSize: "13px",
  },
  layout: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    marginTop: "24px",
    padding: "24px",
    border: "1px solid #e5e5e5",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "20px",
  },
  stepNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
  },
  cardDescription: {
    margin: "4px 0 0",
    color: "#666",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  disabledInput: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f1f1f1",
  },
  primaryButton: buttonStyle("#222"),
  darkButton: buttonStyle("#4a4a4a"),
  blueButton: buttonStyle("#0066cc"),
  greenButton: buttonStyle("#008060"),
  purpleButton: buttonStyle("#8a2be2"),
  blackButton: buttonStyle("#111"),
  resultBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#fafafa",
    border: "1px solid #eee",
  },
  uploadBox: {
    padding: "18px",
    border: "1px dashed #aaa",
    borderRadius: "16px",
    backgroundColor: "#fafafa",
  },
  countBox: {
    marginTop: "16px",
    padding: "16px",
    border: "1px solid #eee",
    borderRadius: "16px",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  countText: {
    margin: "4px 0 0",
    color: "#666",
  },
  countGood: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#e9ffe9",
    color: "#126b2f",
    fontWeight: "bold",
  },
  countWarn: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#fff8dd",
    color: "#8a6500",
    fontWeight: "bold",
  },
  countBad: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#fff0f0",
    color: "#b00020",
    fontWeight: "bold",
  },
  modeBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #eee",
    lineHeight: 1.6,
  },
  previewSection: {
    marginTop: "24px",
  },
  helperText: {
    color: "#666",
    marginTop: "-4px",
  },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "14px",
    marginTop: "12px",
  },
  slotCard: {
    position: "relative",
    minHeight: "190px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "16px",
    textAlign: "center",
  },
  slotNumber: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
  },
  selectedBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#ff7a00",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
  },
  slotImage: {
    width: "100%",
    height: "110px",
    objectFit: "contain",
    backgroundColor: "#f6f6f6",
    borderRadius: "12px",
  },
  slotName: {
    margin: "8px 0 4px",
    fontSize: "12px",
    wordBreak: "break-all",
  },
  emptySlot: {
    height: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    fontSize: "13px",
  },
  extraBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#fff0f0",
    color: "#b00020",
  },
  previewNumber: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
  },
  convertedPreviewSection: {
    marginTop: "24px",
  },
  convertedPreviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "14px",
    marginTop: "12px",
  },
  convertedPreviewCard: {
    position: "relative",
    padding: "12px",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  convertedPreviewImage: {
    width: "100%",
    height: "130px",
    objectFit: "contain",
    backgroundColor: "#f6f6f6",
    borderRadius: "12px",
  },
  previewName: {
    margin: "8px 0 4px",
    fontSize: "13px",
    wordBreak: "break-all",
  },
  previewSize: {
    margin: 0,
    fontSize: "12px",
    color: "#777",
  },
  convertNoticeBox: {
    marginBottom: "12px",
    padding: "14px 16px",
    borderRadius: "14px",
    backgroundColor: "#f7fbff",
    border: "1px solid #d8e8ff",
    color: "#345",
  },
  validationGuideBox: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "18px",
    borderRadius: "16px",
    backgroundColor: "#fff8dd",
    border: "1px solid #f1dc9a",
  },
  validationFailItem: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "#fff0f0",
    border: "1px solid #ffd0d0",
  },
  successBox: {
    maxWidth: "1100px",
    margin: "16px auto",
    padding: "14px 18px",
    borderRadius: "12px",
    backgroundColor: "#e9ffe9",
    color: "#126b2f",
  },
  errorBox: {
    maxWidth: "1100px",
    margin: "16px auto",
    padding: "14px 18px",
    borderRadius: "12px",
    backgroundColor: "#fff0f0",
    color: "#b00020",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "12px",
    backgroundColor: "#fff",
  },
  th: {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#f4f4f4",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "10px",
  },
  pathText: {
    marginTop: "16px",
    color: "#555",
  },
  validationSummary: {
    padding: "16px",
    borderRadius: "16px",
    marginTop: "16px",
    marginBottom: "20px",
  },
};

function buttonStyle(backgroundColor) {
  return {
    marginTop: "12px",
    padding: "12px 20px",
    cursor: "pointer",
    border: "none",
    borderRadius: "10px",
    backgroundColor,
    color: "white",
    fontWeight: "bold",
  };
}

export default App;
