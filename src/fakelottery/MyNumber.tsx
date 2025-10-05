const MyNumber = ({
  index,
  numbers,
  prize,
  winningNumbers,
  bonusNumber,
}: {
  index: number;
  numbers: number[];
  prize: string;
  winningNumbers: number[];
  bonusNumber: number;
}) => {
  const result =
    index === 1
      ? "A"
      : index === 2
      ? "B"
      : index === 3
      ? "C"
      : index === 4
      ? "D"
      : index === 5
      ? "E"
      : null;

  const getNumberColor = (num: number) => {
    if (num >= 1 && num <= 10) return "bg-[#e4a716]";
    if (num >= 11 && num <= 20) return "bg-[#1993da]";
    if (num >= 21 && num <= 30) return "bg-[#e96353]";
    if (num >= 31 && num <= 40) return "bg-[#8f8f8f]";
    if (num >= 41 && num <= 45) return "bg-[#5ab545]";
    return "bg-[#8f8f8f]";
  };

  const isWinningNumber = (num: number) => {
    return winningNumbers.includes(num) || num === bonusNumber;
  };

  return (
    <div className="w-full h-fit flex items-center">
      <div className="w-[8%] h-[42.67px] items-center text-[#444444] px-[10px] py-[6px] text-[11px] bg-[#f7f7f7] border-gray-200 border-[1px] justify-center flex">
        {result}
      </div>
      <div className="w-[16%] h-[42.67px] text-[11px] text-[#666666] flex justify-center items-center border-l-0 border-gray-200 border-[1px]">
        {prize}
      </div>
      <div className=" h-[42.67px] flex-1 items-center justify-center flex border-l-0 border-gray-200 border-[1px]">
        {numbers.map((number, idx) => (
          <div
            key={idx}
            className={`text-[12px] w-[30px] h-[30px] flex items-center justify-center ml-[7px] rounded-full ${
              isWinningNumber(number)
                ? `text-white font-bold ${getNumberColor(number)}`
                : "text-black font-semibold bg-white"
            }`}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyNumber;
