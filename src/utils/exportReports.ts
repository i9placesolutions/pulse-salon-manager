
import { Product, StockMovement } from "@/types/stock";

export function exportProductsToCSV(products: Product[]) {
  const headers = [
    "ID",
    "Nome",
    "Descrição",
    "Categoria",
    "Quantidade",
    "Preço de Compra",
    "Preço de Venda",
    "Estoque Mínimo",
  ];

  const rows = products.map((product) => [
    product.id,
    product.name,
    product.description,
    product.category,
    product.quantity,
    product.purchasePrice,
    product.salePrice,
    product.minQuantity,
  ]);

  return generateCSV(headers, rows);
}

export function exportMovementsToCSV(movements: StockMovement[]) {
  const headers = [
    "ID",
    "Produto ID",
    "Tipo",
    "Quantidade",
    "Data",
    "Motivo",
    "Responsável",
    "Nota Fiscal",
  ];

  const rows = movements.map((movement) => [
    movement.id,
    movement.productId,
    movement.type,
    movement.quantity,
    movement.date,
    movement.reason || "",
    movement.responsibleId || "",
    movement.invoiceNumber || "",
  ]);

  return generateCSV(headers, rows);
}

function generateCSV(headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", "relatorio.csv");
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
