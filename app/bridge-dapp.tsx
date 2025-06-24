"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  sepolia,
  bscTestnet,
  solana,
  bsc,
  arbitrum,
  polygon,
  base,
  mainnet,
} from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { TOKENS, ENDPOINTS, ChainUrls } from "@/constants";
import abi from "@/lib/abi.json";
import { config } from "@/config/wagmi";
import {
  PublicKey,
  Keypair,
  Transaction,
  Connection,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { useAppKitProvider } from "@reown/appkit/react";
import { type Provider } from "@reown/appkit-adapter-solana/react";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { OftTools } from "@layerzerolabs/lz-solana-sdk-v2";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { networks } from "@/config";

const chains = networks;

export default function CrossChainBridge() {
  const [fromChain, setFromChain] = useState<any>(solana.id);
  const [toChain, setToChain] = useState<any>(mainnet.id);
  const [amount, setAmount] = useState<any>("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isBridging, setIsBridging] = useState(false);
  const { toast } = useToast();

  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const network = useAppKitNetwork();

  useEffect(() => {
    if (fromChain === toChain) {
      const availableChains = chains.filter((chain) => chain.id !== fromChain);
      if (availableChains.length > 0) {
        setToChain(availableChains[0].id);
      }
    }
  }, [fromChain, toChain]);

  const handleFromChainChange = (newFromChain: any) => {
    setFromChain(newFromChain);
    const _fromNetwork = chains.find((chain) => chain.id === newFromChain);
    network.switchNetwork(_fromNetwork!);

    // If the new from chain is the same as to chain, change to chain
    if (newFromChain === toChain) {
      const availableChains = chains.filter(
        (chain) => chain.id !== newFromChain
      );
      if (availableChains.length > 0) {
        setToChain(availableChains[0].id);
      }
    }
  };

  useEffect(() => {
    setFromChain(network.chainId);
  }, [network]);

  const peer = useMemo(() => {
    if (toChain == sepolia.id) {
      return {
        dstEid: 40161,
        peerAddress: addressToBytes32(
          "0x966D12C6cA09341cE49E9C04C103711fa63013B4"
        ),
      };
    } else if (toChain == bscTestnet.id) {
      return {
        dstEid: 40102,
        peerAddress: addressToBytes32(
          "0x2Fa3a87636869F99B5Af77CA0e6FD891C3c9C893"
        ),
      };
    } else if (toChain == bsc.id) {
      return {
        dstEid: 30102,
        peerAddress: addressToBytes32(
          "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675"
        ),
      };
    } else if (toChain == mainnet.id) {
      return {
        dstEid: 30101,
        peerAddress: addressToBytes32(
          "0xb6A3Ad997d597E30eaB9aEadE4fB5Ec8Be44919c"
        ),
      };
    } else if (toChain == arbitrum.id) {
      return {
        dstEid: 30110,
        peerAddress: addressToBytes32(
          "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675"
        ),
      };
    } else if (toChain == base.id) {
      return {
        dstEid: 30184,
        peerAddress: addressToBytes32(
          "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675"
        ),
      };
    } else if (toChain == polygon.id) {
      return {
        dstEid: 30109,
        peerAddress: addressToBytes32(
          "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675"
        ),
      };
    }
    return {
      dstEid: 30101,
      peerAddress: addressToBytes32(
        "0xb6A3Ad997d597E30eaB9aEadE4fB5Ec8Be44919c"
      ),
    };
  }, [toChain]);

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    handleFromChainChange(toChain);
  };

  const handleBridge = useCallback(async () => {
    setIsBridging(true);
    try {
      if (!amount || !destinationAddress) {
        toast({
          title: "Error",
          description: "Please enter amount and destination address",
          variant: "destructive",
        });
        return;
      }

      const destinationAddress32 = Array.from(
        addressToBytes32(destinationAddress)
      )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (fromChain != solana.id) {
        let sendParam = [];
        //@ts-ignore
        sendParam.push(ENDPOINTS[toChain]);
        sendParam.push("0x" + destinationAddress32);
        sendParam.push("" + BigInt(parseFloat(amount) * 10 ** 18));
        sendParam.push("" + BigInt(parseFloat(amount) * 10 ** 18));
        sendParam.push("0x");
        sendParam.push("0x");
        sendParam.push("0x");
        const quoteResult: any = await readContract(config as any, {
          abi,
          // @ts-ignore
          address: TOKENS[fromChain],
          functionName: "quoteSend",
          args: [sendParam, false],
          chainId: fromChain,
        });
        const hash = await writeContract(config as any, {
          //@ts-ignore
          address: TOKENS[fromChain],
          abi: abi,
          functionName: "send",
          args: [sendParam, ["" + quoteResult?.nativeFee, "0"], address],
          value: BigInt(quoteResult?.nativeFee ?? 0),
          chainId: fromChain,
        });
        const result = await waitForTransactionReceipt(config, { hash });

        setIsBridging(false);
        setAmount("");
        setDestinationAddress("");

        if (result.status === "success") {
          toast({
            title: "Bridge Complete",
            description: `Successfully bridged ${amount} TASS HUB!`,
          });
        } else {
          toast({
            title: "Error",
            description: "Tranaction is failed",
            variant: "destructive",
          });
        }
      } else {
        if (!walletProvider) return;
        const connectionT = new Connection(
          "https://mainnet.helius-rpc.com/?api-key=c471ca87-a59f-4c9e-a748-243ed59a55b0"
        );
        const payer = walletProvider.publicKey || new PublicKey("");
        const OFT_PROGRAM_ID = new PublicKey(
          "XS1q1Wgwfvu4RohwXHrCFJ3JsR2jYH9WZPp8e8nytbB"
        );
        const ENDPOINT_PROGRAM_ID = new PublicKey(
          "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"
        ); // fixed address for solana
        const LOCAL_DECIMALS = 6;

        const mintKp = new PublicKey(
          "FKNfAwb8TmjYkj11V4NiTz4TgrLWTWgm2NRwAD9epump"
        ); // token address
        const lockBox = Keypair.fromSecretKey(
          Uint8Array.from(
            bs58.decode(
              "39tcmKykqfR6qDNxeqYN3ozErefoQ2eHjebuPbHxQkb5Vj6BTcc8MU3PRNu4J42qURHWsKmWoxeQExAwtjtfQkwo"
            )
          )
        );
        const receiver = addressToBytes32(destinationAddress);

        const amountToSend = BigInt(parseFloat(amount) * 10 ** LOCAL_DECIMALS);

        const [associatedTokenAccount] = PublicKey.findProgramAddressSync(
          [payer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintKp.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const fee = await OftTools.quoteWithUln(
          connectionT,
          payer, // the payer's address
          mintKp, // your token mint account
          peer.dstEid, // the dstEid
          amountToSend, // the amount of tokens to send
          amountToSend, // the minimum amount of tokens to send (for slippage)
          Options.newOptions().addExecutorLzReceiveOption(200000, 0).toBytes(), // any extra execution options to add on top of enforced
          Array.from(receiver), // the receiver's address in bytes32
          false,
          lockBox.publicKey,
          undefined,
          Array.from(peer.peerAddress),
          undefined,
          TOKEN_PROGRAM_ID,
          OFT_PROGRAM_ID,
          undefined,
          ENDPOINT_PROGRAM_ID
        );
        console.log("debug->fee", fee);
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 1000000,
        });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1,
        });
        const sendTransaction = new Transaction()
          .add(modifyComputeUnits)
          .add(addPriorityFee)
          .add(
            await OftTools.sendWithUln(
              connectionT, // your connection
              payer, // payer address
              mintKp, // token mint address
              associatedTokenAccount,
              peer.dstEid, // destination endpoint id
              amountToSend, // amount of tokens to send
              amountToSend, // minimum amount of tokens to send (for slippage)
              Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toBytes(), // extra options to send
              Array.from(receiver), // receiver address
              fee.nativeFee, // native fee to pay (using quote)
              undefined,
              lockBox.publicKey,
              undefined,
              Array.from(peer.peerAddress),
              undefined,
              undefined,
              OFT_PROGRAM_ID,
              ENDPOINT_PROGRAM_ID
            )
          );
        sendTransaction.recentBlockhash = (
          await connectionT.getLatestBlockhash()
        ).blockhash;
        sendTransaction.feePayer = payer;
        const tx = await walletProvider.signTransaction(sendTransaction);
        const hash = await connectionT.sendRawTransaction(tx.serialize(), {
          maxRetries: 3,
          skipPreflight: true,
        });
        const result = await connectionT.confirmTransaction(hash);
        if (result.value.err) {
          toast({
            title: "Error",
            description: "Tranaction is failed",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Bridge Complete",
            description: `Successfully bridged ${amount} TASS HUB!`,
          });
        }
      }

      setIsBridging(false);
      setAmount("");
      setDestinationAddress("");
    } catch (err) {
      setIsBridging(false);
      toast({
        title: "Error",
        description: "Tranaction is failed",
        variant: "destructive",
      });
      console.error("failed to bridge:", err);
    } finally {
      setIsBridging(false);
    }
  }, [fromChain, amount, destinationAddress, isConnected, toast]);

  //fetch tokenbalance
  const [tokenBalance, setTokenBalance] = useState<any>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const fromChainChains = chains.filter(
          (chain) => chain.id === fromChain
        );
        if (fromChainChains.length == 0) return;
        if (fromChain !== solana.id) {
          // @ts-ignore
          readContract(config as any, {
            abi,
            // @ts-ignore
            address: TOKENS[fromChain],
            functionName: "balanceOf",
            args: [address],
            chainId: fromChainChains[0].id,
          }).then((bal) => {
            setTokenBalance(Number(bal) / 10 ** 18);
          });
        } else {
          const solanaConnection = new Connection(
            "https://mainnet.helius-rpc.com/?api-key=c471ca87-a59f-4c9e-a748-243ed59a55b0"
          );

          const mintAccount = new PublicKey(
            "FKNfAwb8TmjYkj11V4NiTz4TgrLWTWgm2NRwAD9epump" // TASSHUB token address
          );
          const accountPublickey = new PublicKey(address as any);
          const account = await solanaConnection.getTokenAccountsByOwner(
            accountPublickey,
            { mint: mintAccount }
          );
          if (account.value.length === 0) {
            setTokenBalance("0");
          } else {
            const balance = await solanaConnection.getTokenAccountBalance(
              new PublicKey(account.value[0].pubkey.toString())
            );
            setTokenBalance("" + (balance.value.uiAmount ?? ""));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (fromChain && address) {
      fetchBalance();
    }
    if (isConnected == false) return setTokenBalance("0");
  }, [fromChain, address, isBridging, isConnected]);

  return (
    <div /*className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"*/
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="mb-8 mt-12 text-center flex flex-row items-center">
          <img
            src="/image/hub-logo.png"
            alt="TASS HUB Logo"
            className="w-16 h-16 mx-auto mb-2"
          />
          <div className="pageTitle">
            <h1
              className="text-tass font-bold ml-4"
              style={{ color: "#FFA701" }}
            >
              TASS HUB
            </h1>
            <h1
              className="text-hub font-bold ml-4"
              style={{ color: "#FFFFFF" }}
            >
              Bridge
            </h1>
          </div>
        </div>
        {/* Wallet Connection Section */}
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap justify-center">
            <appkit-button />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mb-6 flex justify-center">
        <p className="text-muted-foreground">
          This is a TASS HUB token bridge that transfers tokens across chains.
        </p>
      </div>
      <div className="max-w-lg mx-auto">
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Bridge Form */}
          <div>
            <Card
              style={{
                background: "transparent",
                // "linear-gradient(to bottom right,rgb(24, 45, 102),rgb(80, 105, 189))",
                border: "1px solid #ffa7014d",
                borderRadius: "12px",
                boxShadow: "0 0 15px #ffa7014d",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: "white" }}>
                  Bridge TASS HUB Tokens
                </CardTitle>
                <CardDescription>
                  Send TASS HUBs through the LayerZero
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chain Selection (From and To on one line) */}
                <div className="space-y-2">
                  <Label style={{ color: "white" }}>Select Chains</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        value={fromChain}
                        onValueChange={handleFromChainChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem
                              key={chain.id}
                              value={chain.id as string}
                            >
                              <div className="flex items-center">
                                <div>
                                  <img
                                    src={
                                      ChainUrls[
                                        chain.id as keyof typeof ChainUrls
                                      ]
                                    }
                                    alt={chain.name}
                                    className="w-5 h-5 rounded-full"
                                  />
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full ${chain.name}`}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {chain.name}
                                  </span>
                                  {/* <span className="text-xs text-muted-foreground">{chain.name}</span> */}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwapChains}
                      className="rounded-full flex-shrink-0"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>

                    <div className="flex-1">
                      <Select value={toChain} onValueChange={setToChain}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chains
                            .filter((chain) => chain.id !== fromChain)
                            .map((chain) => (
                              <SelectItem
                                key={chain.id}
                                value={chain.id as string}
                              >
                                <div className="flex items-center">
                                  <div>
                                    <img
                                      src={
                                        ChainUrls[
                                          chain.id as keyof typeof ChainUrls
                                        ]
                                      }
                                      alt={chain.name}
                                      className="w-5 h-5 rounded-full"
                                    />
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full ${chain.name}`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {chain.name}
                                    </span>
                                    {/* <span className="text-xs text-muted-foreground">{chain.name}</span> */}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label style={{ color: "white" }}>Amount (TASS HUB)</Label>
                    <span className="text-sm text-muted-foreground">
                      Balance: {tokenBalance} TASS HUB
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAmount(tokenBalance)}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* Destination Address */}
                <div className="space-y-2">
                  <Label style={{ color: "white" }}>Destination Address</Label>
                  <Input
                    type="text"
                    placeholder="Enter destination wallet address"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Bridge Button */}
                <Button
                  onClick={handleBridge}
                  disabled={
                    !network || !amount || !destinationAddress || isBridging
                  }
                  className="w-full"
                  size="lg"
                  style={{
                    background:
                      !network || !amount || !destinationAddress || isBridging
                        ? "gray"
                        : "#FFA701",
                    color:
                      !network || !amount || !destinationAddress || isBridging
                        ? "#FFFFFF80"
                        : "#FFFFFF",
                  }}
                >
                  {!network
                    ? "Connect Wallet"
                    : isBridging
                    ? "Bridging..."
                    : "Bridge TASS HUB"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
