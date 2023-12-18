import { ethers } from "hardhat";
import { L1Messenger__factory, type L1Messenger } from "../typechain-types";
import { prepareEnvironment } from "./shared/mocks";
import { deployContract, deployContractOnAddress, getWallets } from "./shared/utils";
import { Wallet } from "zksync-web3";
import { TEST_L1_MESSENGER_SYSTEM_CONTRACT_ADDRESS } from "./shared/constants";
import { expect } from "chai";

describe("L1Messenger tests", () => {
    let l1Messenger: L1Messenger;
    let wallet: Wallet;

    before(async () => {
        await prepareEnvironment();
        wallet = getWallets()[0];
        l1Messenger = L1Messenger__factory.connect(TEST_L1_MESSENGER_SYSTEM_CONTRACT_ADDRESS, wallet);
    });

    describe("sendL2ToL1Log", async () => {
        it("should probably pass", async () => {
            const isService = true;
            const key = ethers.utils.formatBytes32String("key");
            const value = ethers.utils.formatBytes32String("value");

            await expect(l1Messenger.connect(wallet).sendL2ToL1Log(isService, key, value))
                .to.emit(l1Messenger, "L2ToL1LogSent");
        });
    });
});
