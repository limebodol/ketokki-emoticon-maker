import { useEffect, useState } from "react";
import ImageCropEditor from "./ImageCropEditor";
import RepresentativePreview from "./RepresentativePreview";
import FinalSubmissionPreview from "./FinalSubmissionPreview";
import creatorBanner from "./assets/creator-banner.jpg";

const API_BASE_URL = "http://localhost:8080";
const DEFAULT_OGQ_COUNT = 24;

function App() {
  const [projectName, setProjectName] = useState("케로 캠핑 이모티콘");
  const [characterName, setCharacterName] = useState("케로");

  const [selectedPlatform, setSelectedPlatform] = useState("OGQ");
  const [moheemPackType, setMoheemPackType] = useState("PLUS");

  const [platformSpec, setPlatformSpec] = useState(null);
  const [platformSpecError, setPlatformSpecError] = useState("");

  const [project, setProject] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [convertedImages, setConvertedImages] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(1);
  const [representativeResult, setRepresentativeResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [usageStatus, setUsageStatus] = useState(null);
  const [usageStatusError, setUsageStatusError] = useState("");

  const [projectList, setProjectList] = useState([]);
  const [projectListLoading, setProjectListLoading] = useState(false);
  const [projectListError, setProjectListError] = useState("");

  const [activeMenu, setActiveMenu] = useState("GUIDE");
  const [projectListPage, setProjectListPage] = useState(1);
  const PROJECTS_PER_PAGE = 5;

  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNickname, setSignupNickname] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const platformSpecKey =
    selectedPlatform === "MOHEEM"
      ? moheemPackType === "PLUS"
        ? "MOHEEM_PLUS"
        : "MOHEEM_BASIC"
      : selectedPlatform;

  const minStickerCount =
    platformSpec?.minStickerCount ??
    platformSpec?.requiredStickerCount ??
    DEFAULT_OGQ_COUNT;

  const maxStickerCount =
    platformSpec?.maxStickerCount ??
    platformSpec?.requiredStickerCount ??
    DEFAULT_OGQ_COUNT;

  const hasMaxStickerCount =
    platformSpec?.maxStickerCount !== null &&
    platformSpec?.maxStickerCount !== undefined;

  const slotCount =
    selectedPlatform === "MOHEEM" && moheemPackType === "PLUS"
      ? Math.max(minStickerCount, selectedFiles.length)
      : maxStickerCount;

  const selectedCount = selectedFiles.length;
  const lackCount = Math.max(minStickerCount - selectedCount, 0);
  const overCount = hasMaxStickerCount
    ? Math.max(selectedCount - maxStickerCount, 0)
    : 0;

  const isExactRequiredCount =
    selectedCount >= minStickerCount &&
    (!hasMaxStickerCount || selectedCount <= maxStickerCount);

  const isTestMode = selectedCount > 0 && selectedCount < minStickerCount;
  const isOverCount = hasMaxStickerCount && selectedCount > maxStickerCount;

  const outputFolderName = platformSpec?.outputFolderName || selectedPlatform;

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

  useEffect(() => {
    fetchPlatformSpec(platformSpecKey);
  }, [platformSpecKey]);

  useEffect(() => {
    fetchUsageLimitStatus();
  }, []);

  const fetchPlatformSpec = async (specKey) => {
    setPlatformSpec(null);
    setPlatformSpecError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/platform-specs/${specKey}`,
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "플랫폼 규격 정보를 불러오지 못했습니다.",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setPlatformSpec(data);
    } catch (err) {
      setPlatformSpecError(err.message);
    }
  };

  const fetchUsageLimitStatus = async () => {
    setUsageStatusError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/usage/convert/status`);

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "무료 체험 사용량 정보를 불러오지 못했습니다.",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUsageStatus(data);
    } catch (err) {
      setUsageStatusError(err.message);
    }
  };

  const getErrorMessage = async (response, defaultMessage) => {
    try {
      const data = await response.json();

      if (data.message) return data.message;
      if (data.error) return data.error;

      return defaultMessage;
    } catch {
      return defaultMessage;
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "-";

    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }

    return `${bytes} bytes`;
  };

  const getStickerCountText = () => {
    if (!platformSpec) return `${DEFAULT_OGQ_COUNT}개`;

    if (platformSpec.maxStickerCount === null) {
      return `${platformSpec.minStickerCount}개 이상`;
    }

    if (platformSpec.minStickerCount === platformSpec.maxStickerCount) {
      return `${platformSpec.requiredStickerCount}개`;
    }

    return `${platformSpec.minStickerCount}개 ~ ${platformSpec.maxStickerCount}개`;
  };

  const getPackTypeText = () => {
    if (selectedPlatform === "MOHEEM") {
      return moheemPackType === "PLUS" ? "MOHEEM 플러스팩" : "MOHEEM 베이직팩";
    }

    if (selectedPlatform === "KAKAO") return "KAKAO 정지형";
    if (selectedPlatform === "LINE") return "LINE 정지형";

    return selectedPlatform;
  };

  const getShortPlatformText = () => {
    if (selectedPlatform === "MOHEEM") return "MOHEEM";
    if (selectedPlatform === "KAKAO") return "KAKAO";
    if (selectedPlatform === "LINE") return "LINE";

    return selectedPlatform;
  };

  const getConvertButtonText = () => {
    if (selectedPlatform === "MOHEEM") {
      return `${getPackTypeText()} 규격으로 변환하기`;
    }

    if (selectedPlatform === "KAKAO") {
      return "KAKAO 정지형 규격으로 변환하기";
    }

    if (selectedPlatform === "LINE") {
      return "LINE 정지형 규격으로 변환하기";
    }

    if (isExactRequiredCount) {
      return `${selectedPlatform} 제출용으로 변환하기`;
    }

    return `테스트용 ${selectedPlatform} 변환하기`;
  };

  const getRepresentativeButtonText = () => {
    if (selectedPlatform === "MOHEEM") return "팩 대표 이미지 생성";
    if (selectedPlatform === "KAKAO") return "KAKAO 대표 이미지 생성";
    if (selectedPlatform === "LINE") return "LINE 대표 이미지 생성";

    return "대표 이미지 생성";
  };

  const getValidationButtonText = () => {
    if (selectedPlatform === "MOHEEM") return "MOHEEM 제출 전 검수하기";
    if (selectedPlatform === "KAKAO") return "KAKAO 제출 전 검수하기";
    if (selectedPlatform === "LINE") return "LINE 제출 전 검수하기";

    return `${selectedPlatform} 제출 전 검수하기`;
  };

  const getZipButtonText = () => {
    if (selectedPlatform === "MOHEEM") return "MOHEEM ZIP 다운로드";
    if (selectedPlatform === "KAKAO") return "KAKAO ZIP 다운로드";
    if (selectedPlatform === "LINE") return "LINE ZIP 다운로드";

    return `${selectedPlatform} ZIP 다운로드`;
  };

  const getRepresentativeTitleText = () => {
    if (selectedPlatform === "MOHEEM") return "팩 대표 이미지 생성";
    if (selectedPlatform === "KAKAO") return "KAKAO 대표 이미지 생성";
    if (selectedPlatform === "LINE") return "LINE 대표 이미지 생성";

    return "대표 이미지 생성";
  };

  const getRepresentativeDescriptionText = () => {
    if (selectedPlatform === "MOHEEM") {
      return "선택한 스티커 이미지를 기준으로 MOHEEM 팩 대표 이미지를 생성합니다.";
    }

    if (selectedPlatform === "KAKAO") {
      return "선택한 스티커 이미지를 기준으로 KAKAO 대표 이미지와 탭 이미지를 생성합니다.";
    }

    if (selectedPlatform === "LINE") {
      return "선택한 스티커 이미지를 기준으로 LINE 메인 이미지와 탭 이미지를 생성합니다.";
    }

    return "업로드 보드에서 이미지를 클릭하거나 번호를 입력해 대표컷을 선택합니다.";
  };

  const getPlatformGuideText = () => {
    if (selectedPlatform === "OGQ") {
      return "네이버 OGQ 제출용 스티커를 제작합니다. 24개 기준이며 main.png와 tab.png를 함께 생성합니다.";
    }

    if (selectedPlatform === "MOHEEM") {
      return moheemPackType === "PLUS"
        ? "MOHEEM 플러스팩은 24개 이상 스티커를 제출하는 방식입니다. 팩 대표 이미지를 함께 생성합니다."
        : "MOHEEM 베이직팩은 1개부터 23개까지 테스트할 수 있는 방식입니다. 팩 대표 이미지를 함께 생성합니다.";
    }

    if (selectedPlatform === "KAKAO") {
      return "카카오 정지형 이모티콘 제출용 이미지를 제작합니다. 32개 기준이며 대표 이미지와 탭 이미지를 생성합니다.";
    }

    if (selectedPlatform === "LINE") {
      return "LINE 정지형 스티커 제출용 이미지를 제작합니다. 8개부터 40개까지 테스트할 수 있습니다.";
    }

    return "플랫폼별 제출 규격에 맞춰 이미지를 변환합니다.";
  };

  const getCurrentPlatformSummary = () => {
    if (!platformSpec) return [];

    return [
      { label: "플랫폼", value: getPackTypeText() },
      { label: "스티커 개수", value: getStickerCountText() },
      {
        label: "스티커 크기",
        value: `${platformSpec.stickerWidth} × ${platformSpec.stickerHeight}`,
      },
      {
        label: "대표 이미지",
        value: `${platformSpec.mainWidth} × ${platformSpec.mainHeight}`,
      },
      {
        label: "탭 이미지",
        value: platformSpec.tabImageRequired
          ? `${platformSpec.tabWidth} × ${platformSpec.tabHeight}`
          : "없음",
      },
      {
        label: "파일 용량",
        value: `${formatBytes(platformSpec.maxFileSizeBytes)} 이하`,
      },
    ];
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

  const resetAfterImageEdit = () => {
    setUploadedImages([]);
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);
  };

  const changePlatform = (platformName) => {
    setSelectedPlatform(platformName);
    setProject(null);
    resetAfterProject();
    setError("");

    if (platformName === "OGQ") {
      setMessage("OGQ 플랫폼을 선택했습니다.");
    } else if (platformName === "MOHEEM") {
      setMessage("MOHEEM 플랫폼을 선택했습니다.");
    } else if (platformName === "KAKAO") {
      setMessage("KAKAO 정지형 이모티콘 플랫폼을 선택했습니다.");
    } else if (platformName === "LINE") {
      setMessage("LINE 정지형 스티커 플랫폼을 선택했습니다.");
    } else {
      setMessage(`${platformName} 플랫폼을 선택했습니다.`);
    }
  };

  const changeMoheemPackType = (packType) => {
    setMoheemPackType(packType);
    setProject(null);
    resetAfterProject();
    setError("");
    setMessage(
      packType === "PLUS"
        ? "MOHEEM 플러스팩을 선택했습니다."
        : "MOHEEM 베이직팩을 선택했습니다.",
    );
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
          targetPlatform:
            selectedPlatform === "MOHEEM" ? platformSpecKey : selectedPlatform,
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

  const fetchProjectList = async () => {
    setProjectListLoading(true);
    setProjectListError("");
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "프로젝트 목록을 불러오지 못했습니다.",
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();

      setProjectList(data);
      setProjectListPage(1);
      setMessage("프로젝트 목록을 불러왔습니다.");
    } catch (err) {
      setProjectListError(err.message);
      setError(err.message);
    } finally {
      setProjectListLoading(false);
    }
  };

  const handleSignup = () => {
    setError("");
    setMessage("");

    if (!signupUsername.trim()) {
      setError("회원가입 아이디를 입력해주세요.");
      return;
    }

    if (!signupPassword.trim()) {
      setError("회원가입 비밀번호를 입력해주세요.");
      return;
    }

    const exists = members.some(
      (member) => member.username === signupUsername.trim(),
    );

    if (exists) {
      setError("이미 가입된 아이디입니다.");
      return;
    }

    const newMember = {
      id: Date.now(),
      username: signupUsername.trim(),
      nickname: signupNickname.trim() || signupUsername.trim(),
      password: signupPassword,
      createdAt: new Date().toLocaleString("ko-KR"),
    };

    setMembers((prev) => [...prev, newMember]);
    setSignupUsername("");
    setSignupPassword("");
    setSignupNickname("");
    setMessage(
      "회원가입 테스트 계정이 생성되었습니다. 이제 로그인할 수 있습니다.",
    );
  };

  const handleLogin = () => {
    setError("");
    setMessage("");

    const foundMember = members.find(
      (member) =>
        member.username === loginUsername.trim() &&
        member.password === loginPassword,
    );

    if (!foundMember) {
      setError("아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    setCurrentUser(foundMember);
    setLoginUsername("");
    setLoginPassword("");
    setMessage(`${foundMember.nickname}님, 로그인되었습니다.`);
  };

  const handleLogout = () => {
    if (currentUser) {
      setMessage(`${currentUser.nickname}님, 로그아웃되었습니다.`);
    }

    setCurrentUser(null);
    setProjectList([]);
    setProjectListPage(1);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const maxPublicUploadCount = 40;
    const maxPublicFileSize = 1024 * 1024;

    if (files.length > maxPublicUploadCount) {
      setError(
        `무료 체험 버전에서는 1회 최대 ${maxPublicUploadCount}장까지만 업로드할 수 있습니다. 현재 선택한 파일 수: ${files.length}장`,
      );
      e.target.value = "";
      return;
    }

    const overSizeFile = files.find((file) => file.size > maxPublicFileSize);

    if (overSizeFile) {
      setError(
        `이미지 1장 최대 용량은 1MB입니다. 용량을 줄인 뒤 다시 업로드해주세요. 초과 파일: ${overSizeFile.name}`,
      );
      e.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) =>
        file.type !== "image/png" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/jpg",
    );

    if (invalidFile) {
      setError(
        `PNG 또는 JPG/JPEG 이미지만 업로드할 수 있습니다. 지원하지 않는 파일: ${invalidFile.name}`,
      );
      e.target.value = "";
      return;
    }

    setSelectedFiles(files);
    setUploadedImages([]);
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);
    setSelectedOrder(1);
    setError("");
    setMessage("");

    if (hasMaxStickerCount && files.length > maxStickerCount) {
      setError(
        `${getPackTypeText()}는 최대 ${maxStickerCount}개 기준입니다. 현재 ${files.length}개를 선택했습니다. 초과된 이미지는 업로드 전 정리하는 것을 추천합니다.`,
      );
    }

    const previews = files.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
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

    if (hasMaxStickerCount && selectedFiles.length > maxStickerCount) {
      setError(`최대 ${maxStickerCount}개까지만 업로드하는 것을 추천합니다.`);
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

  const convertByPlatform = async () => {
    setError("");
    setMessage("");
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (uploadedImages.length === 0) {
      setError("먼저 이미지를 업로드해주세요.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/convert/${platformSpecKey}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          `${getPackTypeText()} 변환에 실패했습니다.`,
        );

        setError(errorMessage);
        fetchUsageLimitStatus();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const data = await response.json();

      setConvertedImages(data);
      setMessage(
        `${data.length}개의 이미지가 ${getPackTypeText()} 규격으로 변환되었습니다.`,
      );

      fetchUsageLimitStatus();

      /*
       * 변환 성공 시에는 화면을 맨 위로 올리지 않습니다.
       * 사용자가 바로 아래의 변환 결과와 미리보기를 확인할 수 있게 유지합니다.
       */
    } catch (err) {
      setError(
        err.message || `${getPackTypeText()} 변환 중 오류가 발생했습니다.`,
      );
      fetchUsageLimitStatus();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
      setError(`먼저 ${getPackTypeText()} 변환을 해주세요.`);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/representatives/${platformSpecKey}?selectedOrder=${selectedOrder}`,
        { method: "POST" },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          "대표 이미지 생성에 실패했습니다.",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRepresentativeResult(data);

      if (selectedPlatform === "MOHEEM") {
        setMessage("팩 대표 이미지가 생성되었습니다.");
      } else if (selectedPlatform === "KAKAO") {
        setMessage("KAKAO 대표 이미지와 탭 이미지가 생성되었습니다.");
      } else if (selectedPlatform === "LINE") {
        setMessage("LINE 메인 이미지와 탭 이미지가 생성되었습니다.");
      } else {
        setMessage("대표 이미지가 생성되었습니다.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const validateByPlatform = async () => {
    setError("");
    setMessage("");
    setValidationResult(null);

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    if (!representativeResult) {
      setError(
        selectedPlatform === "MOHEEM"
          ? "먼저 팩 대표 이미지를 생성해주세요."
          : "먼저 대표 이미지를 생성해주세요.",
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${project.id}/validate/${platformSpecKey}`,
        { method: "POST" },
      );

      if (!response.ok) {
        const errorMessage = await getErrorMessage(
          response,
          `${getPackTypeText()} 검수에 실패했습니다.`,
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setValidationResult(data);
      setMessage(`${getShortPlatformText()} 제출 전 검수가 완료되었습니다.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadPlatformZip = () => {
    setError("");
    setMessage("");

    if (!project) {
      setError("먼저 프로젝트를 만들어주세요.");
      return;
    }

    window.location.href = `${API_BASE_URL}/api/projects/${project.id}/download/${platformSpecKey}`;
  };

  const getConvertedImageUrl = (fileName) => {
    if (!project || !fileName) return "";

    return `${API_BASE_URL}/files/converted/${project.id}/${outputFolderName}/${fileName}`;
  };

  const getZipFileName = () => {
    if (!project) {
      return `${platformSpecKey.toLowerCase()}_submission.zip`;
    }

    return `project_${project.id}_${platformSpecKey.toLowerCase()}_submission.zip`;
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

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedFiles.length) return;

    const newSelectedFiles = [...selectedFiles];
    const [movedFile] = newSelectedFiles.splice(fromIndex, 1);
    newSelectedFiles.splice(toIndex, 0, movedFile);

    const newPreviewImages = [...previewImages];
    const [movedPreview] = newPreviewImages.splice(fromIndex, 1);
    newPreviewImages.splice(toIndex, 0, movedPreview);

    setSelectedFiles(newSelectedFiles);
    setPreviewImages(newPreviewImages);

    resetAfterImageEdit();
    setSelectedOrder(toIndex + 1);

    setError("");
    setMessage(
      `${fromIndex + 1}번 이미지가 ${toIndex + 1}번 순서로 변경되었습니다.`,
    );
  };

  const deleteImage = (indexToDelete) => {
    const deletedImage = previewImages[indexToDelete];

    const newSelectedFiles = selectedFiles.filter(
      (_, index) => index !== indexToDelete,
    );
    const newPreviewImages = previewImages.filter(
      (_, index) => index !== indexToDelete,
    );

    setSelectedFiles(newSelectedFiles);
    setPreviewImages(newPreviewImages);

    resetAfterImageEdit();

    if (newSelectedFiles.length === 0) {
      setSelectedOrder(1);
    } else if (selectedOrder > newSelectedFiles.length) {
      setSelectedOrder(newSelectedFiles.length);
    } else if (selectedOrder > indexToDelete + 1) {
      setSelectedOrder(selectedOrder - 1);
    }

    setError("");
    setMessage(
      deletedImage
        ? `${indexToDelete + 1}번 이미지(${deletedImage.name})를 삭제했습니다.`
        : `${indexToDelete + 1}번 이미지를 삭제했습니다.`,
    );
  };

  const clearSelectedImages = () => {
    setSelectedFiles([]);
    setPreviewImages([]);
    setUploadedImages([]);
    setConvertedImages([]);
    setRepresentativeResult(null);
    setValidationResult(null);
    setSelectedOrder(1);

    setError("");
    setMessage("선택한 이미지를 모두 초기화했습니다.");
  };

  const openImageEditor = (index) => {
    setEditingImageIndex(index);
    setError("");
    setMessage(`${index + 1}번 이미지를 편집합니다.`);
  };

  const closeImageEditor = () => {
    setEditingImageIndex(null);
  };

  const applyEditedImage = ({ file, preview }) => {
    if (editingImageIndex === null) return;

    const newSelectedFiles = [...selectedFiles];
    const newPreviewImages = [...previewImages];

    newSelectedFiles[editingImageIndex] = file;
    newPreviewImages[editingImageIndex] = preview;

    setSelectedFiles(newSelectedFiles);
    setPreviewImages(newPreviewImages);

    resetAfterImageEdit();
    setEditingImageIndex(null);

    setError("");
    setMessage(`${editingImageIndex + 1}번 이미지 편집본을 적용했습니다.`);
  };

  const getCropTargetWidth = () => {
    return platformSpec?.stickerWidth || 360;
  };

  const getCropTargetHeight = () => {
    return platformSpec?.stickerHeight || 360;
  };

  const getSelectedRepresentativePreviewImage = () => {
    if (!selectedOrder || selectedOrder < 1) return null;
    return previewImages[selectedOrder - 1] || null;
  };

  const slotItems = Array.from({ length: slotCount }, (_, index) => {
    return {
      slotNumber: index + 1,
      image: previewImages[index] || null,
    };
  });

  const totalProjectPages = Math.max(
    Math.ceil(projectList.length / PROJECTS_PER_PAGE),
    1,
  );

  const pagedProjectList = projectList.slice(
    (projectListPage - 1) * PROJECTS_PER_PAGE,
    projectListPage * PROJECTS_PER_PAGE,
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.badge}>{getPackTypeText()} MVP</p>
        <h1 style={styles.title}>케토끼 이모티콘 메이커</h1>
        <p style={styles.subtitle}>
          캐릭터 이미지를 업로드하고 플랫폼 제출용 파일로 변환하는 제작 보조
          도구
        </p>
      </header>

      <section style={styles.menuTabBox}>
        <button
          type="button"
          onClick={() => setActiveMenu("GUIDE")}
          style={{
            ...styles.menuTabButton,
            ...(activeMenu === "GUIDE" ? styles.menuTabButtonActive : {}),
          }}
        >
          이용방법
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu("CREATE")}
          style={{
            ...styles.menuTabButton,
            ...(activeMenu === "CREATE" ? styles.menuTabButtonActive : {}),
          }}
        >
          프로젝트 생성
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu("LIST")}
          style={{
            ...styles.menuTabButton,
            ...(activeMenu === "LIST" ? styles.menuTabButtonActive : {}),
          }}
        >
          프로젝트 목록
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu("LOGIN")}
          style={{
            ...styles.menuTabButton,
            ...(activeMenu === "LOGIN" ? styles.menuTabButtonActive : {}),
          }}
        >
          회원가입 / 로그인
        </button>
      </section>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>오류: {error}</div>}

      <main style={styles.layout}>
        {activeMenu === "GUIDE" && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>?</span>
              <div>
                <h2 style={styles.cardTitle}>이용방법</h2>
                <p style={styles.cardDescription}>
                  처음 사용하는 분도 순서대로 따라갈 수 있도록 핵심 흐름만
                  정리했습니다.
                </p>
              </div>
            </div>

            <div style={styles.quickGuideGrid}>
              <div style={styles.quickGuideCard}>
                <span style={styles.quickGuideIcon}>🌷</span>
                <strong>1. 프로젝트 생성</strong>
                <p>프로젝트 생성 메뉴에서 플랫폼과 캐릭터 정보를 입력합니다.</p>
              </div>
              <div style={styles.quickGuideCard}>
                <span style={styles.quickGuideIcon}>🖼️</span>
                <strong>2. 이미지 선택</strong>
                <p>
                  이모티콘 이미지를 선택하고 순서, 삭제, 위치 조정을 합니다.
                </p>
              </div>
              <div style={styles.quickGuideCard}>
                <span style={styles.quickGuideIcon}>✨</span>
                <strong>3. 규격 변환</strong>
                <p>선택한 플랫폼 규격에 맞게 이미지를 자동 변환합니다.</p>
              </div>
              <div style={styles.quickGuideCard}>
                <span style={styles.quickGuideIcon}>📦</span>
                <strong>4. 검수 후 다운로드</strong>
                <p>대표 이미지 생성, 검수, ZIP 다운로드까지 진행합니다.</p>
              </div>
            </div>

            <div style={styles.guideBox}>
              {[
                [
                  "1",
                  "프로젝트 생성 메뉴로 이동",
                  "실제 작업은 프로젝트 생성 메뉴 안에서 진행합니다.",
                ],
                [
                  "2",
                  "플랫폼 선택",
                  "OGQ, KAKAO, LINE, MOHEEM 중 제출할 플랫폼을 선택합니다.",
                ],
                [
                  "3",
                  "프로젝트 만들기",
                  "프로젝트명과 캐릭터명을 입력하고 프로젝트를 생성합니다.",
                ],
                [
                  "4",
                  "이미지 업로드 / 위치 조정",
                  "이미지를 선택하고 순서 변경, 삭제, 위치 조정을 진행합니다.",
                ],
                [
                  "5",
                  "규격 변환 / 대표 이미지 / 검수",
                  "플랫폼 규격으로 변환하고 대표 이미지와 검수 결과를 확인합니다.",
                ],
                [
                  "6",
                  "ZIP 다운로드",
                  "최종 제출 파일을 ZIP으로 다운로드합니다.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} style={styles.guideItem}>
                  <span style={styles.guideStep}>{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.freeTrialGuideBoxCompact}>
              <div>
                <p style={styles.freeTrialBadge}>FREE TRIAL</p>
                <h3 style={styles.freeTrialTitle}>무료 체험 공개 버전 안내</h3>
                <p style={styles.freeTrialDescription}>
                  로그인 없이 사용할 수 있지만, 서버 보호를 위해 업로드 용량과
                  변환 횟수에 제한이 있습니다.
                </p>
              </div>

              <div style={styles.freeTrialGrid}>
                <div style={styles.freeTrialItem}>
                  <span style={styles.freeTrialIcon}>🖼️</span>
                  <strong>1회 최대 40장</strong>
                  <p>한 번에 업로드할 수 있는 이미지 개수입니다.</p>
                </div>
                <div style={styles.freeTrialItem}>
                  <span style={styles.freeTrialIcon}>📦</span>
                  <strong>이미지 1장 최대 1MB</strong>
                  <p>PNG, JPG, JPEG 파일만 업로드할 수 있습니다.</p>
                </div>
                <div style={styles.freeTrialItem}>
                  <span style={styles.freeTrialIcon}>🔁</span>
                  <strong>하루 변환 5회</strong>
                  <p>
                    같은 접속 환경 기준으로 하루 최대 5회 변환할 수 있습니다.
                  </p>
                </div>
                <div style={styles.freeTrialItem}>
                  <span style={styles.freeTrialIcon}>⏰</span>
                  <strong>1시간 후 자동 삭제</strong>
                  <p>업로드 이미지, 변환 파일, ZIP 파일은 자동 삭제됩니다.</p>
                </div>
              </div>

              <div style={styles.usageStatusBox}>
                <div>
                  <strong>오늘의 무료 변환 사용량</strong>

                  {usageStatus ? (
                    <p style={styles.usageStatusText}>
                      {usageStatus.usedCount} / {usageStatus.dailyLimit}회 사용
                      · 남은 횟수 {usageStatus.remainingCount}회
                    </p>
                  ) : (
                    <p style={styles.usageStatusText}>
                      무료 변환 사용량 정보를 불러오는 중입니다.
                    </p>
                  )}

                  {usageStatusError && (
                    <p style={styles.usageStatusError}>{usageStatusError}</p>
                  )}
                </div>

                {usageStatus && (
                  <span
                    style={{
                      ...styles.usageStatusBadge,
                      backgroundColor: usageStatus.available
                        ? "#eefced"
                        : "#fff1f5",
                      color: usageStatus.available ? "#4f8c63" : "#d26081",
                      borderColor: usageStatus.available
                        ? "#cce8d3"
                        : "#f8d0db",
                    }}
                  >
                    {usageStatus.available ? "변환 가능" : "오늘 횟수 소진"}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {activeMenu === "CREATE" && (
          <>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.stepNumber}>0</span>
                <div>
                  <h2 style={styles.cardTitle}>플랫폼 선택</h2>
                  <p style={styles.cardDescription}>
                    제출하려는 플랫폼을 선택하면 필요한 이미지 크기, 개수, 대표
                    이미지 규격이 자동으로 표시됩니다.
                  </p>
                </div>
              </div>

              <div style={styles.platformButtonGroup}>
                {["OGQ", "KAKAO", "LINE", "MOHEEM"].map((platformName) => (
                  <button
                    key={platformName}
                    type="button"
                    onClick={() => changePlatform(platformName)}
                    style={{
                      ...styles.platformButton,
                      background:
                        selectedPlatform === platformName
                          ? "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)"
                          : "#fff",
                      color:
                        selectedPlatform === platformName ? "#fff" : "#6c5e5e",
                      borderColor:
                        selectedPlatform === platformName
                          ? "#ffffff"
                          : "#eed7df",
                    }}
                  >
                    {platformName}
                  </button>
                ))}
              </div>

              {selectedPlatform === "MOHEEM" && (
                <div style={styles.packTypeBox}>
                  <strong>MOHEEM 팩 유형 선택</strong>

                  <div style={styles.platformButtonGroup}>
                    <button
                      type="button"
                      onClick={() => changeMoheemPackType("PLUS")}
                      style={{
                        ...styles.platformButton,
                        background:
                          moheemPackType === "PLUS"
                            ? "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)"
                            : "#fff",
                        color: moheemPackType === "PLUS" ? "#fff" : "#6c5e5e",
                        borderColor:
                          moheemPackType === "PLUS" ? "#fff" : "#eed7df",
                      }}
                    >
                      플러스팩
                    </button>

                    <button
                      type="button"
                      onClick={() => changeMoheemPackType("BASIC")}
                      style={{
                        ...styles.platformButton,
                        background:
                          moheemPackType === "BASIC"
                            ? "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)"
                            : "#fff",
                        color: moheemPackType === "BASIC" ? "#fff" : "#6c5e5e",
                        borderColor:
                          moheemPackType === "BASIC" ? "#fff" : "#eed7df",
                      }}
                    >
                      베이직팩
                    </button>
                  </div>

                  <p style={styles.prepareText}>
                    MOHEEM 베이직팩은 1개부터 테스트할 수 있습니다. 플러스팩은
                    24개 이상일 때 변환할 수 있습니다.
                  </p>
                </div>
              )}

              {platformSpecError && (
                <div style={styles.errorBox}>
                  규격 조회 오류: {platformSpecError}
                </div>
              )}
            </section>

            <section style={styles.platformSummaryCardInside}>
              <div>
                <p style={styles.summaryEyebrow}>현재 제작 설정</p>
                <h2 style={styles.summaryTitle}>{getPackTypeText()}</h2>
                <p style={styles.summaryDescription}>
                  {getPlatformGuideText()}
                </p>
              </div>

              {platformSpec && (
                <div style={styles.summaryGrid}>
                  {getCurrentPlatformSummary().map((item) => (
                    <div key={item.label} style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>{item.label}</span>
                      <strong style={styles.summaryValue}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

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
                  <input
                    value={
                      selectedPlatform === "MOHEEM"
                        ? platformSpecKey
                        : selectedPlatform
                    }
                    disabled
                    style={styles.disabledInput}
                  />
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
                    <h2 style={styles.cardTitle}>이미지 업로드 / 위치 조정</h2>
                    <p style={styles.cardDescription}>
                      이미지를 선택한 뒤 필요하면 위치 조정으로 확대, 이동,
                      배경을 수정할 수 있습니다.
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

                <div style={styles.publicLimitBox}>
                  <strong>업로드 전 확인해주세요</strong>
                  <p>1회 최대 40장까지 업로드할 수 있습니다.</p>
                  <p>이미지 1장당 최대 용량은 1MB입니다.</p>
                  <p>PNG, JPG, JPEG 파일만 사용할 수 있습니다.</p>
                  <p>
                    업로드한 이미지와 변환 파일, ZIP 파일은 1시간 후 자동
                    삭제됩니다.
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelectedImages}
                    style={styles.resetButton}
                  >
                    선택 이미지 전체 초기화
                  </button>
                )}

                <div style={styles.countBox}>
                  <div>
                    <strong>{getPackTypeText()} 업로드 현황</strong>
                    <p style={styles.countText}>
                      현재 {selectedCount} / {getStickerCountText()} 선택
                    </p>
                  </div>

                  {isExactRequiredCount && selectedCount > 0 && (
                    <span style={styles.countGood}>개수 조건 충족</span>
                  )}

                  {isTestMode && (
                    <span style={styles.countWarn}>{lackCount}개 부족</span>
                  )}

                  {isOverCount && (
                    <span style={styles.countBad}>{overCount}개 초과</span>
                  )}
                </div>

                {previewImages.length > 0 && (
                  <div style={styles.previewSection}>
                    <h3>{getPackTypeText()} 업로드 보드</h3>
                    <p style={styles.helperText}>
                      이미지를 클릭하면 대표컷으로 선택됩니다. “위치 조정”
                      버튼으로 캐릭터 위치와 여백을 맞출 수 있습니다.
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
                                ? "#ff9eb8"
                                : slot.image
                                  ? "#bdeec8"
                                  : "#f0dfe5",
                            borderWidth:
                              selectedOrder === slot.slotNumber ? "3px" : "2px",
                            backgroundColor:
                              selectedOrder === slot.slotNumber
                                ? "#fff6f9"
                                : slot.image
                                  ? "#fbfffb"
                                  : "#fffefd",
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

                              <div style={styles.moveButtonGroup}>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    moveImage(
                                      slot.slotNumber - 1,
                                      slot.slotNumber - 2,
                                    );
                                  }}
                                  disabled={slot.slotNumber === 1}
                                  style={{
                                    ...styles.moveButton,
                                    opacity: slot.slotNumber === 1 ? 0.4 : 1,
                                  }}
                                >
                                  ← 앞으로
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    moveImage(
                                      slot.slotNumber - 1,
                                      slot.slotNumber,
                                    );
                                  }}
                                  disabled={
                                    slot.slotNumber === selectedFiles.length
                                  }
                                  style={{
                                    ...styles.moveButton,
                                    opacity:
                                      slot.slotNumber === selectedFiles.length
                                        ? 0.4
                                        : 1,
                                  }}
                                >
                                  뒤로 →
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openImageEditor(slot.slotNumber - 1);
                                }}
                                style={styles.editButton}
                              >
                                위치 조정
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteImage(slot.slotNumber - 1);
                                }}
                                style={styles.deleteButton}
                              >
                                삭제
                              </button>
                            </>
                          ) : (
                            <div style={styles.emptySlot}>비어 있음</div>
                          )}
                        </div>
                      ))}
                    </div>
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
                    <h2 style={styles.cardTitle}>
                      {getPackTypeText()} 규격 변환
                    </h2>
                    <p style={styles.cardDescription}>
                      업로드한 이미지를 {getPackTypeText()} 스티커 규격으로
                      변환합니다.
                    </p>
                  </div>
                </div>

                <div style={styles.convertNoticeBox}>
                  {platformSpec ? (
                    <p>
                      현재 {getPackTypeText()} 스티커 규격은{" "}
                      {platformSpec.stickerWidth} × {platformSpec.stickerHeight}
                      입니다.
                    </p>
                  ) : (
                    <p>플랫폼 규격 정보를 불러오는 중입니다.</p>
                  )}
                </div>

                <button onClick={convertByPlatform} style={styles.blueButton}>
                  {getConvertButtonText()}
                </button>

                {convertedImages.length > 0 && (
                  <>
                    <DataTable
                      title={`${getPackTypeText()} 변환 결과`}
                      columns={[
                        "순서",
                        "파일명",
                        "구분",
                        "가로",
                        "세로",
                        "용량",
                      ]}
                      rows={convertedImages.map((image) => [
                        image.sortOrder,
                        image.convertedFileName,
                        image.itemType,
                        image.width,
                        image.height,
                        `${image.fileSize} bytes`,
                      ])}
                    />

                    <div style={styles.convertedPreviewSection}>
                      <h3>{getPackTypeText()} 변환 이미지 미리보기</h3>

                      <div style={styles.convertedPreviewGrid}>
                        {convertedImages.map((image) => (
                          <div
                            key={image.id}
                            style={styles.convertedPreviewCard}
                          >
                            <div style={styles.previewNumber}>
                              {image.sortOrder}
                            </div>

                            <img
                              src={getConvertedImageUrl(
                                image.convertedFileName,
                              )}
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
                    <h2 style={styles.cardTitle}>
                      {getRepresentativeTitleText()}
                    </h2>
                    <p style={styles.cardDescription}>
                      {getRepresentativeDescriptionText()}
                    </p>
                  </div>
                </div>

                <label style={styles.label}>
                  대표컷 번호
                  <input
                    type="number"
                    min="1"
                    max={slotCount}
                    value={selectedOrder}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSelectedOrder(value);
                      setRepresentativeResult(null);
                      setValidationResult(null);
                      setMessage(
                        `${value}번 이미지를 대표컷으로 선택했습니다.`,
                      );
                    }}
                    style={{ ...styles.input, width: "120px" }}
                  />
                </label>

                <p style={styles.helperText}>
                  현재 선택된 대표컷: {selectedOrder}번
                </p>

                <RepresentativePreview
                  image={getSelectedRepresentativePreviewImage()}
                  platformName={getPackTypeText()}
                  mainWidth={platformSpec?.mainWidth || 240}
                  mainHeight={platformSpec?.mainHeight || 240}
                  tabWidth={platformSpec?.tabWidth || 96}
                  tabHeight={platformSpec?.tabHeight || 74}
                  tabImageRequired={platformSpec?.tabImageRequired ?? true}
                />

                <button
                  onClick={createRepresentativeImages}
                  style={styles.greenButton}
                >
                  {getRepresentativeButtonText()}
                </button>

                {representativeResult && (
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
                      representativeResult.tabImage
                        ? [
                            representativeResult.tabImage.itemType,
                            representativeResult.tabImage.convertedFileName,
                            representativeResult.tabImage.width,
                            representativeResult.tabImage.height,
                            `${representativeResult.tabImage.fileSize} bytes`,
                          ]
                        : ["TAB", "없음", "-", "-", "-"],
                    ]}
                  />
                )}
              </section>
            )}

            {representativeResult && (
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepNumber}>5</span>
                  <div>
                    <h2 style={styles.cardTitle}>
                      {getShortPlatformText()} 제출 전 검수
                    </h2>
                    <p style={styles.cardDescription}>
                      파일 개수, 크기, 형식, 용량을 자동으로 검사합니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={validateByPlatform}
                  style={styles.purpleButton}
                >
                  {getValidationButtonText()}
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
                          ? "#eefced"
                          : "#fff3f6",
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
                        <strong>성공:</strong> {validationResult.successCount}개
                        / <strong>실패:</strong> {validationResult.failCount}개
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
                    <h2 style={styles.cardTitle}>
                      최종 제출 파일 확인 / ZIP 다운로드
                    </h2>
                    <p style={styles.cardDescription}>
                      변환된 {getShortPlatformText()} 제출 파일을 확인한 뒤
                      ZIP으로 다운로드합니다.
                    </p>
                  </div>
                </div>

                <FinalSubmissionPreview
                  project={project}
                  platformName={getPackTypeText()}
                  platformSpec={platformSpec}
                  convertedImages={convertedImages}
                  representativeResult={representativeResult}
                  validationResult={validationResult}
                  zipFileName={getZipFileName()}
                  getConvertedImageUrl={getConvertedImageUrl}
                />

                <button
                  onClick={downloadPlatformZip}
                  style={styles.blackButton}
                >
                  {getZipButtonText()}
                </button>
              </section>
            )}
          </>
        )}

        {activeMenu === "LIST" && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>목록</span>
              <div>
                <h2 style={styles.cardTitle}>프로젝트 목록</h2>
                <p style={styles.cardDescription}>
                  로그인한 사용자만 이전 프로젝트 목록을 확인할 수 있습니다.
                </p>
              </div>
            </div>

            {!currentUser ? (
              <div style={styles.lockedBox}>
                <strong>로그인이 필요한 기능입니다.</strong>
                <p>
                  프로젝트 목록은 회원가입 / 로그인 후 사용할 수 있도록
                  분리했습니다.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMenu("LOGIN")}
                  style={styles.primaryButton}
                >
                  회원가입 / 로그인 하러 가기
                </button>
              </div>
            ) : (
              <>
                <div style={styles.authStatusBox}>
                  <strong>{currentUser.nickname}님의 프로젝트 목록</strong>
                  <p>지금까지 생성한 프로젝트를 최신순으로 5개씩 확인합니다.</p>
                </div>

                <button
                  type="button"
                  onClick={fetchProjectList}
                  style={styles.secondaryButton}
                >
                  {projectListLoading
                    ? "불러오는 중..."
                    : "프로젝트 목록 불러오기"}
                </button>

                {projectListError && (
                  <div style={styles.errorBox}>오류: {projectListError}</div>
                )}

                {projectList.length > 0 && (
                  <>
                    <div style={styles.projectListBox}>
                      {pagedProjectList.map((item) => (
                        <div key={item.id} style={styles.projectListItem}>
                          <div>
                            <strong>
                              #{item.id} {item.projectName}
                            </strong>
                            <p style={styles.projectListText}>
                              캐릭터: {item.characterName || "-"} / 플랫폼:{" "}
                              {item.targetPlatform || "-"} / 상태:{" "}
                              {item.status || "-"}
                            </p>
                            <p style={styles.projectListDate}>
                              생성일:{" "}
                              {item.createdAt
                                ? item.createdAt.replace("T", " ")
                                : "-"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.paginationBox}>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectListPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={projectListPage === 1}
                        style={{
                          ...styles.paginationButton,
                          opacity: projectListPage === 1 ? 0.4 : 1,
                          cursor:
                            projectListPage === 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        이전
                      </button>

                      <span style={styles.paginationText}>
                        {projectListPage} / {totalProjectPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setProjectListPage((prev) =>
                            Math.min(prev + 1, totalProjectPages),
                          )
                        }
                        disabled={projectListPage === totalProjectPages}
                        style={{
                          ...styles.paginationButton,
                          opacity:
                            projectListPage === totalProjectPages ? 0.4 : 1,
                          cursor:
                            projectListPage === totalProjectPages
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        다음
                      </button>
                    </div>
                  </>
                )}

                {projectList.length === 0 && !projectListLoading && (
                  <p style={styles.helperText}>
                    아직 불러온 프로젝트가 없습니다. 버튼을 눌러 목록을
                    조회해보세요.
                  </p>
                )}
              </>
            )}
          </section>
        )}

        {activeMenu === "LOGIN" && (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepNumber}>회원</span>
              <div>
                <h2 style={styles.cardTitle}>회원가입 / 로그인</h2>
                <p style={styles.cardDescription}>
                  지금은 프론트 화면 테스트용 회원 기능입니다. 실제 저장과
                  보안은 다음 단계에서 백엔드로 연결할 예정입니다.
                </p>
              </div>
            </div>

            <div style={styles.authStatusBox}>
              {currentUser ? (
                <>
                  <strong>{currentUser.nickname}님이 로그인 중입니다.</strong>
                  <p>
                    로그인한 사용자만 프로젝트 목록을 볼 수 있게 구성했습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={styles.smallOutlineButton}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <strong>현재 로그인하지 않았습니다.</strong>
                  <p>
                    프로젝트 목록은 로그인 후 사용할 수 있도록 잠가두었습니다.
                  </p>
                </>
              )}
            </div>

            <div style={styles.authGrid}>
              <div style={styles.authPanel}>
                <h3>회원가입</h3>
                <label style={styles.label}>
                  아이디
                  <input
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    style={styles.input}
                    placeholder="예: ketokki"
                  />
                </label>
                <label style={styles.label}>
                  비밀번호
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={styles.input}
                    placeholder="테스트용 비밀번호"
                  />
                </label>
                <label style={styles.label}>
                  닉네임
                  <input
                    value={signupNickname}
                    onChange={(e) => setSignupNickname(e.target.value)}
                    style={styles.input}
                    placeholder="예: 영우"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSignup}
                  style={styles.primaryButton}
                >
                  회원가입하기
                </button>
              </div>

              <div style={styles.authPanel}>
                <h3>로그인</h3>
                <label style={styles.label}>
                  아이디
                  <input
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    style={styles.input}
                    placeholder="가입한 아이디"
                  />
                </label>
                <label style={styles.label}>
                  비밀번호
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={styles.input}
                    placeholder="가입한 비밀번호"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleLogin}
                  style={styles.greenButton}
                >
                  로그인하기
                </button>
              </div>
            </div>

            <div style={styles.memberListBox}>
              <h3>가입한 사람 / 로그인 상태</h3>
              {members.length === 0 ? (
                <p style={styles.helperText}>
                  아직 가입한 테스트 회원이 없습니다.
                </p>
              ) : (
                <div style={styles.memberGrid}>
                  {members.map((member) => (
                    <div key={member.id} style={styles.memberCard}>
                      <strong>{member.nickname}</strong>
                      <p>아이디: {member.username}</p>
                      <p>가입일: {member.createdAt}</p>
                      {currentUser?.id === member.id && (
                        <span style={styles.loginBadge}>현재 로그인 중</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section style={styles.creatorSection}>
          <div style={styles.creatorPaper}>
            <div style={styles.creatorTapeLeft}></div>
            <div style={styles.creatorTapeRight}></div>

            <div style={styles.creatorPhotoArea}>
              <div style={styles.creatorPhotoFrame}>
                <img
                  src={creatorBanner}
                  alt="제작자 영우"
                  style={styles.creatorPhoto}
                />
              </div>
            </div>

            <div style={styles.creatorTextArea}>
              <p style={styles.creatorMiniTitle}>creator note</p>

              <h3 style={styles.creatorName}>영우(OWOO)</h3>

              <p style={styles.creatorMemo}>
                여행과 감성을 기록하고
                <br />
                직접 필요하다고 느낀 서비스를
                <br />
                기획하고 만듭니다.
              </p>

              <div style={styles.creatorInfoList}>
                <div style={styles.creatorInfoRow}>
                  <span style={styles.creatorInfoLabel}>인스타그램</span>
                  <span style={styles.creatorInfoValue}>@90bodol</span>
                </div>

                <div style={styles.creatorInfoRow}>
                  <span style={styles.creatorInfoLabel}>이메일</span>
                  <span style={styles.creatorInfoValue}>
                    qhwn0130@naver.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {editingImageIndex !== null && previewImages[editingImageIndex] && (
        <ImageCropEditor
          image={previewImages[editingImageIndex]}
          targetWidth={getCropTargetWidth()}
          targetHeight={getCropTargetHeight()}
          platformName={getPackTypeText()}
          onClose={closeImageEditor}
          onApply={applyEditedImage}
        />
      )}
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
        borderColor: isDone ? "#bdeec8" : isReady ? "#cfe8ff" : "#f0d8e0",
        backgroundColor: isDone ? "#fbfffb" : isReady ? "#f8fcff" : "#fffdfd",
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
    padding: "36px 24px 60px",
    fontFamily: '"Nunito", "Noto Sans KR", "Malgun Gothic", sans-serif',
    background:
      "linear-gradient(180deg, #fffaf6 0%, #fffdfb 35%, #fff8fb 100%)",
    color: "#5f5552",
  },

  header: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "34px 28px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg, #ffe6ef 0%, #fff8d9 35%, #dff4ff 70%, #f6e7ff 100%)",
    boxShadow: "0 14px 36px rgba(213, 169, 186, 0.18)",
    textAlign: "center",
    border: "2px solid #ffffff",
    position: "relative",
    overflow: "hidden",
  },

  badge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "#fff8ff",
    border: "2px solid #f7c7d8",
    color: "#de7997",
    fontSize: "15px",
    fontWeight: "800",
    marginBottom: "12px",
    boxShadow: "0 4px 10px rgba(222, 121, 151, 0.12)",
  },

  title: {
    fontSize: "46px",
    margin: "0 0 10px",
    letterSpacing: "-1px",
    color: "#5f4d62",
    fontWeight: "800",
  },

  subtitle: {
    margin: 0,
    color: "#7a6f72",
    fontSize: "18px",
    lineHeight: 1.6,
  },

  platformSummaryCard: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "24px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, #fffefc 0%, #fff5f8 45%, #fdf7ff 100%)",
    color: "#5f5552",
    display: "grid",
    gridTemplateColumns: "1.15fr 1.85fr",
    gap: "22px",
    boxShadow: "0 10px 28px rgba(196, 170, 176, 0.12)",
    border: "2px solid #f8e3ea",
  },

  summaryEyebrow: {
    margin: "0 0 8px",
    color: "#de7997",
    fontSize: "16px",
    fontWeight: "700",
    fontFamily: '"Gaegu", cursive',
  },

  summaryTitle: {
    margin: "0 0 10px",
    fontSize: "30px",
    color: "#5a4b60",
    fontWeight: "800",
  },

  summaryDescription: {
    margin: 0,
    color: "#746b69",
    lineHeight: 1.7,
    fontSize: "16px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
    gap: "12px",
  },

  summaryItem: {
    padding: "14px 12px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1.5px solid #f4dfe7",
    boxShadow: "0 6px 14px rgba(221, 196, 205, 0.12)",
  },

  summaryLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#c47f98",
    fontSize: "13px",
    fontWeight: "700",
  },

  summaryValue: {
    display: "block",
    color: "#5d5350",
    fontSize: "15px",
    fontWeight: "800",
  },

  stepBoard: {
    maxWidth: "1120px",
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
    border: "2px solid #f0d8e0",
    borderRadius: "22px",
    background: "#fffdfd",
    boxShadow: "0 6px 14px rgba(220, 190, 198, 0.09)",
  },

  stepCircle: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffb6cc 0%, #f5a4e0 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    boxShadow: "0 4px 10px rgba(237, 149, 183, 0.25)",
  },

  stepStatus: {
    margin: "4px 0 0",
    color: "#8b7f7c",
    fontSize: "13px",
  },

  workflowTipBox: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "16px 18px",
    borderRadius: "20px",
    background: "#fff8df",
    border: "2px solid #f8e7ae",
    lineHeight: 1.7,
    color: "#756553",
    boxShadow: "0 6px 12px rgba(240, 224, 163, 0.12)",
  },

  freeTrialGuideBox: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "22px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg, #fff8fb 0%, #fffdf2 45%, #f3fbff 100%)",
    border: "2px solid #f5dce5",
    boxShadow: "0 10px 24px rgba(218, 189, 197, 0.12)",
  },

  freeTrialBadge: {
    display: "inline-block",
    margin: "0 0 8px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#fff",
    border: "2px solid #f6c8d7",
    color: "#e26f93",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },

  freeTrialTitle: {
    margin: "0 0 8px",
    color: "#5b4a5f",
    fontSize: "24px",
    fontWeight: "900",
  },

  freeTrialDescription: {
    margin: "0 0 18px",
    color: "#756d6a",
    lineHeight: 1.7,
  },

  freeTrialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },

  freeTrialItem: {
    padding: "16px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    border: "1.8px solid #f1dfe6",
    boxShadow: "0 6px 14px rgba(230, 205, 214, 0.12)",
  },

  freeTrialIcon: {
    display: "inline-flex",
    width: "34px",
    height: "34px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffe0ea 0%, #e7d5ff 100%)",
    marginBottom: "8px",
    fontSize: "18px",
  },

  usageStatusBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    border: "2px solid #f1dfe6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    boxShadow: "0 6px 14px rgba(230, 205, 214, 0.12)",
  },

  usageStatusText: {
    margin: "6px 0 0",
    color: "#756d6a",
    lineHeight: 1.6,
  },

  usageStatusError: {
    margin: "6px 0 0",
    color: "#d26081",
    fontWeight: "800",
  },

  usageStatusBadge: {
    padding: "9px 14px",
    borderRadius: "999px",
    border: "2px solid",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  freeTrialNotice: {
    marginTop: "14px",
    padding: "14px 16px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.6,
  },

  freeTrialGuideBox: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "22px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg, #fff8fb 0%, #fffdf2 45%, #f3fbff 100%)",
    border: "2px solid #f5dce5",
    boxShadow: "0 10px 24px rgba(218, 189, 197, 0.12)",
  },

  freeTrialBadge: {
    display: "inline-block",
    margin: "0 0 8px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#fff",
    border: "2px solid #f6c8d7",
    color: "#e26f93",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },

  freeTrialTitle: {
    margin: "0 0 8px",
    color: "#5b4a5f",
    fontSize: "24px",
    fontWeight: "900",
  },

  freeTrialDescription: {
    margin: "0 0 18px",
    color: "#756d6a",
    lineHeight: 1.7,
  },

  freeTrialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },

  freeTrialItem: {
    padding: "16px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    border: "1.8px solid #f1dfe6",
    boxShadow: "0 6px 14px rgba(230, 205, 214, 0.12)",
  },

  freeTrialIcon: {
    display: "inline-flex",
    width: "34px",
    height: "34px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffe0ea 0%, #e7d5ff 100%)",
    marginBottom: "8px",
    fontSize: "18px",
  },

  freeTrialNotice: {
    marginTop: "14px",
    padding: "14px 16px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.6,
  },

  layout: {
    maxWidth: "1120px",
    margin: "0 auto",
  },

  card: {
    marginTop: "24px",
    padding: "28px",
    border: "2px solid #f3e2e8",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, #fffefe 0%, #fffafb 60%, #fffefd 100%)",
    boxShadow: "0 10px 28px rgba(205, 180, 188, 0.11)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "20px",
  },

  stepNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f8acc4 0%, #d7b1ff 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(223, 164, 195, 0.2)",
  },

  cardTitle: {
    margin: 0,
    color: "#5b4a5f",
    fontSize: "26px",
    fontWeight: "800",
  },

  cardDescription: {
    margin: "4px 0 0",
    color: "#857976",
    lineHeight: 1.6,
  },

  platformButtonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
    marginBottom: "16px",
  },

  platformButton: {
    padding: "11px 18px",
    border: "2px solid #eed7df",
    borderRadius: "999px",
    fontWeight: "800",
    cursor: "pointer",
    background: "#fff",
    color: "#6c5e5e",
    boxShadow: "0 4px 8px rgba(235, 210, 218, 0.1)",
  },

  packTypeBox: {
    marginTop: "14px",
    padding: "16px",
    borderRadius: "20px",
    background: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
  },

  prepareText: {
    marginTop: "14px",
    color: "#9c7a3a",
    fontWeight: "800",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontWeight: "800",
    marginBottom: "12px",
    color: "#675c5a",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginTop: "6px",
    border: "2px solid #f0dde3",
    borderRadius: "16px",
    backgroundColor: "#fffdfd",
    color: "#5f5552",
    outline: "none",
  },

  disabledInput: {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginTop: "6px",
    border: "2px solid #f0dde3",
    borderRadius: "16px",
    backgroundColor: "#f9f4f6",
    color: "#7f7471",
  },

  primaryButton: buttonStyle(
    "linear-gradient(135deg, #ffb4c7 0%, #f6a7dd 100%)",
  ),
  darkButton: buttonStyle("linear-gradient(135deg, #ffbcd2 0%, #ffc9a7 100%)"),
  blueButton: buttonStyle("linear-gradient(135deg, #a9dcff 0%, #d4b3ff 100%)"),
  greenButton: buttonStyle("linear-gradient(135deg, #bdeec8 0%, #a9e7db 100%)"),
  purpleButton: buttonStyle(
    "linear-gradient(135deg, #d9c2ff 0%, #f1bde8 100%)",
  ),
  blackButton: buttonStyle("linear-gradient(135deg, #ffc6d7 0%, #f8d4a6 100%)"),

  resultBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "20px",
    background: "#fffdfd",
    border: "2px solid #f3e2e8",
    boxShadow: "0 4px 12px rgba(233, 207, 216, 0.1)",
  },

  uploadBox: {
    padding: "18px",
    border: "2px dashed #eab8ca",
    borderRadius: "20px",
    background: "#fffafb",
  },

  publicLimitBox: {
    marginTop: "14px",
    padding: "14px 16px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.6,
  },

  resetButton: {
    marginTop: "12px",
    padding: "10px 16px",
    border: "2px solid #ffcbd4",
    borderRadius: "14px",
    background: "#fff3f6",
    color: "#ca5878",
    fontWeight: "800",
    cursor: "pointer",
  },

  countBox: {
    marginTop: "16px",
    padding: "16px",
    border: "2px solid #f3e2e8",
    borderRadius: "18px",
    backgroundColor: "#fffefe",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  countText: {
    margin: "4px 0 0",
    color: "#857976",
  },

  countGood: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#eefced",
    color: "#4f8c63",
    fontWeight: "800",
    border: "1px solid #cce8d3",
  },

  countWarn: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#fff8df",
    color: "#9b7f3d",
    fontWeight: "800",
    border: "1px solid #f2e4a8",
  },

  countBad: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#fff0f4",
    color: "#d26181",
    fontWeight: "800",
    border: "1px solid #f7ccd9",
  },

  previewSection: {
    marginTop: "24px",
  },

  helperText: {
    color: "#857976",
    marginTop: "-4px",
    lineHeight: 1.6,
  },

  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "14px",
    marginTop: "12px",
  },

  slotCard: {
    position: "relative",
    minHeight: "282px",
    padding: "12px",
    border: "2px solid #f0dfe5",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow: "0 6px 12px rgba(235, 215, 220, 0.08)",
  },

  slotNumber: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
  },

  selectedBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#ff9eb8",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "800",
  },

  slotImage: {
    width: "100%",
    height: "110px",
    objectFit: "contain",
    backgroundColor: "#fff8fa",
    borderRadius: "14px",
  },

  slotName: {
    margin: "8px 0 4px",
    fontSize: "12px",
    wordBreak: "break-all",
    color: "#6d6361",
  },

  emptySlot: {
    height: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#c1b6b3",
    fontSize: "13px",
  },

  moveButtonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    marginTop: "8px",
  },

  moveButton: {
    padding: "6px 9px",
    border: "1.5px solid #eed8e2",
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    color: "#7c6f6b",
  },

  editButton: {
    marginTop: "8px",
    padding: "7px 12px",
    border: "1.5px solid #cfe8ff",
    borderRadius: "10px",
    backgroundColor: "#f3f9ff",
    color: "#5d89b5",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  deleteButton: {
    marginTop: "8px",
    padding: "7px 12px",
    border: "1.5px solid #ffd3dc",
    borderRadius: "10px",
    backgroundColor: "#fff3f6",
    color: "#cf6481",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  previewNumber: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
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
    border: "2px solid #f0dfe5",
    borderRadius: "20px",
    backgroundColor: "#fffefd",
    textAlign: "center",
    boxShadow: "0 6px 12px rgba(235, 215, 220, 0.08)",
  },

  convertedPreviewImage: {
    width: "100%",
    height: "130px",
    objectFit: "contain",
    backgroundColor: "#fff8fa",
    borderRadius: "14px",
  },

  previewName: {
    margin: "8px 0 4px",
    fontSize: "13px",
    wordBreak: "break-all",
    color: "#6d6361",
  },

  previewSize: {
    margin: 0,
    fontSize: "12px",
    color: "#9a8f8b",
  },

  convertNoticeBox: {
    marginBottom: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    backgroundColor: "#f8fcff",
    border: "2px solid #d7ebff",
    color: "#6b7f92",
  },

  validationGuideBox: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f5e4a4",
    color: "#746553",
  },

  validationFailItem: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    backgroundColor: "#fff3f6",
    border: "1.5px solid #ffd3dd",
  },

  successBox: {
    maxWidth: "1120px",
    margin: "16px auto",
    padding: "14px 18px",
    borderRadius: "16px",
    backgroundColor: "#effcef",
    color: "#548266",
    border: "2px solid #d5ecd8",
  },

  errorBox: {
    maxWidth: "1120px",
    margin: "16px auto",
    padding: "14px 18px",
    borderRadius: "16px",
    backgroundColor: "#fff1f5",
    color: "#d26081",
    border: "2px solid #f8d0db",
  },

  table: {
    borderCollapse: "separate",
    borderSpacing: 0,
    width: "100%",
    marginTop: "12px",
    backgroundColor: "#fffefd",
    borderRadius: "18px",
    overflow: "hidden",
    border: "2px solid #f0dfe5",
  },

  th: {
    borderBottom: "1px solid #f0dfe5",
    padding: "12px",
    backgroundColor: "#fff5f8",
    textAlign: "left",
    color: "#7d6f72",
    fontWeight: "800",
  },

  td: {
    borderBottom: "1px solid #f7ebef",
    padding: "12px",
    color: "#5d5452",
  },

  validationSummary: {
    padding: "16px",
    borderRadius: "18px",
    marginTop: "16px",
    marginBottom: "20px",
    border: "2px solid #f0dfe5",
  },

  menuTabBox: {
    maxWidth: "1120px",
    margin: "0 auto 24px",
    padding: "18px 22px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg, #fff8fb 0%, #fffdf5 50%, #f8f2ff 100%)",
    border: "2px solid #f3dbe5",
    boxShadow: "0 10px 24px rgba(218, 189, 197, 0.14)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  menuTabButton: {
    minWidth: "160px",
    padding: "14px 22px",
    border: "2px solid #eed7df",
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    color: "#5f5552",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(235, 210, 218, 0.14)",
  },

  menuTabButtonActive: {
    background: "linear-gradient(135deg, #ff9fbe 0%, #d3a7ff 100%)",
    color: "#ffffff",
    borderColor: "#ffffff",
    boxShadow: "0 8px 18px rgba(224, 151, 195, 0.28)",
  },

  paginationBox: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },

  paginationButton: {
    padding: "9px 14px",
    border: "1.5px solid #f0d8df",
    borderRadius: "12px",
    backgroundColor: "#fff",
    color: "#c2185b",
    fontWeight: "800",
    cursor: "pointer",
  },

  paginationText: {
    color: "#6c5e5e",
    fontWeight: "800",
  },

  prepareBox: {
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.7,
  },

  guideBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "18px",
  },

  guideItem: {
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    gap: "14px",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#fffafc",
    border: "1.5px solid #f2d5df",
  },

  guideStep: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffb5cb 0%, #d8b8ff 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  guideNoticeBox: {
    marginTop: "18px",
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.7,
  },

  platformSummaryCardInside: {
    marginTop: "24px",
    padding: "24px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, #fffefc 0%, #fff5f8 45%, #fdf7ff 100%)",
    color: "#5f5552",
    display: "grid",
    gridTemplateColumns: "1.15fr 1.85fr",
    gap: "22px",
    boxShadow: "0 10px 28px rgba(196, 170, 176, 0.12)",
    border: "2px solid #f8e3ea",
  },

  quickGuideGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  quickGuideCard: {
    padding: "18px",
    borderRadius: "22px",
    backgroundColor: "#fffafc",
    border: "1.8px solid #f1dfe6",
    boxShadow: "0 6px 14px rgba(230, 205, 214, 0.12)",
    lineHeight: 1.6,
  },

  quickGuideIcon: {
    display: "inline-flex",
    width: "38px",
    height: "38px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ffe0ea 0%, #e7d5ff 100%)",
    marginBottom: "10px",
    fontSize: "20px",
  },

  freeTrialGuideBoxCompact: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #fff8fb 0%, #fffdf2 45%, #f3fbff 100%)",
    border: "2px solid #f5dce5",
  },

  lockedBox: {
    padding: "24px",
    borderRadius: "22px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.8,
  },

  authStatusBox: {
    marginBottom: "18px",
    padding: "18px",
    borderRadius: "20px",
    backgroundColor: "#fff8df",
    border: "2px solid #f8e7ae",
    color: "#756553",
    lineHeight: 1.7,
  },

  authGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  authPanel: {
    padding: "20px",
    borderRadius: "22px",
    backgroundColor: "#fffafc",
    border: "2px solid #f1dfe6",
  },

  smallOutlineButton: {
    marginTop: "10px",
    padding: "9px 14px",
    border: "1.5px solid #f0d8df",
    borderRadius: "12px",
    backgroundColor: "#fff",
    color: "#c2185b",
    fontWeight: "800",
    cursor: "pointer",
  },

  memberListBox: {
    marginTop: "22px",
    padding: "20px",
    borderRadius: "22px",
    backgroundColor: "#fffefd",
    border: "2px solid #f1dfe6",
  },

  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },

  memberCard: {
    position: "relative",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#fffafc",
    border: "1.5px solid #f2d5df",
  },

  loginBadge: {
    display: "inline-block",
    marginTop: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "#eefced",
    color: "#4f8c63",
    fontWeight: "900",
    fontSize: "12px",
  },

  creatorSection: {
    marginTop: "38px",
    marginBottom: "44px",
    display: "flex",
    justifyContent: "center",
  },

  creatorPaper: {
    width: "100%",
    maxWidth: "620px",
    position: "relative",
    display: "grid",
    gridTemplateColumns: "100px 1fr",
    gap: "18px",
    alignItems: "center",
    padding: "20px 22px",
    borderRadius: "26px",
    background: "linear-gradient(180deg, #fffdfd 0%, #fff8fb 100%)",
    border: "2px dashed #efc9d4",
    boxShadow: "0 10px 20px rgba(218, 189, 197, 0.12)",
  },

  creatorTapeLeft: {
    position: "absolute",
    top: "-9px",
    left: "42px",
    width: "72px",
    height: "20px",
    backgroundColor: "rgba(255, 213, 224, 0.85)",
    borderRadius: "6px",
    transform: "rotate(-8deg)",
  },

  creatorTapeRight: {
    position: "absolute",
    top: "-8px",
    right: "52px",
    width: "76px",
    height: "20px",
    backgroundColor: "rgba(255, 241, 203, 0.9)",
    borderRadius: "6px",
    transform: "rotate(8deg)",
  },

  creatorPhotoArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  creatorPhotoFrame: {
    width: "84px",
    height: "110px",
    padding: "5px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "2px solid #f4d9e2",
    boxShadow: "0 5px 12px rgba(80, 60, 50, 0.07)",
    transform: "rotate(-3deg)",
  },

  creatorPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
  },

  creatorTextArea: {
    textAlign: "left",
    color: "#4b403b",
  },

  creatorMiniTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    color: "#d07f98",
    fontWeight: "700",
    letterSpacing: "0.3px",
    fontFamily: '"Gaegu", cursive',
  },

  creatorName: {
    margin: "0 0 8px 0",
    fontSize: "30px",
    lineHeight: 1.05,
    color: "#eb6f92",
    fontWeight: "700",
    fontFamily: '"Gaegu", cursive',
  },

  creatorMemo: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#5d514c",
    fontWeight: "700",
  },

  creatorInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },

  creatorInfoRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "14px",
    backgroundColor: "#fffefd",
    border: "1.5px solid #f0d8df",
  },

  creatorInfoLabel: {
    minWidth: "80px",
    fontSize: "14px",
    color: "#d07f98",
    fontWeight: "800",
  },

  creatorInfoValue: {
    fontSize: "14px",
    color: "#4d433f",
    fontWeight: "700",
  },
};

function buttonStyle(background) {
  return {
    marginTop: "12px",
    padding: "13px 22px",
    cursor: "pointer",
    border: "2px solid rgba(255,255,255,0.8)",
    borderRadius: "16px",
    background,
    color: "#5f5552",
    fontWeight: "800",
    boxShadow: "0 8px 18px rgba(225, 193, 203, 0.18)",
  };
}

export default App;
