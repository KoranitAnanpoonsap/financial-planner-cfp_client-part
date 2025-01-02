export async function fetchAndCalculateTaxForClient(clientId) {
  const incomesDataString = localStorage.getItem("clientIncomes");
  if (!incomesDataString) {
    throw new Error("No client income data found in localStorage under 'clientIncomes'.");
  }

  let incomesData;
  try {
    incomesData = JSON.parse(incomesDataString);
  } catch (error) {
    throw new Error("Failed to parse 'clientIncomes' data from localStorage. Ensure it's valid JSON.");
  }

  const tdDataString = localStorage.getItem("taxDeduction");
  let tdData = null;
  if (tdDataString) {
    try {
      tdData = JSON.parse(tdDataString);
    } catch (error) {
      throw new Error("Failed to parse 'taxDeduction' data from localStorage. Ensure it's valid JSON.");
    }
  }

  const taxResult = calculateTaxForClient(incomesData, tdData);
  taxResult.taxDeduction = tdData; // Attach taxDeduction data for further use
  return taxResult;
}

export function calculateTaxForClient(incomes, td) {
  const adjustedIncomes = incomes.map((inc) => {
    if (inc.clientIncomeFrequency === "ทุกเดือน") {
      return {
        ...inc,
        clientIncomeAmount: inc.clientIncomeAmount * 12,
      };
    }
    return inc;
  });

  const totalIncome = adjustedIncomes.reduce(
    (sum, inc) => sum + inc.clientIncomeAmount,
    0
  );

  let totalExpenseDeductions = 0;

  let combinedSalaryAmount = 0;
  const otherIncomes = [];
  for (const inc of adjustedIncomes) {
    if (
      inc.clientIncomeType === "40(1) เงินเดือน" ||
      inc.clientIncomeType === "40(2) รับจ้างทำงาน"
    ) {
      combinedSalaryAmount += inc.clientIncomeAmount;
    } else {
      otherIncomes.push(inc);
    }
  }

  if (combinedSalaryAmount > 0) {
    let deduction = combinedSalaryAmount * 0.5;
    if (deduction > 100000) deduction = 100000;
    totalExpenseDeductions += deduction;
  }

  let sum408Under300k = 0;
  let sum408Over300k = 0;
  let sum408Rest = 0;
  let sum408OtherDeduction = 0;

  for (const inc of otherIncomes) {
    switch (inc.clientIncomeType) {
      case "40(3) ค่าลิขสิทธิ์ สิทธิบัตร": {
        let deduction = inc.clientIncomeAmount * 0.5;
        if (deduction > 100000) deduction = 100000;
        totalExpenseDeductions += deduction;
        break;
      }

      case "40(4) ดอกเบี้ย เงินปันผล":
        // No deduction logic for this case
        break;

      case "40(5) ค่าเช่าทรัพย์สิน": {
        let deduction = 0;
        switch (inc.clientIncome405Type) {
          case "บ้าน/โรงเรือน/สิ่งปลูกสร้าง/แพ/ยานพาหนะ":
            deduction = inc.clientIncomeAmount * 0.3;
            break;
          case "ที่ดินที่ใช้ในการเกษตร":
            deduction = inc.clientIncomeAmount * 0.2;
            break;
          case "ที่ดินที่มิได้ใช้ในการเกษตร":
            deduction = inc.clientIncomeAmount * 0.15;
            break;
          case "ทรัพย์สินอื่นๆ":
            deduction = inc.clientIncomeAmount * 0.1;
            break;
          default:
            deduction = 0;
        }
        totalExpenseDeductions += deduction;
        break;
      }

      case "40(6) วิชาชีพอิสระ": {
        let deduction = 0;
        switch (inc.clientIncome406Type) {
          case "การประกอบโรคศิลปะ":
            deduction = inc.clientIncomeAmount * 0.6;
            break;
          case "กฎหมาย/วิศวกรรม/สถาปัตยกรรม/การบัญชี/ประณีตศิลปกรรม":
            deduction = inc.clientIncomeAmount * 0.3;
            break;
          default:
            deduction = 0;
        }
        totalExpenseDeductions += deduction;
        break;
      }

      case "40(7) รับเหมาก่อสร้าง": {
        let deduction = inc.clientIncomeAmount * 0.6;
        totalExpenseDeductions += deduction;
        break;
      }

      case "40(8) รายได้อื่นๆ": {
        const sub8 = inc.clientIncome408Type;
        if (sub8 === "ประเภทที่ (1) (เงินได้ส่วนที่ไม่เกิน 300,000 บาท)") {
          sum408Under300k += inc.clientIncomeAmount;
        } else if (sub8 === "ประเภทที่ (1) (เงินได้ส่วนที่เกิน 300,000 บาท)") {
          sum408Over300k += inc.clientIncomeAmount;
        } else if (sub8 === "ประเภทที่ (2) ถึง (43)") {
          sum408Rest += inc.clientIncomeAmount * 0.6;
        } else if (sub8 === "เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)") {
          sum408OtherDeduction += inc.clientIncome408TypeOtherExpenseDeduction || 0;
        }
        break;
      }

      default:
        break;
    }
  }

  // Calculate deductions for "40(8) รายได้อื่นๆ"
  let deduction408Under300 = sum408Under300k * 0.6;
  let deduction408Over300 = sum408Over300k * 0.4;
  let combined408Ded = deduction408Under300 + deduction408Over300;
  if (combined408Ded > 600000) {
    combined408Ded = 600000;
  }

  totalExpenseDeductions += combined408Ded;
  totalExpenseDeductions += sum408Rest;
  totalExpenseDeductions += sum408OtherDeduction;

  let totalTaxDeductions = 0;

  if (td != null) {
    const ms = td.maritalStatus;
    if (ms === "โสด" || ms === "คู่สมรสมีเงินได้แยกยื่นแบบ") {
      totalTaxDeductions += 60000;
    } else if (
      ms === "คู่สมรสมีเงินได้ยื่นรวม" ||
      ms === "คู่สมรสไม่มีเงินได้"
    ) {
      totalTaxDeductions += 120000;
    }

    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม" ? td.child * 60000 : td.child * 30000;
    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม"
        ? td.child2561 * 120000
        : td.child2561 * 60000;
    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม"
        ? td.adoptedChild * 60000
        : td.adoptedChild * 30000;

    totalTaxDeductions += td.parentalCare * 30000;
    totalTaxDeductions += td.disabledCare * 60000;

    totalTaxDeductions += td.prenatalCare || 0;
    totalTaxDeductions += td.parentHealthInsurance || 0;
    totalTaxDeductions += td.lifeInsurance || 0;
    totalTaxDeductions += td.healthInsurance || 0;
    totalTaxDeductions += td.spouseNoIncomeLifeInsurance || 0;
    totalTaxDeductions += td.socialSecurityPremium || 0;
    totalTaxDeductions += td.socialEnterprise || 0;
    totalTaxDeductions += td.thaiEsg || 0;
    totalTaxDeductions += td.generalDonation || 0;
    totalTaxDeductions += (td.eduDonation || 0) * 2;
    totalTaxDeductions += td.politicalPartyDonation || 0;

    let portion_pensionIns = 0;
    if ((td.lifeInsurance || 0) + (td.healthInsurance || 0) < 100000) {
      const remaining =
        100000 -
        ((td.lifeInsurance || 0) + (td.healthInsurance || 0));
      portion_pensionIns = Math.min(
        remaining,
        td.pensionInsurance || 0
      );
    }

    totalTaxDeductions += portion_pensionIns;

    let newPensionIns = Math.min(
      (td.pensionInsurance || 0) - portion_pensionIns,
      0.15 * totalIncome,
      200000
    );

    const pensionGroupSum = Math.min(
      (newPensionIns || 0) +
        (td.rmf || 0) +
        (td.ssf || 0) +
        (td.govPensionFund || 0) +
        (td.pvd || 0) +
        (td.nationSavingsFund || 0),
      500000
    );
    totalTaxDeductions += pensionGroupSum;
  }

  let incomeAfterDeductions =
    totalIncome - totalExpenseDeductions - totalTaxDeductions;
  if (incomeAfterDeductions < 0) {
    incomeAfterDeductions = 0;
  }

  const method1Tax = calculateMethod1Tax(incomeAfterDeductions);

  const salary = adjustedIncomes
    .filter((i) => i.clientIncomeType === "40(1) เงินเดือน")
    .reduce((sum, i) => sum + i.clientIncomeAmount, 0);
  const incomeNonSalary = totalIncome - salary;

  let method2Tax = 0;
  if (incomeNonSalary > 1000000) {
    method2Tax = incomeNonSalary * 0.005;
  }

  let finalTax = method1Tax;
  if (method2Tax > 0 && method2Tax > method1Tax) {
    finalTax = method2Tax;
  }

  return {
    taxToPay: finalTax,
    totalIncome: totalIncome,
    incomeAfterDeductions: incomeAfterDeductions,
    totalExpenseDeductions: totalExpenseDeductions,
  };
}

function calculateMethod1Tax(income) {
  let tax = 0;
  if (income <= 150000) {
    tax = 0;
  } else if (income <= 300000) {
    tax = (income - 150000) * 0.05;
  } else if (income <= 500000) {
    tax = 7500 + (income - 300000) * 0.1;
  } else if (income <= 750000) {
    tax = 27500 + (income - 500000) * 0.15;
  } else if (income <= 1000000) {
    tax = 65000 + (income - 750000) * 0.2;
  } else if (income <= 2000000) {
    tax = 115000 + (income - 1000000) * 0.25;
  } else if (income <= 5000000) {
    tax = 365000 + (income - 2000000) * 0.3;
  } else {
    tax = 1265000 + (income - 5000000) * 0.35;
  }
  return tax;
}
