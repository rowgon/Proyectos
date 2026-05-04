import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch Binance USDT rate directly from Binance P2P API
    const binancePayload = {
      fiat: "VES",
      page: 1,
      rows: 1,
      tradeType: "SELL",
      asset: "USDT",
      merchantCheck: false,
      payTypes: []
    };
    
    const binanceRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(binancePayload)
    });
    
    const binanceJson = await binanceRes.json();
    const binance = parseFloat(binanceJson.data[0].adv.price);

    // 2. Fetch P2P Transfer Price (USDC AirTM -> USDT Binance)
    const p2pPayload = {
      fiat: "USD",
      page: 1,
      rows: 1,
      tradeType: "BUY",
      asset: "USDT",
      merchantCheck: false,
      payTypes: ["AirTM"]
    };
    const p2pRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p2pPayload)
    });
    const p2pJson = await p2pRes.json();
    const p2pTransferPrice = parseFloat(p2pJson.data[0].adv.price);

    // 3. Fetch Zinli Transfer Price
    const zinliRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p2pPayload, payTypes: ["Zinli"] })
    });
    const zinliJson = await zinliRes.json();
    const zinliPrice = parseFloat(zinliJson.data[0].adv.price);

    // 4. Fetch Wally Tech Transfer Price
    const wallyRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p2pPayload, payTypes: ["WallyTech"] })
    });
    const wallyJson = await wallyRes.json();
    const wallyPrice = parseFloat(wallyJson.data[0].adv.price);

    // 5. Fetch parallel rate (equivalent to AirTM standard average)
    const airtmRes = await fetch("https://ve.dolarapi.com/v1/dolares/paralelo", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const airtmJson = await airtmRes.json();
    const airtm = airtmJson.promedio;

    // 6. Compute theoretical conversion rate
    const conversionRate = airtm / binance;

    return NextResponse.json({
      status: "success",
      data: {
        airtm: airtm,
        binance: binance,
        conversionRate: conversionRate,
        p2pTransferPrice: p2pTransferPrice,
        zinliPrice: zinliPrice,
        wallyPrice: wallyPrice,
        zinliAirtmPrice: 1.060,
        wallyAirtmPrice: 1.100
      }
    });

  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
