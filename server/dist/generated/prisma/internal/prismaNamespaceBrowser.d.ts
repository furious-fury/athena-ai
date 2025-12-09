import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Agent: "Agent";
    readonly Position: "Position";
    readonly Trade: "Trade";
    readonly MarketCache: "MarketCache";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly userName: "userName";
    readonly walletAddress: "walletAddress";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly balance: "balance";
    readonly proxyWallet: "proxyWallet";
    readonly proxyWalletDelegated: "proxyWalletDelegated";
    readonly maxTradeAmount: "maxTradeAmount";
    readonly maxMarketExposure: "maxMarketExposure";
    readonly maxTotalExposure: "maxTotalExposure";
    readonly tradeCooldownSeconds: "tradeCooldownSeconds";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const AgentScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly name: "name";
    readonly description: "description";
    readonly systemPrompt: "systemPrompt";
    readonly llmProvider: "llmProvider";
    readonly llmModel: "llmModel";
    readonly riskProfile: "riskProfile";
    readonly pollingInterval: "pollingInterval";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AgentScalarFieldEnum = (typeof AgentScalarFieldEnum)[keyof typeof AgentScalarFieldEnum];
export declare const PositionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly agentId: "agentId";
    readonly marketId: "marketId";
    readonly exposure: "exposure";
    readonly quantity: "quantity";
    readonly avgPrice: "avgPrice";
    readonly pnl: "pnl";
    readonly updatedAt: "updatedAt";
};
export type PositionScalarFieldEnum = (typeof PositionScalarFieldEnum)[keyof typeof PositionScalarFieldEnum];
export declare const TradeScalarFieldEnum: {
    readonly id: "id";
    readonly agentId: "agentId";
    readonly userId: "userId";
    readonly txId: "txId";
    readonly marketId: "marketId";
    readonly outcome: "outcome";
    readonly amount: "amount";
    readonly price: "price";
    readonly side: "side";
    readonly txHash: "txHash";
    readonly status: "status";
    readonly pnl: "pnl";
    readonly createdAt: "createdAt";
};
export type TradeScalarFieldEnum = (typeof TradeScalarFieldEnum)[keyof typeof TradeScalarFieldEnum];
export declare const MarketCacheScalarFieldEnum: {
    readonly id: "id";
    readonly marketId: "marketId";
    readonly question: "question";
    readonly outcome1: "outcome1";
    readonly outcome2: "outcome2";
    readonly imageUrl: "imageUrl";
    readonly rawJson: "rawJson";
    readonly updatedAt: "updatedAt";
};
export type MarketCacheScalarFieldEnum = (typeof MarketCacheScalarFieldEnum)[keyof typeof MarketCacheScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: "JsonNull";
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: "DbNull";
    readonly JsonNull: "JsonNull";
    readonly AnyNull: "AnyNull";
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map