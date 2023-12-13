import { expect } from "chai";
import { ethers } from "hardhat";
import { prepareEnvironment, setResult } from "./shared/mocks";
import { Wallet } from "zksync-web3";
import { L2EthToken, L2EthToken__factory } from "../typechain-types";
import { TEST_BOOTLOADER_FORMAL_ADDRESS, TEST_ETH_TOKEN_SYSTEM_CONTRACT_ADDRESS } from "./shared/constants";
import { deployContract, getWallets } from "./shared/utils";

describe("L2EthToken tests", function () {
    let wallet: Wallet;
    let bootloaderAccount: ethers.Signer;
    let l2EthToken: L2EthToken;

    before(async () => {
        wallet = (await getWallets())[0];
        // await prepareEnvironment();
        // l2EthToken = L2EthToken__factory.connect(TEST_ETH_TOKEN_SYSTEM_CONTRACT_ADDRESS, wallet);
        l2EthToken = (await deployContract("L2EthToken")) as L2EthToken;
        bootloaderAccount = await ethers.getImpersonatedSigner(TEST_BOOTLOADER_FORMAL_ADDRESS);
    })


    it("should test easywithdraw", async () => {
        const amountToWithdraw = ethers.utils.parseEther("10.0");
        const message = ethers.utils.defaultAbiCoder.encode(["address"], [ethers.constants.AddressZero]);
        await setResult('L1Messenger', 'sendToL1', [message], {
            failure: false,
            returnData: ethers.utils.defaultAbiCoder.encode(["bytes32"], [ethers.utils.keccak256(message)])
        });

        const gasPrice = await ethers.provider.getGasPrice();

        // const tx = await l2EthToken.connect(wallet).easyWithdraw({ value: amountToWithdraw, gasLimit: 5000000, gasPrice, });
        // console.log(tx);
        // const result = await tx.wait();
        // console.log(result);

        await expect(l2EthToken.connect(wallet).easyWithdraw({ value: amountToWithdraw, gasLimit: 5000000, gasPrice, }))
            .to.emit(l2EthToken, "Withdrawal")
            .withArgs(wallet.address, ethers.constants.AddressZero, amountToWithdraw);



    })



})