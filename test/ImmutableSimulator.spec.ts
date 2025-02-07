import { expect } from "chai";
import { ethers, network } from "hardhat";
import type { ImmutableSimulator } from "../typechain-types";
import { ImmutableSimulator__factory } from "../typechain-types";
import {
  TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS,
  TEST_IMMUTABLE_SIMULATOR_SYSTEM_CONTRACT_ADDRESS,
} from "./shared/constants";
import { deployContractOnAddress, getWallets } from "./shared/utils";

describe("ImmutableSimulator tests", function () {
  let immutableSimulator: ImmutableSimulator;

  const RANDOM_ADDRESS = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
  const IMMUTABLES_DATA = [
    {
      index: 0,
      value: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    },
    {
      index: 23,
      value: "0x0000000000000000000000000000000000000000000000000000000000000111",
    },
  ];

  before(async () => {
    const wallet = getWallets()[0];
    await deployContractOnAddress(TEST_IMMUTABLE_SIMULATOR_SYSTEM_CONTRACT_ADDRESS, "ImmutableSimulator");
    immutableSimulator = ImmutableSimulator__factory.connect(TEST_IMMUTABLE_SIMULATOR_SYSTEM_CONTRACT_ADDRESS, wallet);
  });

  describe("setImmutables", function () {
    it("non-deployer failed to call", async () => {
      await expect(immutableSimulator.setImmutables(RANDOM_ADDRESS, IMMUTABLES_DATA)).to.be.revertedWith(
        "Callable only by the deployer system contract"
      );
    });

    it("successfully set", async () => {
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS],
      });

      const deployer_account = await ethers.getSigner(TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS);

      await immutableSimulator.connect(deployer_account).setImmutables(RANDOM_ADDRESS, IMMUTABLES_DATA);

      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS],
      });

      for (const immutable of IMMUTABLES_DATA) {
        expect(await immutableSimulator.getImmutable(RANDOM_ADDRESS, immutable.index)).to.be.eq(immutable.value);
      }
    });
  });

  describe("getImmutable", function () {
    it("zero", async () => {
      expect(await immutableSimulator.getImmutable(RANDOM_ADDRESS, 333)).to.be.eq(ethers.constants.HashZero);
    });
  });
});
