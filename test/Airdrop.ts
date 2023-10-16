import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import holder from '../args/eth-holder'
import point from "../args/point";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAirdrop() {
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('MockToken');
    const token = await Token.deploy();

    const Airdrop = await ethers.getContractFactory("Airdrop");

    const airdrop = await Airdrop.deploy(token.target);

    return { airdrop, token, owner, otherAccounts };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { airdrop, otherAccounts, token, owner } = await loadFixture(deployAirdrop);

      const holdersSupply = holder.reduce((prev, cur) => prev + ethers.parseEther(cur.balance), 0n);

      const AIRDROP_AMOUNT = ethers.parseEther('30000');

      console.log(ethers.formatEther(holdersSupply))

      await (await airdrop.setHolderAirdrop(holder.map(item => ({ to: item.address, amount: ethers.parseEther(item.balance), airdropAmount: AIRDROP_AMOUNT * ethers.parseEther(item.balance) / holdersSupply })))).wait()

      console.log(await airdrop.airdrops('0xbea18a39a1cee253705eb5e966fe23f26dd109ef'))

      const totalPoints = point.filter(item => item.points >= 1000).reduce((prev, cur) => prev + cur.points, 0);

      console.log(totalPoints)

      const points = point.map(item => ({ to: item.address, amount: BigInt(item.points), airdropAmount: item.points < 1000 ? ethers.parseEther('16') : AIRDROP_AMOUNT * BigInt(item.points) / BigInt(totalPoints) }))

      await (await airdrop.setPointAirdrop(points.slice(0, 400))).wait()
      await (await airdrop.setPointAirdrop(points.slice(400))).wait()

      console.log(await airdrop.airdrops('0xbea18a39a1cee253705eb5e966fe23f26dd109ef'))

      const user = await ethers.getImpersonatedSigner('0xbea18a39a1cee253705eb5e966fe23f26dd109ef')

      await (await token.approve(airdrop.target, ethers.parseEther('10000000'))).wait()
      await (await airdrop.startAirdrop()).wait()

      await owner.sendTransaction({
        value: ethers.parseEther('1000'), to: user.address
      })
      await (await airdrop.connect(user).airdrop()).wait()

      console.log(await token.balanceOf(user.address))
      console.log(await airdrop.airdrops('0xbea18a39a1cee253705eb5e966fe23f26dd109ef'))
    });
  });
});
