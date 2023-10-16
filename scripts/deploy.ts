import { ethers } from "hardhat";

import ethHolder from "../args/eth-holder";
import gnosisHolder from "../args/gnosis-holder";
import point from "../args/point";

async function main() {
  const airdrop = await ethers.deployContract("Airdrop", ['0x6693Cd1f198611Fe5592F2A94eB43fB26eDcEE8e']);

  await airdrop.waitForDeployment();

  console.log(
    `Airdrop: `, airdrop.target
  );

  let holder = ethHolder.map(item => ({ address: item.address, balance: ethers.parseEther(item.balance) }))
  gnosisHolder.forEach(item => {
    const id = holder.findIndex(hold => item.address.toLowerCase() === hold.address.toLowerCase())
    if (id > -1) {
      holder[id] = { ...holder[id], balance: holder[id].balance + ethers.parseEther(item.balance) }
    } else {
      holder.push({ address: item.address, balance: ethers.parseEther(item.balance) })
    }
  })

  const holdersSupply = holder.reduce((prev, cur) => prev + cur.balance, 0n);

  const AIRDROP_AMOUNT = ethers.parseEther('30000');

  await (await airdrop.setHolderAirdrop(holder.map(item => ({ to: item.address, amount: item.balance, airdropAmount: AIRDROP_AMOUNT * item.balance / holdersSupply })))).wait()


  const totalPoints = point.filter(item => item.points >= 1000).reduce((prev, cur) => prev + cur.points, 0);


  const points = point.map(item => ({ to: item.address, amount: BigInt(item.points), airdropAmount: item.points < 1000 ? ethers.parseEther('16') : AIRDROP_AMOUNT * BigInt(item.points) / BigInt(totalPoints) }))

  await (await airdrop.setPointAirdrop(points.slice(0, 400))).wait()
  await (await airdrop.setPointAirdrop(points.slice(400))).wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
