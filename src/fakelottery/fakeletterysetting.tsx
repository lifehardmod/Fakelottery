import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";

interface LotteryLine {
  numbers: number[];
}

const FakeLotterySetting = () => {
  const [qrInput, setQrInput] = useState("");
  const [selectedPrize, setSelectedPrize] = useState<1 | 2 | 3>(1);
  const [selectedLine, setSelectedLine] = useState<number>(0); // 0=A, 1=B, 2=C, 3=D, 4=E
  const [availableLines, setAvailableLines] = useState<number>(0); // 사용 가능한 줄 수
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const parseQR = (qrUrl: string) => {
    try {
      const vIndex = qrUrl.indexOf("v=");
      if (vIndex === -1) return null;

      const data = qrUrl.substring(vIndex + 2);
      const round = parseInt(data.substring(0, 4));

      const lines: LotteryLine[] = [];
      let currentPos = 4;

      while (currentPos < data.length) {
        // 알파벳 찾기 (q, m, n 등)
        const letter = data[currentPos];
        if (!/[a-z]/i.test(letter)) break;

        currentPos++;

        // 12자리 숫자 읽기 (2자리씩 6개)
        const numbersStr = data.substring(currentPos, currentPos + 12);
        if (numbersStr.length !== 12) break;

        const numbers: number[] = [];
        for (let i = 0; i < 12; i += 2) {
          const num = parseInt(numbersStr.substring(i, i + 2));
          numbers.push(num);
        }

        // 00이 아닌 숫자만 있는 경우에만 추가
        if (!numbers.every((n) => n === 0)) {
          lines.push({ numbers });
        }

        currentPos += 12;
      }

      return { round, lines };
    } catch (error) {
      console.error("QR 파싱 오류:", error);
      return null;
    }
  };

  const handleQrInputChange = (value: string) => {
    setQrInput(value);

    // URL 파싱하여 사용 가능한 줄 수 계산
    const parsed = parseQR(value);
    if (parsed && parsed.lines.length > 0) {
      setAvailableLines(parsed.lines.length);
      // 선택된 줄이 범위를 벗어나면 0으로 리셋
      if (selectedLine >= parsed.lines.length) {
        setSelectedLine(0);
      }
    } else {
      setAvailableLines(0);
    }
  };

  const startQrScanner = async () => {
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // 카메라로 직접 시작 (권한 요청 한 번만)
      await html5QrCode.start(
        { facingMode: "environment" }, // 후면 카메라 선호

        {
          fps: 15, // 프레임 레이트 증가
          qrbox: { width: 300, height: 300 }, // QR 박스 크기 증가
          aspectRatio: 1.0, // 정사각형 비율
          disableFlip: false, // 좌우 반전 허용
          videoConstraints: {
            width: { min: 640, ideal: 1280, max: 1920 }, // 고해상도 요청
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment",
          },
        },
        (decodedText) => {
          // QR 코드 스캔 성공
          handleQrInputChange(decodedText);
          stopQrScanner();
        },
        () => {
          // 스캔 실패는 무시 (계속 시도)
        }
      );
    } catch (err) {
      console.error("카메라 시작 오류:", err);

      let errorMessage = "카메라에 접근할 수 없습니다.\n\n";

      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMessage = "카메라 권한이 거부되었습니다.\n\n";
          errorMessage +=
            "브라우저 주소창 옆의 자물쇠/설정 아이콘을 클릭하여\n";
          errorMessage += "카메라 권한을 허용해주세요.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMessage = "카메라를 찾을 수 없습니다.\n\n";
          errorMessage += "장치에 카메라가 연결되어 있는지 확인해주세요.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMessage = "카메라를 사용할 수 없습니다.\n\n";
          errorMessage += "다른 앱에서 카메라를 사용 중이거나\n";
          errorMessage += "카메라에 문제가 있을 수 있습니다.";
        }
      }

      errorMessage += "\n\n대안: URL을 직접 붙여넣어도 됩니다.";

      alert(errorMessage);
      setIsScanning(false);
    }
  };

  const stopQrScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("카메라 종료 오류:", err);
      }
    }
    setIsScanning(false);
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleSubmit = () => {
    const parsed = parseQR(qrInput);
    if (!parsed || parsed.lines.length === 0) {
      alert("올바른 QR 코드를 입력해주세요.");
      return;
    }

    // 선택된 줄이 범위를 벗어나면 경고
    if (selectedLine >= parsed.lines.length) {
      alert(`선택한 줄이 존재하지 않습니다. (총 ${parsed.lines.length}줄)`);
      return;
    }

    // 선택된 줄을 기준으로 당첨번호 생성
    const targetLine = parsed.lines[selectedLine].numbers;
    let winningNumbers: number[];
    let bonusNumber: number;
    let targetLineNumbers: number[];

    // 선택된 등수에 따라 선택된 줄과 당첨번호 설정
    if (selectedPrize === 1) {
      // 1등: 선택된 줄 = 당첨번호
      winningNumbers = [...targetLine].sort((a, b) => a - b);
      targetLineNumbers = targetLine; // 원본 순서 유지

      // 보너스 번호 생성
      do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
      } while (winningNumbers.includes(bonusNumber));
    } else if (selectedPrize === 2) {
      // 2등: 선택된 줄의 5개 + 보너스
      const sortedTarget = [...targetLine].sort((a, b) => a - b);
      winningNumbers = sortedTarget;

      // 선택된 줄에 없는 번호를 보너스로 선택
      do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
      } while (targetLine.includes(bonusNumber));

      // 선택된 줄의 마지막 숫자를 보너스로 교체
      targetLineNumbers = [...targetLine.slice(0, 5), bonusNumber];
    } else {
      // 3등: 선택된 줄의 5개만 맞음
      const sortedTarget = [...targetLine].sort((a, b) => a - b);
      winningNumbers = sortedTarget;

      // 보너스 번호 생성
      do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
      } while (winningNumbers.includes(bonusNumber));

      // 선택된 줄의 마지막 숫자를 틀린 숫자로 교체
      let wrongNumber: number;
      do {
        wrongNumber = Math.floor(Math.random() * 45) + 1;
      } while (
        winningNumbers.includes(wrongNumber) ||
        wrongNumber === bonusNumber
      );
      targetLineNumbers = [...targetLine.slice(0, 5), wrongNumber];
    }

    // 각 줄의 등수 계산
    const results = parsed.lines.map((line, idx) => {
      // 선택된 줄은 위에서 설정한 값 사용
      if (idx === selectedLine) {
        const matchCount = targetLineNumbers.filter((num) =>
          winningNumbers.includes(num)
        ).length;
        const hasBonus = targetLineNumbers.includes(bonusNumber);

        let prize: string;
        if (matchCount === 6) {
          prize = "1등당첨";
        } else if (matchCount === 5 && hasBonus) {
          prize = "2등당첨";
        } else if (matchCount === 5) {
          prize = "3등당첨";
        } else if (matchCount === 4) {
          prize = "4등당첨";
        } else if (matchCount === 3) {
          prize = "5등당첨";
        } else {
          prize = "낙첨";
        }

        return { numbers: targetLineNumbers, prize };
      }

      // 나머지 줄들은 원본 유지
      const matchCount = line.numbers.filter((num) =>
        winningNumbers.includes(num)
      ).length;
      const hasBonus = line.numbers.includes(bonusNumber);

      let prize: string;
      if (matchCount === 6) {
        prize = "1등당첨";
      } else if (matchCount === 5 && hasBonus) {
        prize = "2등당첨";
      } else if (matchCount === 5) {
        prize = "3등당첨";
      } else if (matchCount === 4) {
        prize = "4등당첨";
      } else if (matchCount === 3) {
        prize = "5등당첨";
      } else {
        prize = "낙첨";
      }

      return { numbers: line.numbers, prize };
    });

    // 데이터를 URL 파라미터로 전달
    const params = new URLSearchParams({
      round: parsed.round.toString(),
      winning: winningNumbers.join(","),
      bonus: bonusNumber.toString(),
      lines: JSON.stringify(results),
    });

    navigate(`/FakeLottery?${params.toString()}`);
  };

  return (
    <div className="w-full  flex flex-col items-center min-h-screen justify-center  bg-gray-50">
      <div className="w-full max-w-md bg-white p-6">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          복권 설정
        </h1>{" "}
        <h2 className="text-xs text-center mb-5 text-gray-800">
          가지고 계신 복권을 당첨된 것 처럼 바꿔드립니다.
        </h2>
        {/* 단계 1: 복권 정보 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            1. 복권 정보 입력
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-sm"
            rows={3}
            value={qrInput}
            onChange={(e) => handleQrInputChange(e.target.value)}
            placeholder="복권 QR URL을 붙여넣으세요"
          />
          <button
            type="button"
            className="w-full py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium text-sm"
            onClick={startQrScanner}
          >
            <Camera size={18} />
            카메라로 QR 스캔하기
          </button>
          {availableLines > 0 && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700 text-center">
                ✓ {availableLines}개의 복권 줄이 감지되었습니다
              </p>
            </div>
          )}
        </div>
        {/* QR 스캐너 모달 */}
        {isScanning && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-5 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  QR 코드 스캔
                </h3>
                <button
                  onClick={stopQrScanner}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                  title="닫기"
                >
                  <X size={24} />
                </button>
              </div>
              <div
                id="qr-reader"
                className="w-full rounded-md overflow-hidden"
              ></div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 text-center">
                  복권의 QR 코드를 초록색 박스 안에 맞춰주세요
                </p>
                <div className="text-xs text-gray-600 bg-gray-50 rounded p-3">
                  <p className="font-semibold mb-1">📌 인식이 잘 안 된다면:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• 밝은 곳에서 시도하세요</li>
                    <li>• QR 코드를 평평하게 펴세요</li>
                    <li>• 카메라를 QR에 가까이/멀리 조절하세요</li>
                    <li>• QR이 흔들리지 않게 고정하세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 단계 2: 당첨 줄 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            2. 당첨시킬 줄 선택
          </label>
          <div className="flex gap-2">
            {["A", "B", "C", "D", "E"].map((letter, idx) => {
              const isAvailable = idx < availableLines;
              return (
                <button
                  key={letter}
                  className={`flex-1 py-3 px-3 rounded-md font-semibold text-base transition ${
                    !isAvailable
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : selectedLine === idx
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500"
                  }`}
                  onClick={() => isAvailable && setSelectedLine(idx)}
                  disabled={!isAvailable}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
        {/* 단계 3: 당첨 등수 선택 */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            3. 당첨 등수 선택
          </label>
          <div className="flex gap-3">
            <button
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-base transition ${
                selectedPrize === 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-400 text-gray-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedPrize(1)}
            >
              1등
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-base transition ${
                selectedPrize === 2
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-400 text-gray-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedPrize(2)}
            >
              2등
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-base transition ${
                selectedPrize === 3
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-400 text-gray-700 hover:border-blue-500"
              }`}
              onClick={() => setSelectedPrize(3)}
            >
              3등
            </button>
          </div>
        </div>
        {/* 법적 경고 */}
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-md">
          <div className="flex items-start gap-2">
            <div className="text-xs leading-relaxed text-red-800">
              <p>
                생성된 결과를 이용해 타인에게 금전적 이익(환전, 판매, 보상 청구
                등)을 목적으로 이용하는 모든 행위는 <strong>불법</strong>입니다.
              </p>
              <p className="mt-1">
                이러한 행위는{" "}
                <strong>사기죄, 전자금융거래법 위반, 부정경쟁행위</strong> 등
                관련 법령에 따라{" "}
                <strong>형사처벌 및 민사상 손해배상 책임</strong>을 초래할 수
                있습니다. 재미로만 이용해주세요
              </p>
            </div>
          </div>
        </div>
        {/* 생성 버튼 */}
        <button
          className={`w-full py-3.5 rounded-md font-bold text-base transition ${
            availableLines > 0
              ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={availableLines === 0}
        >
          {availableLines > 0
            ? "복권 생성하기"
            : "복권 정보를 먼저 입력해주세요"}
        </button>
      </div>
    </div>
  );
};

export default FakeLotterySetting;
