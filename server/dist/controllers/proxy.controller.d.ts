import type { Request, Response } from 'express';
export declare const createProxyWallet: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProxyWallet: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const exportProxyWallet: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const withdrawFunds: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const syncDeposits: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=proxy.controller.d.ts.map