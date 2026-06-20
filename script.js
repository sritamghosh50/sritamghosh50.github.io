const itemsBody = document.getElementById("itemsBody");

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("invoiceDate").valueAsDate = new Date();

  addItem({
    name: "Item 1",
    qty: 1,
    unit: "PCS",
    price: 200,
    discount: 20,
    gst: 5
  });

  addItem({
    name: "Item 2",
    qty: 1,
    unit: "PCS",
    price: 250,
    discount: 10,
    gst: 18
  });

  addLiveUpdateEvents();
  calculateInvoice();
});

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addLiveUpdateEvents() {
  const inputIds = [
    "sellerName",
    "sellerPhone",
    "sellerEmail",
    "sellerGstin",
    "sellerState",
    "sellerAddress",
    "customerName",
    "customerPhone",
    "customerEmail",
    "customerGstin",
    "customerState",
    "billingAddress",
    "shippingAddress",
    "invoiceNo",
    "invoiceDate",
    "receivedAmountInput",
    "terms"
  ];

  inputIds.forEach(function (id) {
    const element = document.getElementById(id);

    if (element) {
      element.addEventListener("input", calculateInvoice);
      element.addEventListener("change", calculateInvoice);
    }
  });
}

function addItem(data = {}) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>
      <input 
        type="text" 
        class="item-name" 
        value="${data.name || ""}" 
        placeholder="Item name"
      />
    </td>

    <td>
      <input 
        type="number" 
        class="item-qty" 
        value="${data.qty || 1}" 
        min="1"
      />
    </td>

    <td>
      <input 
        type="text" 
        class="item-unit" 
        value="${data.unit || "PCS"}"
      />
    </td>

    <td>
      <input 
        type="number" 
        class="item-price" 
        value="${data.price || 0}" 
        min="0"
      />
    </td>

    <td>
      <input 
        type="number" 
        class="item-discount" 
        value="${data.discount || 0}" 
        min="0"
      />
    </td>

    <td>
      <select class="item-gst">
        <option value="0" ${data.gst == 0 ? "selected" : ""}>0%</option>
        <option value="5" ${data.gst == 5 ? "selected" : ""}>5%</option>
        <option value="12" ${data.gst == 12 ? "selected" : ""}>12%</option>
        <option value="18" ${data.gst == 18 || data.gst === undefined ? "selected" : ""}>18%</option>
        <option value="28" ${data.gst == 28 ? "selected" : ""}>28%</option>
      </select>
    </td>

    <td class="item-final-amount">₹0.00</td>

    <td>
      <button class="delete-btn" onclick="removeItem(this)">X</button>
    </td>
  `;

  itemsBody.appendChild(row);

  const inputs = row.querySelectorAll("input, select");

  inputs.forEach(function (input) {
    input.addEventListener("input", calculateInvoice);
    input.addEventListener("change", calculateInvoice);
  });

  calculateInvoice();
}

function removeItem(button) {
  const rows = document.querySelectorAll("#itemsBody tr");

  if (rows.length === 1) {
    alert("At least one item is required.");
    return;
  }

  button.closest("tr").remove();
  calculateInvoice();
}

function calculateInvoice() {
  const rows = document.querySelectorAll("#itemsBody tr");

  let subTotal = 0;
  let totalDiscount = 0;
  let totalGst = 0;
  let grandTotal = 0;
  let totalQty = 0;

  const billItemsBody = document.getElementById("billItemsBody");
  billItemsBody.innerHTML = "";

  rows.forEach(function (row, index) {
    const name = row.querySelector(".item-name").value || "Item " + (index + 1);
    const qty = Number(row.querySelector(".item-qty").value) || 0;
    const unit = row.querySelector(".item-unit").value || "PCS";
    const price = Number(row.querySelector(".item-price").value) || 0;
    const discount = Number(row.querySelector(".item-discount").value) || 0;
    const gstRate = Number(row.querySelector(".item-gst").value) || 0;

    const baseAmount = qty * price;
    const finalDiscount = Math.min(discount, baseAmount);
    const taxableAmount = baseAmount - finalDiscount;
    const gstAmount = (taxableAmount * gstRate) / 100;
    const finalAmount = taxableAmount + gstAmount;

    subTotal += baseAmount;
    totalDiscount += finalDiscount;
    totalGst += gstAmount;
    grandTotal += finalAmount;
    totalQty += qty;

    row.querySelector(".item-final-amount").innerText = formatCurrency(finalAmount);

    const billRow = document.createElement("tr");

    billRow.innerHTML = `
      <td>${index + 1}</td>
      <td>${name}</td>
      <td>${qty}</td>
      <td>${unit}</td>
      <td>${price.toFixed(2)}</td>
      <td>${finalDiscount.toFixed(2)}</td>
      <td>${gstRate}%</td>
      <td>${finalAmount.toFixed(2)}</td>
    `;

    billItemsBody.appendChild(billRow);
  });

  const receivedAmount = Number(document.getElementById("receivedAmountInput").value) || 0;
  const balanceAmount = Math.max(grandTotal - receivedAmount, 0);

  const sgst = totalGst / 2;
  const cgst = totalGst / 2;

  updateScreenSummary(subTotal, totalDiscount, totalGst, grandTotal);
  updateBillDetails(
    subTotal,
    totalDiscount,
    totalGst,
    sgst,
    cgst,
    grandTotal,
    receivedAmount,
    balanceAmount,
    totalQty
  );
}

function updateScreenSummary(subTotal, totalDiscount, totalGst, grandTotal) {
  document.getElementById("screenSubTotal").innerText = formatCurrency(subTotal);
  document.getElementById("screenDiscount").innerText = formatCurrency(totalDiscount);
  document.getElementById("screenGst").innerText = formatCurrency(totalGst);
  document.getElementById("screenGrandTotal").innerText = formatCurrency(grandTotal);
}

function updateBillDetails(
  subTotal,
  totalDiscount,
  totalGst,
  sgst,
  cgst,
  grandTotal,
  receivedAmount,
  balanceAmount,
  totalQty
) {
  document.getElementById("billSellerName").innerText =
    document.getElementById("sellerName").value || "Seller Name";

  document.getElementById("billSellerAddress").innerText =
    "Address: " + (document.getElementById("sellerAddress").value || "");

  document.getElementById("billSellerPhone").innerText =
    document.getElementById("sellerPhone").value || "";

  document.getElementById("billSellerEmail").innerText =
    document.getElementById("sellerEmail").value || "";

  document.getElementById("billSellerGstin").innerText =
    document.getElementById("sellerGstin").value || "";

  document.getElementById("billSellerState").innerText =
    document.getElementById("sellerState").value || "";

  document.getElementById("billCustomerName").innerText =
    document.getElementById("customerName").value || "";

  document.getElementById("billBillingAddress").innerText =
    document.getElementById("billingAddress").value || "";

  document.getElementById("billCustomerPhone").innerText =
    document.getElementById("customerPhone").value || "";

  document.getElementById("billCustomerGstin").innerText =
    document.getElementById("customerGstin").value || "";

  document.getElementById("billCustomerState").innerText =
    document.getElementById("customerState").value || "";

  document.getElementById("billShippingAddress").innerText =
    document.getElementById("shippingAddress").value || "";

  document.getElementById("billInvoiceNo").innerText =
    document.getElementById("invoiceNo").value || "";

  document.getElementById("billInvoiceDate").innerText =
    document.getElementById("invoiceDate").value || "";

  document.getElementById("billTerms").innerText =
    document.getElementById("terms").value || "";

  document.getElementById("billTotalQty").innerHTML =
    `<b>${totalQty}</b>`;

  document.getElementById("billTotalDiscount").innerHTML =
    `<b>${totalDiscount.toFixed(2)}</b>`;

  document.getElementById("billTotalGst").innerHTML =
    `<b>${totalGst.toFixed(2)}</b>`;

  document.getElementById("billGrandTotal").innerHTML =
    `<b>${grandTotal.toFixed(2)}</b>`;

  document.getElementById("billSubTotal").innerText = formatCurrency(subTotal);
  document.getElementById("billDiscount").innerText = formatCurrency(totalDiscount);
  document.getElementById("billSgst").innerText = formatCurrency(sgst);
  document.getElementById("billCgst").innerText = formatCurrency(cgst);
  document.getElementById("billFinalTotal").innerText = formatCurrency(grandTotal);
  document.getElementById("billReceived").innerText = formatCurrency(receivedAmount);
  document.getElementById("billBalance").innerText = formatCurrency(balanceAmount);

  document.getElementById("amountWords").innerText =
    numberToWords(Math.round(grandTotal)) + " Rupees Only";
}

function printInvoice() {
  calculateInvoice();
  window.print();
}

function resetInvoice() {
  document.getElementById("sellerName").value = "Sritam Ghosh";
  document.getElementById("sellerPhone").value = "";
  document.getElementById("sellerEmail").value = "sritamghosh50@gmail.com";
  document.getElementById("sellerGstin").value = "";
  document.getElementById("sellerState").value = "Odisha";
  document.getElementById("sellerAddress").value = "";

  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerGstin").value = "";
  document.getElementById("customerState").value = "";
  document.getElementById("billingAddress").value = "";
  document.getElementById("shippingAddress").value = "";

  document.getElementById("invoiceNo").value = "ABC-2022-001";
  document.getElementById("invoiceDate").valueAsDate = new Date();
  document.getElementById("receivedAmountInput").value = 0;
  document.getElementById("terms").value = "Goods once sold will not be taken back.";

  itemsBody.innerHTML = "";

  addItem({
    name: "Item 1",
    qty: 1,
    unit: "PCS",
    price: 200,
    discount: 20,
    gst: 5
  });

  calculateInvoice();
}

function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
  ];

  if (num === 0) {
    return "Zero";
  }

  function convertBelowHundred(n) {
    if (n < 20) {
      return ones[n];
    }

    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function convertBelowThousand(n) {
    let word = "";

    if (n >= 100) {
      word += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }

    if (n > 0) {
      word += convertBelowHundred(n);
    }

    return word.trim();
  }

  let words = "";

  if (num >= 10000000) {
    words += convertBelowThousand(Math.floor(num / 10000000)) + " Crore ";
    num = num % 10000000;
  }

  if (num >= 100000) {
    words += convertBelowThousand(Math.floor(num / 100000)) + " Lakh ";
    num = num % 100000;
  }

  if (num >= 1000) {
    words += convertBelowThousand(Math.floor(num / 1000)) + " Thousand ";
    num = num % 1000;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.trim();
}