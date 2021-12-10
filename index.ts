import { toBn, tradeToTick, sellFYToken, tsToRate, tsToRate2, tickNumberToRatio, valueAtTick } from './yieldMath';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { MAX_256, WAD_BN, ZERO_BN } from './constants';
import { Decimal } from 'decimal.js';

var time = "7776000";
//var time = "7776000";

// Before adding liquidity at tick
var preBase = BigNumber.from("1000000000000000000000");
var preFyTokens = BigNumber.from("1100000000000000000000");

// Liquidity to Add at Tick
var addedBase = BigNumber.from("100000000000000000000");
var addedFyTokens = BigNumber.from("110000000000000000000");

//totals
var totalBase = preBase.add(addedBase);
var totalFyTokens = preFyTokens.add(addedFyTokens);

console.log("totalBase:", totalBase.toString())
console.log("totalFyTokens", totalFyTokens.toString())


// var rt = result.mul(WAD_BN).div(BigNumber.from(fyT)).toString();
// var r2 = result.mul(WAD_BN).div(BigNumber.from(fyT));
// const e = new Decimal(r2.toString());

// Trade 1 
// Trade size
var fyT = BigNumber.from("50000000000000000000");

// make trade
var result = sellFYToken(totalBase, totalFyTokens, fyT, time, 18, false);

//update Totals
var totalBase_2 = totalBase.sub(result);
var totalFyTokens_2 = totalFyTokens.add(fyT);

console.log("\n*** Trade 1 ***",);
console.log("sold", fyT.toString(), "fyTokens for ", result.toString(), "base tokens ");
console.log("base reserves after:", totalBase_2.toString());
console.log("fyToken reserves after:", totalFyTokens_2.toString());

// Trade 1 
// Trade size
var fyT = BigNumber.from("50000000000000000000");

// make trade
var result2 = sellFYToken(totalBase_2, totalFyTokens_2, fyT, time, 18, false);

//update Totals
var totalBase_3 = totalBase_2.sub(result2);
var totalFyTokens_3 = totalFyTokens_2.add(fyT);

console.log("\n*** Trade 2 ***",);
console.log("sold", fyT.toString(), "fyTokens for ", result2.toString(), "base tokens ");
console.log("base reserves after:", totalBase_3.toString());
console.log("fyToken reserves after:", totalFyTokens_3.toString());


const baseAtTick_ = new Decimal(totalBase.toString());
const fyTokenAtTick_ = new Decimal(totalFyTokens.toString());
const wad_ = new Decimal(WAD_BN.toString());
const tick_ = fyTokenAtTick_.mul(wad_).div(baseAtTick_);
const tick = toBn(tick_);

console.log("\n*** Trade down to Tick ***",);
console.log("tick", tick_.toString());
console.log("tick", tick.toString());

const [b1, f1] = tradeToTick(
  totalBase_3,
  totalFyTokens_3,
  tick,
  time,
  18,
  false
);

console.log(
  "fyToken traded", f1.toString(),
  "base traded", b1.toString()
);

//update Totals
var totalBase_4 = totalBase_3.add(b1);
var totalFyTokens_4 = totalFyTokens_3.add(f1);
console.log("base reserves after:", totalBase_4.toString());
console.log("fyToken reserves after:", totalFyTokens_4.toString());



// Trade up to Tick
console.log("\n*** Trade up to Tick ***",);

const tick_2 = (new Decimal(1.5)).mul(wad_);
const tick2 = toBn(tick_2);

console.log("tick_", tick_2.toString());
console.log("tick", tick2.toString());

const [b2, f2] = tradeToTick(
  totalBase_3,
  totalFyTokens_3,
  tick2,
  time,
  18,
  false
);

console.log(
  "fyToken traded", f2.toString(),
  "base traded", b2.toString()
);

console.log("b2", b2.toString());
console.log("f2", f2.toString());

//update Totals
var totalBase_5 = totalBase_3.add(b2);
var totalFyTokens_5 = totalFyTokens_3.add(f2);
console.log("base reserves after:", totalBase_5.toString());
console.log("fyToken reserves after:", totalFyTokens_5.toString());


console.log("\n*** Time Stretch ***",);
export const SECONDS_PER_YEAR: number = 365 * 24 * 60 * 60;
export const secondsInOneYear = BigNumber.from(31557600);
export const secondsInTenYears = secondsInOneYear.mul(10);
const ts = new Decimal(1 / secondsInTenYears.toNumber());
const ts_result = tsToRate(ts, time);
console.log("time stretch", ts)
console.log("interest rate", ts_result);

const ts2_result = tsToRate2(ts);
console.log("Now interest rate with ts2", ts2_result);


console.log("\n*** Ticks to ratios ***",);
console.log("Tick 0", tickNumberToRatio(0, ts).toString());
console.log("Tick 1", tickNumberToRatio(1, ts).toString());
console.log("Tick 10", tickNumberToRatio(10, ts).toString());



console.log("\n*** Example operations ***",);

console.log("\n1. Inialialize market by depositing at 0% tick");

type TickObj = {
  value: BigNumber;
  shares: BigNumber;
  addedFy: BigNumber;
  fyRemaining: BigNumber;
};
const ticks: Map<number, TickObj> = new Map(); 


var base = WAD_BN.mul(1000);
var activeTick = 0;
var entry = {value: base, 
  shares: base,
  addedFy: ZERO_BN,
  fyRemaining: ZERO_BN
};
ticks.set(0, entry)
//console.log("0% tick", ticks.get(0));
//set current tick information 
//update globals
var currentBase = base;
var currentFy = base;
var virtualFy = currentFy;
var valueAbove = ZERO_BN;
console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());

// 2. 
console.log("\n2. Now add liquidity at 3%");

var baseToAdd = WAD_BN.mul(100);
var sharesToAdd = WAD_BN.mul(100);
var entry = {value: baseToAdd,
 shares: sharesToAdd, 
 addedFy: ZERO_BN,
 fyRemaining: ZERO_BN
};
ticks.set(3, entry)
//console.log("3% tick", ticks.get(3));
const threeRatio = tickNumberToRatio(3, ts);
console.log("3% ratio", threeRatio.toString());

// 3. 
console.log("\n3. Now trade to 3%");

const [baseToTrade928, fyToTrade928] = tradeToTick(
  currentBase,
  currentFy,
  threeRatio,
  time,
  18,
  false
);

//set globals
currentBase = currentBase.add(baseToTrade928);
currentFy = currentFy.add(fyToTrade928);
valueAbove = ZERO_BN;
activeTick = 0;

console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());

// 4. 
console.log("\n4. Now add 3% liquidity to active pool");

var baseToAdd425 = ticks.get(3)!['value'];
var fyToAdd425  = threeRatio.mul(baseToAdd425).div(WAD_BN);

console.log("base to add ", baseToAdd425.toString())
console.log("fyToken to add ", fyToAdd425.toString())

//const updateTick3 = {value: ticks.get(3)!['value'], 
//shares: ticks.get(3)!['shares'], 
//valueAbove: currentBase};
var updateTick3 = ticks.get(3)!;
updateTick3['addedFy'] = fyToAdd425;
ticks.set(3, updateTick3)
//console.log(ticks.get(3))

//update globals
valueAbove = currentBase;
currentBase = currentBase.add(baseToAdd425);
currentFy = currentFy.add(fyToAdd425);
activeTick = 3;

console.log("base after adding to active pool", currentBase.toString());
console.log("fyToken after adding to active pool", currentFy.toString());
console.log("three ratio", threeRatio.toString())

// 5 .
console.log("\n5. Now trade to 10% ");

const tenRatio = tickNumberToRatio(10, ts);

const [baseToTrade810, fyToTrade810] = tradeToTick(
  currentBase,
  currentFy,
  tenRatio,
  time,
  18,
  false
);

currentBase = currentBase.add(baseToTrade810);
currentFy = currentFy.add(fyToTrade810);

console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());


// 5A.

console.log("\n6. Add liquidity at 3% ");
var tickInfo = ticks.get(3)!;
const val = tickInfo['value'];
const valAbove = valueAbove;
const threeShares = tickInfo['shares'];
console.log("Three: value", val.toString());
console.log("Three: valAbove", valAbove.toString());
console.log("Three: shares", threeShares.toString());

const [baseToTrade712, fyToTrade712] = tradeToTick(
  currentBase,
  currentFy,
  threeRatio,
  time,
  18,
  true
);

const baseEquivalent = currentBase.add(baseToTrade712);
const fyEquivalent = currentFy.add(fyToTrade712);
const valueRecorded = val.add(valAbove);

console.log("current base", currentBase.toString());
console.log("base equivalent at tick", baseEquivalent.toString());
console.log("fy equivalent at tick", fyEquivalent.toString());
console.log("value Recorded", valueRecorded.toString());

const b_v_ratio = baseEquivalent.mul(WAD_BN).div(valueRecorded);
console.log("base equivalent/value Recorded", b_v_ratio.toString());

console.log("Add 100 base")

// Two ways to calculate at three tick 
// 1
const baseForToAdd = WAD_BN.mul(100);
const baseRatioForToAdd = baseForToAdd.add(currentBase).mul(WAD_BN).div(currentBase);
const fyTokenReservesAfterAdd = baseRatioForToAdd.mul(currentFy).div(WAD_BN); 
const fyTokensToAdd = fyTokenReservesAfterAdd.sub(currentFy);
console.log("fyTokens to Add", fyTokensToAdd.toString());
console.log("baseRatioForToAdd", baseRatioForToAdd.toString());
console.log("fyTokenReservesAfterAdd", fyTokenReservesAfterAdd.toString());

const baseToThreeTick = baseRatioForToAdd.mul(baseEquivalent).div(WAD_BN);
const fyToThreeTick = baseRatioForToAdd.mul(fyEquivalent).div(WAD_BN);
console.log("baseToThreeTick", baseToThreeTick.toString());
console.log("fyToThreeTick",fyToThreeTick.toString());


// 2
//Try calculating another way
const [baseToTrade216, fyToTrade216] = tradeToTick(
  baseForToAdd.add(currentBase),
  fyTokenReservesAfterAdd,
  threeRatio,
  time,
  18,
  true
);

const currentBase456 = baseForToAdd.add(currentBase).add(baseToTrade216);
const currentFy456 = fyTokenReservesAfterAdd.add(fyToTrade216);

console.log("\nbase after add and project", currentBase456.toString());
console.log("fyToken after add and project", currentFy456.toString());

//calculate new_base project to three tick 

const addedBaseProjected = currentBase456.sub(baseEquivalent);
const addedFyProjected = currentFy456.sub(fyEquivalent);
console.log("addedBaseProjected", addedBaseProjected.toString());
console.log("addedFyProjected", addedFyProjected.toString());


const delta_three_value = addedBaseProjected;
const delta_three_shares = addedBaseProjected.mul(WAD_BN).div(b_v_ratio);
const virtualFyAdded = addedBaseProjected.mul(threeRatio).div(WAD_BN);
const actualFyAdded = fyTokensToAdd.sub(virtualFyAdded);
console.log("delta_three_value", delta_three_shares.toString());
console.log("delta_three_shares", delta_three_shares.toString());
console.log("virtualFyAdded", virtualFyAdded.toString());
console.log("actualFyAdded", actualFyAdded.toString());

const finalBase = currentBase.add(baseForToAdd);
const finalFyTokens = currentFy.add(fyTokensToAdd); 
const finalThreeValue = tickInfo['value'].add(addedBaseProjected);
const finalThreeShares = tickInfo['shares'].add(delta_three_shares);
const finalAddedFy = tickInfo['addedFy'].add(addedFyProjected);


var updateTick3 = ticks.get(3)!;
updateTick3['value'] = finalThreeValue;
updateTick3['addedFy'] = finalAddedFy;
updateTick3['shares'] = finalThreeShares;
ticks.set(3, updateTick3)

currentBase = finalBase;
currentFy = finalFyTokens;

console.log("base after add", currentBase.toString());
console.log("fyToken after add", currentFy.toString());



// 6.
console.log("\n6. Now trade back to 3% ");

const [baseToTrade361, fyToTrade361] = tradeToTick(
  currentBase,
  currentFy,
  threeRatio,
  time,
  18,
  false
);

currentBase = currentBase.add(baseToTrade361);
currentFy = currentFy.add(fyToTrade361);

console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());

// 7.
console.log("\n7. Now remove 3% liquidity from active pool");

const three_shares = ticks.get(3)!['shares'];
const total_shares = three_shares.add(valueAbove); 

const baseToRemove = currentBase.mul(three_shares).div(total_shares);
const fyToRemove = currentFy.mul(three_shares).div(total_shares);

//update tick information
var updateTick3 = ticks.get(3)!;
updateTick3['fyRemaining'] = fyToRemove.sub(updateTick3['addedFy']);
ticks.set(3, updateTick3)

console.log("base to remove", baseToRemove.toString());
console.log("fyToken to remove", fyToRemove.toString());

currentBase = currentBase.sub(baseToRemove);
currentFy = currentFy.sub(fyToRemove);

console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());

// 8. 
console.log("\n8. Now trade to 2%");

const twoRatio = tickNumberToRatio(2, ts);

const [baseToTrade462, fyToTrade462] = tradeToTick(
  currentBase,
  currentFy,
  twoRatio,
  time,
  18,
  false
);

currentBase = currentBase.add(baseToTrade462);
currentFy = currentFy.add(fyToTrade462);

console.log("base after trade", currentBase.toString());
console.log("fyToken after trade", currentFy.toString());

// 9. 
console.log("\n9. Now remove liquidity at 3%");

var updateTick3 = ticks.get(3)!;
const baseOut = updateTick3['value'];
const fyOut = updateTick3['fyRemaining'];
const sharesRedeemed = updateTick3['shares'];

console.log("base out",  baseOut.toString());
console.log("fyTokens out", fyOut.toString());
console.log("shares redeemed", sharesRedeemed.toString());

ticks.delete(3);

console.log("\n10. Now trade to 2%");
console.log("\n11. Now add 2% liquidity to active pool");
