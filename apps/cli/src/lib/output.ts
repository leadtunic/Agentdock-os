import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";

export function printTable(headers: string[], rows: string[][]): void {
  const table = new Table({ head: headers.map((h) => chalk.bold(h)) });
  rows.forEach((row) => table.push(row));
  console.log(table.toString());
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function printError(message: string): void {
  console.error(chalk.red(`✗ ${message}`));
}

export function printInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

export function printWarning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

export function spinner(text: string) {
  return ora(text);
}
