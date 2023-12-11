import { expect } from "chai";
import { ethers } from "hardhat";
import { Provider, Wallet } from "zksync-web3";
import type { L2EthToken } from "../typechain-types";
import { deployContract, getWallets } from "./shared/utils";
import * as hre from "hardhat";
import { BigNumber } from "ethers";

describe("L2EthToken TEST", () => {
    let walletFrom: Wallet;
    let walletTo: Wallet;
    let l2EthToken: L2EthToken;

    before(async () => {
        walletFrom = getWallets()[0];
        walletTo = getWallets()[1];
        l2EthToken = (await deployContract("L2EthToken")) as L2EthToken;
    });

    it("should increase totalSupply and balance when minting tokens, also emit Mint", async () => {
        const initialSupply: BigNumber = await l2EthToken.totalSupply();
        const amountToMint = ethers.utils.parseEther("10.0");

        await expect(l2EthToken.mint(walletFrom.address, amountToMint))
            .to.emit(l2EthToken, "Mint").withArgs(walletFrom.address, amountToMint);

        const finalSupply: BigNumber = await l2EthToken.totalSupply();
        const balanceOfWallet: BigNumber = await l2EthToken.balanceOf(walletFrom.address);

        expect(finalSupply).to.equal(initialSupply.add(amountToMint));
        expect(balanceOfWallet).to.equal(amountToMint);
    });


    it("should tranfer successfully", async () => {
        await l2EthToken.mint(walletFrom.address, ethers.utils.parseEther("100.0"));

        const senderBalandeBeforeTransfer = await l2EthToken.balanceOf(walletFrom.address);
        const recipientBalanceBeforeTransfer = await l2EthToken.balanceOf(walletTo.address);

        const amountToTransfer: ethers.BigNumber = ethers.utils.parseEther("10.0");

        await expect(l2EthToken.transferFromTo(walletFrom.address, walletTo.address, amountToTransfer))
            .to.emit(l2EthToken, "Transfer").withArgs(walletFrom.address, walletTo.address, amountToTransfer);

        const senderBalanceAfterTransfer = l2EthToken.balanceOf(walletFrom.address);
        const recipientBalanceAfterTransfer = l2EthToken.balanceOf(walletTo.address);
        expect(senderBalanceAfterTransfer).to.be.eq(senderBalandeBeforeTransfer.sub(amountToTransfer));
        expect(recipientBalanceAfterTransfer).to.be.eq(recipientBalanceBeforeTransfer.add(amountToTransfer));
    });

    it("should not tranfser due to insufficient balance", async () => {
        await l2EthToken.mint(walletFrom.address, ethers.utils.parseEther("5.0"));

        const amountToTransfer: ethers.BigNumber = ethers.utils.parseEther("10.0");

        await expect(l2EthToken.transferFromTo(walletFrom.address, walletTo.address, amountToTransfer)).to.be.rejectedWith(
            "Transfer amount exceeds balance"
        );
    });

    it("should require special access for transfer", async () => {
        const provider = new Provider((hre.network.config as any).url);
        const maliciousData = {
            address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            privateKey: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        };
        const maliciousWallet: Wallet = new Wallet(maliciousData.privateKey, provider);
        await l2EthToken.mint(maliciousWallet.address, ethers.utils.parseEther("20.0"));

        const amountToTransfer: ethers.BigNumber = ethers.utils.parseEther("20.0");

        await expect(l2EthToken.connect(maliciousWallet).transferFromTo(maliciousWallet.address, walletTo.address, amountToTransfer)).to.be.rejectedWith(
            "Only system contracts with special access can call this method"
        );
    });

    it("should burn msg.value and emit Withdrawal event", async () => {
        const initialBalance = await l2EthToken.balanceOf(l2EthToken.address);
        const amountToWithdraw = ethers.utils.parseEther("1.0");
        await walletFrom.sendTransaction({
            to: l2EthToken.address,
            value: amountToWithdraw,
        });

        await expect(l2EthToken.withdraw(walletFrom.address))
            .to.emit(l2EthToken, "Withdrawal").withArgs(l2EthToken.address, walletFrom.address, amountToWithdraw);

        await expect(l2EthToken.balanceOf(l2EthToken.address)).to.be.eq(initialBalance.sub(amountToWithdraw));

    })
})