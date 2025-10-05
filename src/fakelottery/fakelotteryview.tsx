import { Clover, Menu, Notebook, PhoneCall, User2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { useMemo } from "react";
import MyNumber from "./MyNumber";

interface LotteryResult {
  numbers: number[];
  prize: string;
}

const FakeLottery = () => {
  const [searchParams] = useSearchParams();

  const lotteryData = useMemo(() => {
    const round = parseInt(searchParams.get("round") || "654");
    const winningStr = searchParams.get("winning") || "1,10,20,30,40,45";
    const bonus = parseInt(searchParams.get("bonus") || "45");
    const linesStr = searchParams.get("lines") || "[]";

    const winning = winningStr.split(",").map(Number);
    const lines: LotteryResult[] = JSON.parse(linesStr);

    // 1100회차 = 2023.12.30
    const baseRound = 1100;
    const baseDate = new Date(2023, 11, 30); // 2023년 12월 30일
    const roundDiff = round - baseRound;
    const drawDate = new Date(baseDate);
    drawDate.setDate(drawDate.getDate() + roundDiff * 7);

    const dateStr = `${drawDate.getFullYear()}-${String(
      drawDate.getMonth() + 1
    ).padStart(2, "0")}-${String(drawDate.getDate()).padStart(2, "0")}`;

    // 총 당첨금 계산 (랜덤 10억~20억)
    const totalPrize = Math.floor(Math.random() * 1000000000) + 1000000000;
    const totalPrizeStr = totalPrize.toLocaleString("ko-KR");

    return {
      round,
      winning,
      bonus,
      lines,
      dateStr,
      totalPrizeStr,
    };
  }, [searchParams]);

  const getNumberColor = (num: number) => {
    if (num >= 1 && num <= 10) return "bg-[#e4a716]";
    if (num >= 11 && num <= 20) return "bg-[#1993da]";
    if (num >= 21 && num <= 30) return "bg-[#e96353]";
    if (num >= 31 && num <= 40) return "bg-[#8f8f8f]";
    if (num >= 41 && num <= 45) return "bg-[#5ab545]";
    return "bg-[#8f8f8f]";
  };

  return (
    <section>
      <header className="flex items-center justify-between h-[63px] w-full px-6">
        <Menu size={24} />
        <div className="flex items-center gap-1">
          <Clover size={22} strokeWidth={1.5} className="stroke-green-700" />
          <h1 className="text-lg font-locus">당황복권</h1>
        </div>
        <User2 size={24} />
      </header>
      <section className="pb-[26px]">
        <header className="flex items-center justify-center h-[51px] w-full bg-[#007bc3]">
          <h2 className="text-[17px] font-medium text-white">
            구매복권 당첨결과
          </h2>
        </header>
        <div>
          <div className="pt-[17px] px-[17px] pb-[17px] bg-[#F7FBFF] flex flex-col justify-center items-center w-full">
            <h3 className="flex flex-col items-center">
              <div>
                <span className="text-[17px] font-bold">로또 6/45 </span>
                <span className="text-[17px] font-bold text-[#007bc3]">
                  제{lotteryData.round}회
                </span>
              </div>
              <span className="text-[11px] font-normal text-[#888888]">
                {lotteryData.dateStr} 추첨
              </span>
            </h3>
            <div className="w-full mt-[17px] justify-center flex flex-col items-center">
              <span className="text-[13px] font-medium text-[#333333]">
                당첨번호
              </span>
              <div className="flex items-center pt-[11px]">
                {/* <!-- 번호별 컬러값: clr1: 1~10, clr2: 11~20, clr3: 21~30, clr4: 31~40, clr5: 41~45  --> */}
                {lotteryData.winning.map((num, idx) => (
                  <div
                    key={idx}
                    className={`text-[12px] font-bold text-white w-[30px] h-[30px] flex items-center justify-center ${getNumberColor(
                      num
                    )} ml-[5px] rounded-full`}
                  >
                    {num}
                  </div>
                ))}
                <span className="text-[16px] px-[8px] font-semibold">+</span>
                <div
                  className={`text-[12px] font-bold text-white w-[30px] h-[30px] flex items-center justify-center ${getNumberColor(
                    lotteryData.bonus
                  )}  rounded-full`}
                >
                  {lotteryData.bonus}
                </div>
              </div>
            </div>
            <div className="w-full mt-[22px] py-[18px] justify-center flex flex-col items-center shadow-sm bg-white">
              <span className="text-sm text-[#666666] pb-[7px]">
                축하합니다!
              </span>
              <div className="text-[15px] font-bold pb-[11px]">
                총{" "}
                <span className="text-[#007bc3]">
                  {lotteryData.totalPrizeStr}원
                </span>{" "}
                당첨!
              </div>
              <div className="text-sm font-medium text-[#007BC3] pb-[2px]">
                고객님이 구매하신 복권 구매 금액의 40%{" "}
                <span className="text-[#666666]">이상이</span>
              </div>
              <div className="text-sm font-medium text-[#007BC3] pb-[7px]">
                쉽고 행복한 기부
                <span className="text-[#666666]">로 사용됩니다.</span>
              </div>
            </div>
          </div>
          <div className="w-full p-[17px]">
            <p className="text-[11px] text-[#666666] ml-[10px] pb-[10px]">
              - 해당 QR 당첨 확인자는 반드시 회차별 실제 당첨 번호와 소유하신
              복권이 일치하는지 확인하셔야합니다.
            </p>
            <div className="w-full flex flex-col space-y-[-1px]">
              {lotteryData.lines.map((line, idx) => (
                <MyNumber
                  key={idx}
                  index={idx + 1}
                  numbers={line.numbers}
                  prize={line.prize}
                  winningNumbers={lotteryData.winning}
                  bonusNumber={lotteryData.bonus}
                />
              ))}
            </div>
          </div>
          <div className="w-full px-[33px] py-[17px] bg-[#f5f5f5] flex flex-row gap-[19px]">
            <div className="w-[53px] h-[53px] flex items-center justify-center bg-white ">
              <Clover
                size={36}
                strokeWidth={1.5}
                className="stroke-green-700"
              ></Clover>
            </div>
            <div className="flex text-[11px] text-[#444444] flex-col pt-[11px]">
              <span>당황복권 앱 다운받고</span>
              <span>복권정보와 다양한 알림서비스를 받아보세요</span>
            </div>
          </div>
        </div>
      </section>
      <footer className="w-full border-t border-gray-300 pt-4 pb-[23px] flex flex-col">
        <div className="flex flex-row">
          <div className="w-full">
            <div className="flex flex-row items-center gap-x-1 justify-center">
              <PhoneCall
                size={16}
                strokeWidth={1}
                className="stroke-[#007bc3]"
              />
              <span className="text-xs font-bold">9014-5656</span>
            </div>
            <div className="flex flex-col items-center gap-x-1 justify-center pt-3">
              <span className="text-[10px] text-[#252525]">
                월-금, 일요일 : 06:00 - 24:00
              </span>
              <span className="text-[10px] text-[#252525]">
                토요일 : 06:00 - 21:00
              </span>
            </div>
          </div>
          <div className="w-full">
            <div className="flex flex-row items-center gap-x-1 justify-center">
              <Notebook
                size={16}
                strokeWidth={1}
                className="stroke-[#007bc3]"
              />
              <span className="text-xs font-bold">1대1 상담</span>
            </div>
            <div className="flex flex-col items-center gap-x-1 justify-center pt-3">
              <span className="text-[10px] text-[#252525]">
                월-금, 일요일 : 06:00 - 24:00
              </span>
              <span className="text-[10px] text-[#252525]">
                토요일 : 06:00 - 21:00
              </span>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-row gap-x-1 justify-center pt-[15px]">
          <div className="text-[10px] text-[#252525] h-[27px] w-[104px] border border-gray-300 flex items-center justify-center">
            로그인
          </div>
          <div className="text-[10px] text-[#252525] h-[27px] w-[104px] border border-gray-300 flex items-center justify-center">
            고객센터
          </div>
        </div>
      </footer>
    </section>
  );
};

export default FakeLottery;
