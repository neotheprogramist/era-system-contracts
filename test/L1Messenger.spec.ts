import { ethers, network } from "hardhat";
import { L1Messenger__factory, type L1Messenger } from "../typechain-types";
import { prepareEnvironment } from "./shared/mocks";
import { deployContract, deployContractOnAddress, getWallets } from "./shared/utils";
import { Wallet } from "zksync-web3";
import { TEST_BOOTLOADER_FORMAL_ADDRESS, TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS, TEST_L1_MESSENGER_SYSTEM_CONTRACT_ADDRESS } from "./shared/constants";
import { expect } from "chai";
import { randomBytes } from "crypto";


describe("L1Messenger tests", () => {
    let l1Messenger: L1Messenger;
    let l1MessengerWrongAddress: L1Messenger;
    let wallet: Wallet;
    let deployerAccount: ethers.Signer;

    beforeEach(async () => {
        await prepareEnvironment();
        wallet = getWallets()[0];
        await deployContractOnAddress(TEST_L1_MESSENGER_SYSTEM_CONTRACT_ADDRESS, "L1Messenger");
        l1Messenger = L1Messenger__factory.connect(TEST_L1_MESSENGER_SYSTEM_CONTRACT_ADDRESS, wallet);
        l1MessengerWrongAddress = (await deployContract("L1Messenger")) as L1Messenger;
        deployerAccount = await ethers.getImpersonatedSigner(TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS);
    });

    after(async () => {
        await network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [TEST_DEPLOYER_SYSTEM_CONTRACT_ADDRESS],
        });
    });

    describe("sendL2ToL1Message", async () => {

        // to run make _processL2ToL1Log in l1Messenger.sol public 
        // it("should probably pass2", async () => {
        //     const l2ToL1Log = {
        //         l2ShardId: 0,
        //         isService: true,
        //         txNumberInBlock: ethers.BigNumber.from("1"),
        //         sender: deployerAccount.address,
        //         key: ethers.utils.hexlify(randomBytes(32)),
        //         value: ethers.utils.hexlify(randomBytes(32))
        //     };
        //     const tx = await l1Messenger._processL2ToL1Log(l2ToL1Log);
        //     const receipt = await tx.wait();
        //     await expect(tx).to.emit(l1Messenger, "L2ToL1LogSent");

        // });

        // TODO: ERROR (node) execution reverted: Error function_selector = 0x, data = 0x
        it("should emit L2ToL1LogSent event", async () => {
            const isService = true;
            const key = ethers.utils.hexlify(randomBytes(32));
            const value = ethers.utils.hexlify(randomBytes(32));
            const tx = await l1Messenger.connect(deployerAccount).sendL2ToL1Log(isService, key, value, { gasPrice: 5000000 });
            const receipt = await tx.wait();
            console.log(receipt.events);
            console.log(receipt.events?.length);
            await expect(tx).to.emit(l1Messenger, "L2ToL1LogSent");
        });

        // works fine 
        it("not called by system contract", async () => {
            const isService = true;
            const key = ethers.utils.hexlify(randomBytes(32));
            const value = ethers.utils.hexlify(randomBytes(32));
            await expect(l1MessengerWrongAddress.connect(getWallets()[2]).sendL2ToL1Log(isService, key, value))
                .to.be.rejectedWith("This method require the caller to be system contract");
        });

        // describe("sendL2ToL1Log", async () => {
        // it("not called by system contract", async () => {
        //     const isService = true;
        //     const key = ethers.utils.hexlify(randomBytes(32));
        //     const value = ethers.utils.hexlify(randomBytes(32));
        //     await expect(l1MessengerWrongAddress.connect(wallet2).sendL2ToL1Log(isService, key, value))
        //         .to.be.rejectedWith("This method require the caller to be system contract");

        // });

        // it("event emit", async () => {
        //     const isService = true;
        //     const key = ethers.utils.hexlify(randomBytes(32));
        //     const value = ethers.utils.hexlify(randomBytes(32));
        //     const gasPrice = await wallet.provider.getGasPrice();
        //     await expect(l1Messenger.connect(deployerAccount).sendL2ToL1Log(isService, key, value,))
        //         .to.emit(l1Messenger, "L2ToL1LogSent");
        // });
        // describe("sendToL1", async () => {
        //     it("emits L1MessageSent event", async () => {
        //         const message = ethers.utils.hexlify(randomBytes(32));
        //         await expect(l1Messenger.connect(deployerAccount).sendToL1(message))
        //             .to.emit(l1Messenger, "L1MessageSent");
        //     });
        // })


    });
});

