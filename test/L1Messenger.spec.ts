import { ethers } from "hardhat";
import type { L1Messenger } from "../typechain-types";
import { prepareEnvironment } from "./shared/mocks";
import { deployContract } from "./shared/utils";

describe("L1Messenger tests", () => {
    let l1Messenger: L1Messenger;

    before(async () => {
        await prepareEnvironment();
        l1Messenger = (await deployContract("L1Messenger")) as L1Messenger;
    });

    describe("sendL2ToL1Log", async () => {
        it("should fail", async () => {
            const isService = true;
            const key = ethers.utils.formatBytes32String("key");
            const value = ethers.utils.formatBytes32String("value");
            await l1Messenger.sendL2ToL1Log(isService, key, value);
        });
    });

});
