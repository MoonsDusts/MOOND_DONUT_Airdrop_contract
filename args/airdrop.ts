import { ethers } from "hardhat";
import holder from "./eth-holder";

const data = holder.map((item) => ({
  to: item.address,
  amount: ethers.parseEther(item.balance)
}));

export default [
  data, '0x4b2576BC44310D6dfb4cfCf2630f25190fc60803'
]