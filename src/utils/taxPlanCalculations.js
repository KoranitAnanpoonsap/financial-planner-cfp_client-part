export async function fetchAndCalculateTaxPlanForClient(clientId, totalPlan) {
  // Fetch incomes from localStorage
  const incomesString = localStorage.getItem("clientIncomes");
  let incomesData = [];
  if (incomesString) {
    try {
      incomesData = JSON.parse(incomesString);
    } catch (error) {
      console.error("Failed to parse 'clientIncomes' from localStorage.");
    }
  }

  // Adjust incomes to yearly if frequency == "ทุกเดือน"
  const adjustedIncomes = incomesData.map((inc) => {
    if (inc.clientIncomeFrequency === "ทุกเดือน") {
      return {
        ...inc,
        clientIncomeAmount: inc.clientIncomeAmount * 12,
      };
    }
    return inc;
  });

  // Fetch tax deductions from localStorage
  const taxDeductionsString = localStorage.getItem("taxDeduction");
  let taxDeductionsData = null;
  if (taxDeductionsString) {
    try {
      taxDeductionsData = JSON.parse(taxDeductionsString);
    } catch (error) {
      console.error("Failed to parse 'taxDeduction' from localStorage.");
    }
  }

  return calculateTaxPlanForClient(adjustedIncomes, taxDeductionsData, totalPlan);
}

// Function to calculate tax plan for client
export function calculateTaxPlanForClient(incomes, td, totalPlan) {
  // 1) Calculate total income
  const totalIncome = incomes.reduce(
    (sum, inc) => sum + inc.clientIncomeAmount,
    0
  );

  // 2) Handle expense deductions
  let totalExpenseDeductions = 0;

  // Step A: Combine 40(1) & 40(2)
  let combinedSalaryAmount = 0;
  const otherIncomes = [];
  for (const inc of incomes) {
    if (
      inc.clientIncomeType === "40(1) เงินเดือน" ||
      inc.clientIncomeType === "40(2) รับจ้างทำงาน"
    ) {
      combinedSalaryAmount += inc.clientIncomeAmount;
    } else {
      otherIncomes.push(inc);
    }
  }
  // 40(1) & 40(2) => 50% capped at 100k
  if (combinedSalaryAmount > 0) {
    let deduction = combinedSalaryAmount * 0.5;
    if (deduction > 100000) deduction = 100000;
    totalExpenseDeductions += deduction;
  }

  // Step B: Handle 40(8) subtypes
  let sum408Under300k = 0; // subtype: (เงินได้ส่วนที่ไม่เกิน 300,000 บาท)
  let sum408Over300k = 0; // subtype: (เงินได้ส่วนที่เกิน 300,000 บาท)
  let sum408Rest = 0; // subtype: (2)ถึง(43), each 60%
  let sum408OtherDeduction = 0; // for "เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)"

  // Step C: Loop over each "other" income (which includes 40(3)...40(8))
  for (const inc of otherIncomes) {
    let deduction = 0;

    switch (inc.clientIncomeType) {
      case "40(3) ค่าลิขสิทธิ์ สิทธิบัตร":
        // 50% capped at 100k
        deduction = inc.clientIncomeAmount * 0.5;
        if (deduction > 100000) deduction = 100000;
        totalExpenseDeductions += deduction;
        break;

      case "40(4) ดอกเบี้ย เงินปันผล":
        deduction = 0;
        totalExpenseDeductions += deduction;
        break;

      case "40(5) ค่าเช่าทรัพย์สิน":
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

      case "40(6) วิชาชีพอิสระ":
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

      case "40(7) รับเหมาก่อสร้าง":
        deduction = inc.clientIncomeAmount * 0.6;
        totalExpenseDeductions += deduction;
        break;

      case "40(8) รายได้อื่นๆ":
        // Handle subtypes
        const sub8 = inc.clientIncome408Type;
        if (sub8 === "ประเภทที่ (1) (เงินได้ส่วนที่ไม่เกิน 300,000 บาท)") {
          // Accumulate and apply 60%
          sum408Under300k += inc.clientIncomeAmount;
        } else if (sub8 === "ประเภทที่ (1) (เงินได้ส่วนที่เกิน 300,000 บาท)") {
          // Accumulate and apply 40%
          sum408Over300k += inc.clientIncomeAmount;
        } else if (sub8 === "ประเภทที่ (2) ถึง (43)") {
          // 60% fixed
          const d = inc.clientIncomeAmount * 0.6;
          sum408Rest += d;
        } else if (sub8 === "เงินได้ประเภทที่ไม่อยู่ใน (1) ถึง (43)") {
          // Use user’s custom field
          sum408OtherDeduction += inc.clientIncome408TypeOtherExpenseDeduction || 0;
        } else {
          // Unrecognized subtype
        }
        break;

      default:
        // Unknown or empty
        deduction = 0;
        totalExpenseDeductions += deduction;
        break;
    }
  }

  // Finalize the 40(8) sub-subtype calculations:
  // Combine deductions with a cap of 600,000
  let deduction408Under300 = sum408Under300k * 0.6;
  let deduction408Over300 = sum408Over300k * 0.4;
  let combined408Ded = deduction408Under300 + deduction408Over300;
  if (combined408Ded > 600000) {
    combined408Ded = 600000;
  }

  // Add sub(2)–(43) total
  totalExpenseDeductions += combined408Ded;
  totalExpenseDeductions += sum408Rest;
  totalExpenseDeductions += sum408OtherDeduction;

  // Sum all tax deductions
  let totalTaxDeductions = 0;

  if (td != null) {
    // Marital status
    const ms = td.maritalStatus;
    if (ms === "โสด" || ms === "คู่สมรสมีเงินได้แยกยื่นแบบ") {
      totalTaxDeductions += 60000;
    } else if (ms === "คู่สมรสมีเงินได้ยื่นรวม" || ms === "คู่สมรสไม่มีเงินได้") {
      totalTaxDeductions += 120000;
    }

    // Child deductions
    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม" ? td.child * 60000 : td.child * 30000;
    // Child2561 deductions
    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม"
        ? td.child2561 * 120000
        : td.child2561 * 60000;
    // Adopted child deductions
    totalTaxDeductions +=
      ms === "คู่สมรสมีเงินได้ยื่นรวม"
        ? td.adoptedChild * 60000
        : td.adoptedChild * 30000;
    // Parental care
    totalTaxDeductions += td.parentalCare * 30000;
    // Disabled care
    totalTaxDeductions += td.disabledCare * 60000;

    // Add all other fields directly
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
    totalTaxDeductions += totalPlan || 0;

    // Handle pension insurance portion
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
  }

  // Income after deductions
  let incomeAfterDeductions =
    totalIncome - totalExpenseDeductions - totalTaxDeductions;
  if (incomeAfterDeductions < 0) {
    incomeAfterDeductions = 0;
  }

  const method1Tax = calculateMethod1Tax(incomeAfterDeductions);

  const salary = incomes
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

export function calculateMethod1Tax(income) {
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
