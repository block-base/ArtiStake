import * as React from "react";
import { useWallet } from "../../hooks/useWallet";
import { useTip, useJpyc, useUsdc } from "../../hooks/useContract";
import { Contract, ethers } from "ethers";
import { TipProps } from "./types";

const Tip: React.FC<TipProps> = ({ artistWalletAddress }) => {
  const [tipStatus, setTipStatus] = React.useState<"approve" | "tip" | "confirm">("approve");
  const [tipAmount, setTipAmount] = React.useState("");
  const [explorer, setExplorer] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [connectWallet, account, library] = useWallet();
  const tipContract = useTip();
  const jpycContract = useJpyc();
  const usdcContract = useUsdc();

  const approve = async () => {
    if (!tipAmount) {
      setErrorMessage("please input amount");
      return;
    }
    const value = ethers.utils.parseEther(tipAmount).toString();
    const contract = currency == "JPYC" ? jpycContract : usdcContract;
    await contract.approve(tipContract.address, value);
    setTipStatus("tip");
    setErrorMessage("");
  };

  const tip = async () => {
    setTipStatus("confirm");
    const value = ethers.utils.parseEther(tipAmount).toString();
    const currencyAddress = currency == "JPYC" ? jpycContract.address : usdcContract.address;
    const { hash: tx } = await tipContract.tip(currencyAddress, artistWalletAddress, value);
    setExplorer(`https://polygonscan.com/tx/${tx}`);
  };

  const handleTipAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    setTipAmount(event.target.value);
  };

  return (
    <div className="w-full mx-auto">
      {!currency ? (
        <div className="flex w-full text-center">
          <div className="w-1/2">
            <img
              className="mx-auto h-20 object-cover mt-10 mb-4"
              src={`/assets/img/JPYC.png`}
              onClick={() => setCurrency("JPYC")}
            />
            <button
              onClick={() => setCurrency("JPYC")}
              className="w-40 h-8 bg-marimo-5 hover:opacity-75 text-white rounded-lg"
            >
              JPYC
            </button>
          </div>
          <div className="w-1/2">
            <img
              className="mx-auto h-20 object-cover mt-10 mb-4"
              src={`/assets/img/USDC.png`}
              onClick={() => setCurrency("USDC")}
            />
            <button
              onClick={() => setCurrency("USDC")}
              className="w-40 h-8 bg-marimo-5 hover:opacity-75 text-white rounded-lg"
            >
              USDC
            </button>
          </div>
        </div>
      ) : (
        <>
          <img className="mx-auto h-20 object-cover mt-10 mb-4" src={`/assets/img/${currency}.png`} />
          {!account ? (
            <div className="text-center">
              <button
                // @ts-ignore:
                onClick={connectWallet}
                className="w-40 h-8 bg-marimo-5 hover:opacity-75 text-white rounded-lg"
              >
                Connect Wallet
              </button>
            </div>
          ) : tipStatus === "approve" ? (
            <div className="text-center">
              <input
                onChange={handleTipAmount}
                value={tipAmount}
                type="number"
                placeholder={currency}
                className="h-8 rounded-l-lg text-right border-2 border-marimo-5 pr-2"
              />
              <button
                onClick={approve}
                className="w-24 h-8 bg-marimo-5 hover:opacity-75 text-white font-bold rounded-r-lg"
              >
                Approve
              </button>
            </div>
          ) : tipStatus === "tip" ? (
            <div className="text-center">
              <p className="text-white text-base text-center">
                {tipAmount} {currency}
              </p>
              <button onClick={tip} className="w-24 h-8 bg-marimo-5 text-white font-bold rounded-lg">
                Tip
              </button>
            </div>
          ) : (
            <div className="">
              <p className="text-white text-base text-center">
                Thank you!{" "}
                <a href={explorer} className="underline">
                  Receipt
                </a>
              </p>
            </div>
          )}
          <div>
            <p className="text-red-500 text-base text-center">{errorMessage}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Tip;
