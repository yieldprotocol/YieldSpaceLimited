import { toBn, tradeToTick, sellFYToken, tsToRate, tsToRate2, tickNumberToRatio, valueAtTick, simpleInvariant } from './yieldMath';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { MAX_256, WAD_BN, ZERO_BN } from './constants';
import { Decimal } from 'decimal.js';

var time = "7776000";
//var time = "7776000";
export const SECONDS_PER_YEAR: number = 365 * 24 * 60 * 60;
export const secondsInOneYear = BigNumber.from(31557600);
export const secondsInTenYears = secondsInOneYear.mul(10);
const ts = new Decimal(1 / secondsInTenYears.toNumber());
Decimal.set({ rounding: 8, precision: 20 });
/**
 * Calculate fyToken to Base ratio from tick index.
 * @param { Decimal } index 
 * @param { Decimal } ts // timestretch
 * @returns { BigNumber } 
 */
export const pprint = (
  value : BigNumber
): string => {
  const wad_ = new Decimal(WAD_BN.toString());
  const out = new Decimal(value.toString());
  return out.div(wad_).toFixed(2);
}

console.log("pprint test", pprint(WAD_BN));

console.log("\n*** Example operations ***",);

console.log("\n1. Inialialize market by depositing at 0% tick");

type TickObj = {
  value: BigNumber;
  shares: BigNumber;
  valueAbove: BigNumber;
  addedFy: BigNumber;
  fyRemaining: BigNumber;
};
const ticks: Map<number, TickObj> = new Map(); 


var base = WAD_BN.mul(1000);
var activeTick = 0;
var entry = {value: base, 
  shares: base,
  valueAbove: ZERO_BN,
  addedFy: ZERO_BN,
  fyRemaining: ZERO_BN
};
ticks.set(0, entry);
//console.log("0% tick", ticks.get(0));
//set current tick information 
//update globals
var currentBase = base;
var currentFy = base;
var virtualFy = currentFy;
var valueAbove = ZERO_BN;
console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// 2. 
console.log("\n2. Now add liquidity at 3%");

var baseToAdd = WAD_BN.mul(100);
var sharesToAdd = WAD_BN.mul(100);
var entry = {value: baseToAdd,
 shares: sharesToAdd, 
 valueAbove: ZERO_BN,
 addedFy: ZERO_BN,
 fyRemaining: ZERO_BN
};
ticks.set(3, entry)
//console.log("3% tick", ticks.get(3));
const threeRatio = tickNumberToRatio(3, ts);
console.log("3% ratio", pprint(threeRatio));

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

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// 4. 
console.log("\n4. Now add 3% liquidity to active pool");

var baseToAdd425 = ticks.get(3)!['value'];
var fyToAdd425  = threeRatio.mul(baseToAdd425).div(WAD_BN);

console.log("base to add ", pprint(baseToAdd425))
console.log("fyToken to add ", pprint(fyToAdd425))

//const updateTick3 = {value: ticks.get(3)!['value'], 
//shares: ticks.get(3)!['shares'], 
//valueAbove: currentBase};
var updateTick3 = ticks.get(3)!;
updateTick3['addedFy'] = fyToAdd425;
updateTick3['valueAbove'] = currentBase;
ticks.set(3, updateTick3)
//console.log(ticks.get(3))

//update globals
//valueAbove = currentBase;
currentBase = currentBase.add(baseToAdd425);
currentFy = currentFy.add(fyToAdd425);
activeTick = 3;

console.log("base after adding to active pool", pprint(currentBase));
console.log("fyToken after adding to active pool", pprint(currentFy));
console.log("three ratio", pprint(threeRatio))

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

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// Examine addition properties of invariant
/*
console.log("\n Addition Properties");
var time = "76000";
const baseForToAdd1 = WAD_BN.mul(100);
const baseRatioForToAdd1 = baseForToAdd1.add(currentBase).mul(WAD_BN).div(currentBase);
const fyTokenReservesAfterAdd1 = baseRatioForToAdd1.mul(currentFy).div(WAD_BN); 
const fyTokensToAdd1 = fyTokenReservesAfterAdd1.sub(currentFy);
const invariant1 = simpleInvariant(
  baseForToAdd1,
  fyTokensToAdd1,
  time,
  18,
  true
);


console.log("base to Add", baseForToAdd1.toString());
console.log("fyTokens to Add", fyTokensToAdd1.toString());
console.log("invariant for add", invariant1.toString());

const invariant2 = simpleInvariant(
  currentBase,
  currentFy,
  time,
  18,
  true
);
console.log("base", currentBase.toString());
console.log("fyToken", currentFy.toString());
console.log("invariant", invariant2.toString());

const invariant3 = simpleInvariant(
  currentBase.add(baseForToAdd1),
  currentFy.add(fyTokensToAdd1),
  time,
  18,
  true
);

console.log("combined than invariant", invariant3.toString());
console.log("invariant than combined ", invariant1.add(invariant2).toString());
*/

//Now let's change the time!
//var time = "76000";
//var time = "7776000";

// 5A.

console.log("\n6. Add liquidity at 3% ");
var tickInfo = ticks.get(3)!;
const val = tickInfo['value'];
const valAbove = tickInfo['valueAbove'];
const threeShares = tickInfo['shares'];
console.log("Three: value", pprint(val));
console.log("Three: valAbove", pprint(valAbove));
console.log("Three: shares", pprint(threeShares));

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

console.log("current base", pprint(currentBase));
console.log("base equivalent at tick", pprint(baseEquivalent));
console.log("fy equivalent at tick", pprint(fyEquivalent));
console.log("value Recorded", pprint(valueRecorded));

const b_v_ratio = baseEquivalent.mul(WAD_BN).div(valueRecorded);
console.log("base equivalent/value Recorded", pprint(b_v_ratio));

console.log("Add 100 base")

// Two ways to calculate at three tick 
// 1
const baseForToAdd = WAD_BN.mul(100);
const baseRatioForToAdd = baseForToAdd.add(currentBase).mul(WAD_BN).div(currentBase);
const fyTokenReservesAfterAdd = baseRatioForToAdd.mul(currentFy).div(WAD_BN); 
const fyTokensToAdd = fyTokenReservesAfterAdd.sub(currentFy);
console.log("fyTokens to Add", pprint(fyTokensToAdd));
console.log("baseRatioForToAdd", pprint(baseRatioForToAdd));
console.log("fyTokenReservesAfterAdd", pprint(fyTokenReservesAfterAdd));

const baseToThreeTick = baseRatioForToAdd.mul(baseEquivalent).div(WAD_BN);
const fyToThreeTick = baseRatioForToAdd.mul(fyEquivalent).div(WAD_BN);
console.log("baseToThreeTick", pprint(baseToThreeTick));
console.log("fyToThreeTick",pprint(fyToThreeTick));


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

console.log("\nbase after add and project", pprint(currentBase456));
console.log("fyToken after add and project", pprint(currentFy456));

//calculate new_base project to three tick 

const addedBaseProjected = currentBase456.sub(baseEquivalent);
const addedFyProjected = currentFy456.sub(fyEquivalent);
console.log("addedBaseProjected", pprint(addedBaseProjected));
console.log("addedFyProjected", pprint(addedFyProjected));


const delta_three_value = addedBaseProjected;
const delta_three_shares = addedBaseProjected.mul(WAD_BN).div(b_v_ratio);
const virtualFyAdded = addedBaseProjected.mul(threeRatio).div(WAD_BN);
const actualFyAdded = fyTokensToAdd.sub(virtualFyAdded);
console.log("delta_three_value", pprint(delta_three_shares));
console.log("delta_three_shares", pprint(delta_three_shares));
console.log("virtualFyAdded", pprint(virtualFyAdded));
console.log("actualFyAdded", pprint(actualFyAdded));

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

console.log("base after add", pprint(currentBase));
console.log("fyToken after add", pprint(currentFy));



//5B.
console.log("\n7. Now add liquidity at 1% ");

console.log("Add 100 base")
const newBase = WAD_BN.mul(100);

const oBaseRatioForToAdd = newBase.add(currentBase).mul(WAD_BN).div(currentBase);
const oFyTokenReservesAfterAdd = oBaseRatioForToAdd.mul(currentFy).div(WAD_BN); 
const oFyTokensToAdd = oFyTokenReservesAfterAdd.sub(currentFy);
console.log("Base to Add", pprint(newBase));
console.log("fyTokens to Add", pprint(oFyTokensToAdd));
console.log("baseRatioForToAdd", pprint(oBaseRatioForToAdd));
console.log("fyTokenReservesAfterAdd", pprint(oFyTokenReservesAfterAdd));


const [baseToTrade634, fyToTrade634] = tradeToTick(
  currentBase,
  currentFy,
  threeRatio,
  time,
  18,
  true
);

const oBaseEquivalent = currentBase.add(baseToTrade634);
const oFyEquivalent = currentFy.add(fyToTrade634);
var tickInfo = ticks.get(3)!;
const oVal = tickInfo['value'];
const oValAbove = tickInfo['valueAbove'];
const oThreeShares = tickInfo['shares'];
const oValueRecorded = oVal.add(oValAbove);

const oBaseToThreeTick = oBaseRatioForToAdd.mul(oBaseEquivalent).div(WAD_BN);
const oFyToThreeTick = oBaseRatioForToAdd.mul(oFyEquivalent).div(WAD_BN);
console.log("baseToThreeTick", pprint(baseToThreeTick));
console.log("fyToThreeTick",pprint(fyToThreeTick));

const oBaseAtThreeTick = oBaseToThreeTick.sub(oBaseEquivalent);
const oFyAtThreeTick = oFyToThreeTick.sub(oFyEquivalent);
const baseAboveThreeToBaseBelow = oBaseEquivalent.mul(WAD_BN).div(oValAbove.add(oVal));

const oBaseBelowThreeTick = oBaseAtThreeTick.mul(WAD_BN).div(baseAboveThreeToBaseBelow);
const oFyBelowThreeTick = oFyAtThreeTick.mul(WAD_BN).div(baseAboveThreeToBaseBelow);

//Now Project valueAbove to the 1% tick

const oneRatio = tickNumberToRatio(1, ts);

const [baseToTrade763, fyToTrade763] = tradeToTick(
  oValAbove,
  oValAbove.mul(threeRatio).div(WAD_BN),
  oneRatio,
  time,
  18,
  true
);

const oValAboveAtOneTick = oValAbove.add(baseToTrade763);
const valueAtOneTick = oBaseBelowThreeTick.mul(oValAboveAtOneTick).div(oValAbove);

console.log("oValAboveAtOneTick", pprint(oValAboveAtOneTick));
console.log("valueAtOneTick", pprint(valueAtOneTick));

// make updates

const oneTickInit = {
  value: valueAtOneTick,
  shares: valueAtOneTick,
  valueAbove: oValAboveAtOneTick,
  addedFy: valueAtOneTick.mul(oneRatio).div(WAD_BN),
  fyRemaining: ZERO_BN
}
ticks.set(1, oneTickInit);

var updateTick3 = ticks.get(3)!;
updateTick3['valueAbove'] = updateTick3['valueAbove'].add(oBaseBelowThreeTick);
ticks.set(3, updateTick3)

currentBase = currentBase.add(newBase);
currentFy = oFyTokenReservesAfterAdd;

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));




// 6.
console.log("\n8. Now trade back to 3% ");

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

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// 7.
console.log("\n9. Now remove 3% liquidity from active pool");

const three_shares = ticks.get(3)!['shares'];
const total_shares = three_shares.add(valueAbove); 

const baseToRemove = currentBase.mul(three_shares).div(total_shares);
const fyToRemove = currentFy.mul(three_shares).div(total_shares);

//update tick information
var updateTick3 = ticks.get(3)!;
updateTick3['fyRemaining'] = fyToRemove.sub(updateTick3['addedFy']);
ticks.set(3, updateTick3)

console.log("base to remove", pprint(baseToRemove));
console.log("fyToken to remove", pprint(fyToRemove));

currentBase = currentBase.sub(baseToRemove);
currentFy = currentFy.sub(fyToRemove);

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// 8. 
console.log("\n10. Now trade to 2%");

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

console.log("base after trade", pprint(currentBase));
console.log("fyToken after trade", pprint(currentFy));

// 9. 
console.log("\n11. Now remove liquidity at 3%");

var updateTick3 = ticks.get(3)!;
const baseOut = updateTick3['value'];
const fyOut = updateTick3['fyRemaining'];
const sharesRedeemed = updateTick3['shares'];

console.log("base out",  pprint(baseOut));
console.log("fyTokens out", pprint(fyOut));
console.log("shares redeemed", pprint(sharesRedeemed));

ticks.delete(3);

console.log("\n10. Now trade to 2%");
console.log("\n11. Now add 2% liquidity to active pool");
