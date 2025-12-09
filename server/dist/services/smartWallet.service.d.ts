import "dotenv/config";
import { type Hex, type Address } from "viem";
export declare class SmartWalletService {
    /**
     * Generates a new Pimlico Safe Account (ERC-4337).
     * Returns the address and the private key of the owner.
     */
    static createOneClickAccount(): Promise<{
        address: `0x${string}`;
        privateKey: `0x${string}`;
    }>;
    /**
     * Sends a gasless transaction using the Pimlico Paymaster.
     */
    static sendTransaction(ownerPrivateKey: string, to: Address, value: bigint, data?: Hex): Promise<`0x${string}`>;
    /**
     * Reconstructs the Smart Account Client for an owner key.
     * Used for signing messages (e.g. Polymarket Clob).
     */
    static getSmartAccountClient(ownerPrivateKey: string): Promise<import("permissionless").SmartAccountClient<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.polygonscan.com/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon-rpc.com"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    }, (object & {
        client: import("viem").Client<import("viem").Transport, import("viem").Chain | undefined, {
            address: Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign?: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<Hex>) | undefined | undefined;
            signAuthorization?: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<Hex>;
            signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<Hex>;
            publicKey: Hex;
            source: string;
            type: "local";
        } | import("viem").JsonRpcAccount | undefined>;
        entryPoint: {
            abi: readonly [{
                readonly inputs: readonly [{
                    readonly name: "preOpGas";
                    readonly type: "uint256";
                }, {
                    readonly name: "paid";
                    readonly type: "uint256";
                }, {
                    readonly name: "validAfter";
                    readonly type: "uint48";
                }, {
                    readonly name: "validUntil";
                    readonly type: "uint48";
                }, {
                    readonly name: "targetSuccess";
                    readonly type: "bool";
                }, {
                    readonly name: "targetResult";
                    readonly type: "bytes";
                }];
                readonly name: "ExecutionResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "opIndex";
                    readonly type: "uint256";
                }, {
                    readonly name: "reason";
                    readonly type: "string";
                }];
                readonly name: "FailedOp";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "SenderAddressResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "aggregator";
                    readonly type: "address";
                }];
                readonly name: "SignatureValidationFailed";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "sigFailed";
                        readonly type: "bool";
                    }, {
                        readonly name: "validAfter";
                        readonly type: "uint48";
                    }, {
                        readonly name: "validUntil";
                        readonly type: "uint48";
                    }, {
                        readonly name: "paymasterContext";
                        readonly type: "bytes";
                    }];
                    readonly name: "returnInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "senderInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "factoryInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "paymasterInfo";
                    readonly type: "tuple";
                }];
                readonly name: "ValidationResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "sigFailed";
                        readonly type: "bool";
                    }, {
                        readonly name: "validAfter";
                        readonly type: "uint48";
                    }, {
                        readonly name: "validUntil";
                        readonly type: "uint48";
                    }, {
                        readonly name: "paymasterContext";
                        readonly type: "bytes";
                    }];
                    readonly name: "returnInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "senderInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "factoryInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "paymasterInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "aggregator";
                        readonly type: "address";
                    }, {
                        readonly components: readonly [{
                            readonly name: "stake";
                            readonly type: "uint256";
                        }, {
                            readonly name: "unstakeDelaySec";
                            readonly type: "uint256";
                        }];
                        readonly name: "stakeInfo";
                        readonly type: "tuple";
                    }];
                    readonly name: "aggregatorInfo";
                    readonly type: "tuple";
                }];
                readonly name: "ValidationResultWithAggregation";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "factory";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "paymaster";
                    readonly type: "address";
                }];
                readonly name: "AccountDeployed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [];
                readonly name: "BeforeExecution";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "totalDeposit";
                    readonly type: "uint256";
                }];
                readonly name: "Deposited";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "aggregator";
                    readonly type: "address";
                }];
                readonly name: "SignatureAggregatorChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "totalStaked";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint256";
                }];
                readonly name: "StakeLocked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawTime";
                    readonly type: "uint256";
                }];
                readonly name: "StakeUnlocked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "StakeWithdrawn";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly name: "paymaster";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "success";
                    readonly type: "bool";
                }, {
                    readonly indexed: false;
                    readonly name: "actualGasCost";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "actualGasUsed";
                    readonly type: "uint256";
                }];
                readonly name: "UserOperationEvent";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "revertReason";
                    readonly type: "bytes";
                }];
                readonly name: "UserOperationRevertReason";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Withdrawn";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "SIG_VALIDATION_FAILED";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "initCode";
                    readonly type: "bytes";
                }, {
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly name: "paymasterAndData";
                    readonly type: "bytes";
                }];
                readonly name: "_validateSenderAndPaymaster";
                readonly outputs: readonly [];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint32";
                }];
                readonly name: "addStake";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "balanceOf";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "depositTo";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly name: "deposits";
                readonly outputs: readonly [{
                    readonly name: "deposit";
                    readonly type: "uint112";
                }, {
                    readonly name: "staked";
                    readonly type: "bool";
                }, {
                    readonly name: "stake";
                    readonly type: "uint112";
                }, {
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint32";
                }, {
                    readonly name: "withdrawTime";
                    readonly type: "uint48";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "getDepositInfo";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "deposit";
                        readonly type: "uint112";
                    }, {
                        readonly name: "staked";
                        readonly type: "bool";
                    }, {
                        readonly name: "stake";
                        readonly type: "uint112";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint32";
                    }, {
                        readonly name: "withdrawTime";
                        readonly type: "uint48";
                    }];
                    readonly name: "info";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly name: "key";
                    readonly type: "uint192";
                }];
                readonly name: "getNonce";
                readonly outputs: readonly [{
                    readonly name: "nonce";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "initCode";
                    readonly type: "bytes";
                }];
                readonly name: "getSenderAddress";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "userOp";
                    readonly type: "tuple";
                }];
                readonly name: "getUserOpHash";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly components: readonly [{
                            readonly name: "sender";
                            readonly type: "address";
                        }, {
                            readonly name: "nonce";
                            readonly type: "uint256";
                        }, {
                            readonly name: "initCode";
                            readonly type: "bytes";
                        }, {
                            readonly name: "callData";
                            readonly type: "bytes";
                        }, {
                            readonly name: "callGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "verificationGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "preVerificationGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxPriorityFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "paymasterAndData";
                            readonly type: "bytes";
                        }, {
                            readonly name: "signature";
                            readonly type: "bytes";
                        }];
                        readonly name: "userOps";
                        readonly type: "tuple[]";
                    }, {
                        readonly name: "aggregator";
                        readonly type: "address";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "opsPerAggregator";
                    readonly type: "tuple[]";
                }, {
                    readonly name: "beneficiary";
                    readonly type: "address";
                }];
                readonly name: "handleAggregatedOps";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "ops";
                    readonly type: "tuple[]";
                }, {
                    readonly name: "beneficiary";
                    readonly type: "address";
                }];
                readonly name: "handleOps";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "key";
                    readonly type: "uint192";
                }];
                readonly name: "incrementNonce";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "callData";
                    readonly type: "bytes";
                }, {
                    readonly components: readonly [{
                        readonly components: readonly [{
                            readonly name: "sender";
                            readonly type: "address";
                        }, {
                            readonly name: "nonce";
                            readonly type: "uint256";
                        }, {
                            readonly name: "callGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "verificationGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "preVerificationGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "paymaster";
                            readonly type: "address";
                        }, {
                            readonly name: "maxFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxPriorityFeePerGas";
                            readonly type: "uint256";
                        }];
                        readonly name: "mUserOp";
                        readonly type: "tuple";
                    }, {
                        readonly name: "userOpHash";
                        readonly type: "bytes32";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "contextOffset";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }];
                    readonly name: "opInfo";
                    readonly type: "tuple";
                }, {
                    readonly name: "context";
                    readonly type: "bytes";
                }];
                readonly name: "innerHandleOp";
                readonly outputs: readonly [{
                    readonly name: "actualGasCost";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "";
                    readonly type: "address";
                }, {
                    readonly name: "";
                    readonly type: "uint192";
                }];
                readonly name: "nonceSequenceNumber";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "op";
                    readonly type: "tuple";
                }, {
                    readonly name: "target";
                    readonly type: "address";
                }, {
                    readonly name: "targetCallData";
                    readonly type: "bytes";
                }];
                readonly name: "simulateHandleOp";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "userOp";
                    readonly type: "tuple";
                }];
                readonly name: "simulateValidation";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "unlockStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }];
                readonly name: "withdrawStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly name: "withdrawAmount";
                    readonly type: "uint256";
                }];
                readonly name: "withdrawTo";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly stateMutability: "payable";
                readonly type: "receive";
            }];
            address: Address;
            version: "0.6";
        };
        extend?: object | undefined;
        getAddress: () => Promise<Address>;
        decodeCalls?: ((data: Hex) => Promise<readonly {
            to: Hex;
            data?: Hex | undefined;
            value?: bigint | undefined;
        }[]>) | undefined | undefined;
        encodeCalls: (calls: readonly {
            to: Hex;
            data?: Hex | undefined;
            value?: bigint | undefined;
        }[]) => Promise<Hex>;
        getFactoryArgs: () => Promise<{
            factory?: Address | undefined;
            factoryData?: Hex | undefined;
        }>;
        getNonce?: (parameters?: {
            key?: bigint | undefined;
        } | undefined) => Promise<bigint>;
        getStubSignature: (parameters?: import("viem/account-abstraction").UserOperationRequest | undefined) => Promise<Hex>;
        nonceKeyManager?: import("viem").NonceManager | undefined;
        sign: (parameters: {
            hash: import("viem").Hash;
        }) => Promise<Hex>;
        signMessage: (parameters: {
            message: import("viem").SignableMessage;
        }) => Promise<Hex>;
        signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<Hex>;
        signUserOperation: (parameters: import("viem").UnionPartialBy<import("viem/account-abstraction").UserOperation, "sender"> & {
            chainId?: number | undefined;
        }) => Promise<Hex>;
        userOperation?: {
            estimateGas?: ((userOperation: import("viem/account-abstraction").UserOperationRequest) => Promise<import("viem").ExactPartial<import("node_modules/viem/_types/account-abstraction/types/userOperation.js").EstimateUserOperationGasReturnType> | undefined>) | undefined;
        } | undefined | undefined;
        authorization?: undefined | undefined;
    } & {
        address: Address;
        getNonce: NonNullable<import("viem/account-abstraction").SmartAccountImplementation["getNonce"]>;
        isDeployed: () => Promise<boolean>;
        type: "smart";
    }) | (object & {
        client: import("viem").Client<import("viem").Transport, import("viem").Chain | undefined, {
            address: Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign?: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<Hex>) | undefined | undefined;
            signAuthorization?: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<Hex>;
            signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<Hex>;
            publicKey: Hex;
            source: string;
            type: "local";
        } | import("viem").JsonRpcAccount | undefined>;
        entryPoint: {
            abi: readonly [{
                readonly inputs: readonly [{
                    readonly name: "preOpGas";
                    readonly type: "uint256";
                }, {
                    readonly name: "paid";
                    readonly type: "uint256";
                }, {
                    readonly name: "validAfter";
                    readonly type: "uint48";
                }, {
                    readonly name: "validUntil";
                    readonly type: "uint48";
                }, {
                    readonly name: "targetSuccess";
                    readonly type: "bool";
                }, {
                    readonly name: "targetResult";
                    readonly type: "bytes";
                }];
                readonly name: "ExecutionResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "opIndex";
                    readonly type: "uint256";
                }, {
                    readonly name: "reason";
                    readonly type: "string";
                }];
                readonly name: "FailedOp";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "sender";
                    readonly type: "address";
                }];
                readonly name: "SenderAddressResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly name: "aggregator";
                    readonly type: "address";
                }];
                readonly name: "SignatureValidationFailed";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "sigFailed";
                        readonly type: "bool";
                    }, {
                        readonly name: "validAfter";
                        readonly type: "uint48";
                    }, {
                        readonly name: "validUntil";
                        readonly type: "uint48";
                    }, {
                        readonly name: "paymasterContext";
                        readonly type: "bytes";
                    }];
                    readonly name: "returnInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "senderInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "factoryInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "paymasterInfo";
                    readonly type: "tuple";
                }];
                readonly name: "ValidationResult";
                readonly type: "error";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "sigFailed";
                        readonly type: "bool";
                    }, {
                        readonly name: "validAfter";
                        readonly type: "uint48";
                    }, {
                        readonly name: "validUntil";
                        readonly type: "uint48";
                    }, {
                        readonly name: "paymasterContext";
                        readonly type: "bytes";
                    }];
                    readonly name: "returnInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "senderInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "factoryInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "stake";
                        readonly type: "uint256";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint256";
                    }];
                    readonly name: "paymasterInfo";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly name: "aggregator";
                        readonly type: "address";
                    }, {
                        readonly components: readonly [{
                            readonly name: "stake";
                            readonly type: "uint256";
                        }, {
                            readonly name: "unstakeDelaySec";
                            readonly type: "uint256";
                        }];
                        readonly name: "stakeInfo";
                        readonly type: "tuple";
                    }];
                    readonly name: "aggregatorInfo";
                    readonly type: "tuple";
                }];
                readonly name: "ValidationResultWithAggregation";
                readonly type: "error";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "factory";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "paymaster";
                    readonly type: "address";
                }];
                readonly name: "AccountDeployed";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [];
                readonly name: "BeforeExecution";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "totalDeposit";
                    readonly type: "uint256";
                }];
                readonly name: "Deposited";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "aggregator";
                    readonly type: "address";
                }];
                readonly name: "SignatureAggregatorChanged";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "totalStaked";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint256";
                }];
                readonly name: "StakeLocked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawTime";
                    readonly type: "uint256";
                }];
                readonly name: "StakeUnlocked";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "StakeWithdrawn";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: true;
                    readonly name: "paymaster";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "success";
                    readonly type: "bool";
                }, {
                    readonly indexed: false;
                    readonly name: "actualGasCost";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "actualGasUsed";
                    readonly type: "uint256";
                }];
                readonly name: "UserOperationEvent";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "userOpHash";
                    readonly type: "bytes32";
                }, {
                    readonly indexed: true;
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "nonce";
                    readonly type: "uint256";
                }, {
                    readonly indexed: false;
                    readonly name: "revertReason";
                    readonly type: "bytes";
                }];
                readonly name: "UserOperationRevertReason";
                readonly type: "event";
            }, {
                readonly anonymous: false;
                readonly inputs: readonly [{
                    readonly indexed: true;
                    readonly name: "account";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly indexed: false;
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly name: "Withdrawn";
                readonly type: "event";
            }, {
                readonly inputs: readonly [];
                readonly name: "SIG_VALIDATION_FAILED";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "initCode";
                    readonly type: "bytes";
                }, {
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly name: "paymasterAndData";
                    readonly type: "bytes";
                }];
                readonly name: "_validateSenderAndPaymaster";
                readonly outputs: readonly [];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint32";
                }];
                readonly name: "addStake";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "balanceOf";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "depositTo";
                readonly outputs: readonly [];
                readonly stateMutability: "payable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "";
                    readonly type: "address";
                }];
                readonly name: "deposits";
                readonly outputs: readonly [{
                    readonly name: "deposit";
                    readonly type: "uint112";
                }, {
                    readonly name: "staked";
                    readonly type: "bool";
                }, {
                    readonly name: "stake";
                    readonly type: "uint112";
                }, {
                    readonly name: "unstakeDelaySec";
                    readonly type: "uint32";
                }, {
                    readonly name: "withdrawTime";
                    readonly type: "uint48";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "account";
                    readonly type: "address";
                }];
                readonly name: "getDepositInfo";
                readonly outputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "deposit";
                        readonly type: "uint112";
                    }, {
                        readonly name: "staked";
                        readonly type: "bool";
                    }, {
                        readonly name: "stake";
                        readonly type: "uint112";
                    }, {
                        readonly name: "unstakeDelaySec";
                        readonly type: "uint32";
                    }, {
                        readonly name: "withdrawTime";
                        readonly type: "uint48";
                    }];
                    readonly name: "info";
                    readonly type: "tuple";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "sender";
                    readonly type: "address";
                }, {
                    readonly name: "key";
                    readonly type: "uint192";
                }];
                readonly name: "getNonce";
                readonly outputs: readonly [{
                    readonly name: "nonce";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "initCode";
                    readonly type: "bytes";
                }];
                readonly name: "getSenderAddress";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "userOp";
                    readonly type: "tuple";
                }];
                readonly name: "getUserOpHash";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "bytes32";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly components: readonly [{
                            readonly name: "sender";
                            readonly type: "address";
                        }, {
                            readonly name: "nonce";
                            readonly type: "uint256";
                        }, {
                            readonly name: "initCode";
                            readonly type: "bytes";
                        }, {
                            readonly name: "callData";
                            readonly type: "bytes";
                        }, {
                            readonly name: "callGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "verificationGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "preVerificationGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxPriorityFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "paymasterAndData";
                            readonly type: "bytes";
                        }, {
                            readonly name: "signature";
                            readonly type: "bytes";
                        }];
                        readonly name: "userOps";
                        readonly type: "tuple[]";
                    }, {
                        readonly name: "aggregator";
                        readonly type: "address";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "opsPerAggregator";
                    readonly type: "tuple[]";
                }, {
                    readonly name: "beneficiary";
                    readonly type: "address";
                }];
                readonly name: "handleAggregatedOps";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "ops";
                    readonly type: "tuple[]";
                }, {
                    readonly name: "beneficiary";
                    readonly type: "address";
                }];
                readonly name: "handleOps";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "key";
                    readonly type: "uint192";
                }];
                readonly name: "incrementNonce";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "callData";
                    readonly type: "bytes";
                }, {
                    readonly components: readonly [{
                        readonly components: readonly [{
                            readonly name: "sender";
                            readonly type: "address";
                        }, {
                            readonly name: "nonce";
                            readonly type: "uint256";
                        }, {
                            readonly name: "callGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "verificationGasLimit";
                            readonly type: "uint256";
                        }, {
                            readonly name: "preVerificationGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "paymaster";
                            readonly type: "address";
                        }, {
                            readonly name: "maxFeePerGas";
                            readonly type: "uint256";
                        }, {
                            readonly name: "maxPriorityFeePerGas";
                            readonly type: "uint256";
                        }];
                        readonly name: "mUserOp";
                        readonly type: "tuple";
                    }, {
                        readonly name: "userOpHash";
                        readonly type: "bytes32";
                    }, {
                        readonly name: "prefund";
                        readonly type: "uint256";
                    }, {
                        readonly name: "contextOffset";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preOpGas";
                        readonly type: "uint256";
                    }];
                    readonly name: "opInfo";
                    readonly type: "tuple";
                }, {
                    readonly name: "context";
                    readonly type: "bytes";
                }];
                readonly name: "innerHandleOp";
                readonly outputs: readonly [{
                    readonly name: "actualGasCost";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "";
                    readonly type: "address";
                }, {
                    readonly name: "";
                    readonly type: "uint192";
                }];
                readonly name: "nonceSequenceNumber";
                readonly outputs: readonly [{
                    readonly name: "";
                    readonly type: "uint256";
                }];
                readonly stateMutability: "view";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "op";
                    readonly type: "tuple";
                }, {
                    readonly name: "target";
                    readonly type: "address";
                }, {
                    readonly name: "targetCallData";
                    readonly type: "bytes";
                }];
                readonly name: "simulateHandleOp";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly components: readonly [{
                        readonly name: "sender";
                        readonly type: "address";
                    }, {
                        readonly name: "nonce";
                        readonly type: "uint256";
                    }, {
                        readonly name: "initCode";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "callGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "verificationGasLimit";
                        readonly type: "uint256";
                    }, {
                        readonly name: "preVerificationGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "maxPriorityFeePerGas";
                        readonly type: "uint256";
                    }, {
                        readonly name: "paymasterAndData";
                        readonly type: "bytes";
                    }, {
                        readonly name: "signature";
                        readonly type: "bytes";
                    }];
                    readonly name: "userOp";
                    readonly type: "tuple";
                }];
                readonly name: "simulateValidation";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [];
                readonly name: "unlockStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }];
                readonly name: "withdrawStake";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly inputs: readonly [{
                    readonly name: "withdrawAddress";
                    readonly type: "address";
                }, {
                    readonly name: "withdrawAmount";
                    readonly type: "uint256";
                }];
                readonly name: "withdrawTo";
                readonly outputs: readonly [];
                readonly stateMutability: "nonpayable";
                readonly type: "function";
            }, {
                readonly stateMutability: "payable";
                readonly type: "receive";
            }];
            address: Address;
            version: "0.6";
        };
        extend?: object | undefined;
        getAddress: () => Promise<Address>;
        decodeCalls?: ((data: Hex) => Promise<readonly {
            to: Hex;
            data?: Hex | undefined;
            value?: bigint | undefined;
        }[]>) | undefined | undefined;
        encodeCalls: (calls: readonly {
            to: Hex;
            data?: Hex | undefined;
            value?: bigint | undefined;
        }[]) => Promise<Hex>;
        getFactoryArgs: () => Promise<{
            factory?: Address | undefined;
            factoryData?: Hex | undefined;
        }>;
        getNonce?: (parameters?: {
            key?: bigint | undefined;
        } | undefined) => Promise<bigint>;
        getStubSignature: (parameters?: import("viem/account-abstraction").UserOperationRequest | undefined) => Promise<Hex>;
        nonceKeyManager?: import("viem").NonceManager | undefined;
        sign: (parameters: {
            hash: import("viem").Hash;
        }) => Promise<Hex>;
        signMessage: (parameters: {
            message: import("viem").SignableMessage;
        }) => Promise<Hex>;
        signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<Hex>;
        signUserOperation: (parameters: import("viem").UnionPartialBy<import("viem/account-abstraction").UserOperation, "sender"> & {
            chainId?: number | undefined;
        }) => Promise<Hex>;
        userOperation?: {
            estimateGas?: ((userOperation: import("viem/account-abstraction").UserOperationRequest) => Promise<import("viem").ExactPartial<import("node_modules/viem/_types/account-abstraction/types/userOperation.js").EstimateUserOperationGasReturnType> | undefined>) | undefined;
        } | undefined | undefined;
        authorization: {
            account: import("viem").PrivateKeyAccount;
            address: Address;
        };
    } & {
        address: Address;
        getNonce: NonNullable<import("viem/account-abstraction").SmartAccountImplementation["getNonce"]>;
        isDeployed: () => Promise<boolean>;
        type: "smart";
    }), undefined, undefined>>;
    /**
     * Fetches recent USDC transfers TO a specific address.
     * Uses viem public client to get logs.
     */
    static getUSDCTransfers(toAddress: Address, fromBlock?: bigint): Promise<{
        txHash: any;
        blockNumber: any;
        amount: any;
        from: any;
    }[]>;
}
//# sourceMappingURL=smartWallet.service.d.ts.map