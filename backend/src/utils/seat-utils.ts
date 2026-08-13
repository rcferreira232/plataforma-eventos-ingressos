export function getRowName(rowIndex: number): string {
  let name = "";
  let index = rowIndex;

  while (index >= 0) {
    name = String.fromCharCode((index % 26) + 65) + name;
    index = Math.floor(index / 26) - 1;
  }

  return name;
}

export function getRowIndex(rowName: string): number {
  let index = 0;
  const upper = rowName.toUpperCase();
  for (let i = 0; i < upper.length; i += 1) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

export const SEATS_PER_ROW = 10;

export function isSeatWithinCapacity(
  seatCode: string,
  capacity: number,
): boolean {
  const match = seatCode.trim().match(/^([A-Z]+)-(\d+)$/);

  if (!match) {
    return false;
  }

  const rowName = match[1];
  const seatStr = match[2];
  if (!rowName || !seatStr) {
    return false;
  }

  const seatNumber = parseInt(seatStr, 10);

  if (seatNumber < 1 || seatNumber > SEATS_PER_ROW) {
    return false;
  }

  const rowIndex = getRowIndex(rowName);
  if (rowIndex < 0) {
    return false;
  }

  const absoluteSeatIndex = rowIndex * SEATS_PER_ROW + seatNumber;
  return absoluteSeatIndex >= 1 && absoluteSeatIndex <= capacity;
}
