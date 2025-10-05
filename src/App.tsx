import { Route, Routes } from "react-router";
import FakeLottery from "./fakelottery/fakelotteryview";
import FakeLotterySetting from "./fakelottery/fakeletterysetting";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<FakeLotterySetting />} />
        <Route path="/FakeLottery" element={<FakeLottery />} />
      </Routes>
    </div>
  );
}

export default App;
