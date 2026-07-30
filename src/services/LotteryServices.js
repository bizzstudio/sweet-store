import requests from "./httpServices";

const LotteryServices = {
  getActiveLottery: async () => {
    return requests.get("/lottery/active");
  },
};

export default LotteryServices;
