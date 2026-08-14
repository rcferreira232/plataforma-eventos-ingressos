"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SeatSelectorProps {
  onSelectionChange: (selection: { seatCodes: string[] }) => void;
  occupiedSeats?: string[];
  capacity?: number;
  disabled?: boolean;
}

const SEATS_PER_ROW = 10;

function getRowName(rowIndex: number): string {
  let name = "";
  let index = rowIndex;

  while (index >= 0) {
    name = String.fromCharCode((index % 26) + 65) + name;
    index = Math.floor(index / 26) - 1;
  }

  return name;
}

export function SeatSelector({
  onSelectionChange,
  occupiedSeats = [],
  capacity = 50,
  disabled = false,
}: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const totalRows = Math.max(1, Math.ceil(capacity / SEATS_PER_ROW));
  const rows = Array.from({ length: totalRows }, (_, i) => getRowName(i));

  const handleSelectSeat = (seatCode: string) => {
    if (occupiedSeats.includes(seatCode) || disabled) return;

    let updated: string[];
    if (selectedSeats.includes(seatCode)) {
      updated = selectedSeats.filter((s) => s !== seatCode);
    } else {
      updated = [...selectedSeats, seatCode];
    }

    setSelectedSeats(updated);
    onSelectionChange({ seatCodes: updated });
  };

  let currentSeatIndex = 0;

  return (
    <div className='p-6 rounded-xl border border-border bg-card/60 space-y-6'>
      <div className='w-full max-w-md mx-auto py-1.5 px-4 rounded-lg bg-primary/20 border border-primary/30 text-center'>
        <span className='text-xs font-semibold tracking-widest text-primary uppercase'>
          PALCO / TELA
        </span>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-4 text-xs'>
        <div className='flex items-center gap-1.5'>
          <span className='size-3.5 rounded border border-border bg-card' />
          <span className='text-muted-foreground'>Disponível</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='size-3.5 rounded bg-primary border border-primary' />
          <span className='text-muted-foreground'>Selecionado</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='size-3.5 rounded bg-destructive/20 border border-destructive/50 text-destructive' />
          <span className='text-muted-foreground'>Ocupado</span>
        </div>
      </div>

      <div className='space-y-2 max-w-md mx-auto max-h-95 overflow-y-auto pr-1'>
        {rows.map((row) => (
          <div key={row} className='flex items-center justify-center gap-2'>
            <span className='w-8 font-mono text-xs font-bold text-muted-foreground text-center shrink-0'>
              {row}
            </span>
            <div className='flex items-center gap-1.5'>
              {Array.from({ length: SEATS_PER_ROW }).map((_, index) => {
                currentSeatIndex += 1;
                if (currentSeatIndex > capacity) {
                  return null;
                }

                const seatNumber = index + 1;
                const seatCode = `${row}-${seatNumber}`;
                const isOccupied = occupiedSeats.includes(seatCode);
                const isSelected = selectedSeats.includes(seatCode);

                return (
                  <button
                    key={seatCode}
                    type='button'
                    disabled={isOccupied || disabled}
                    onClick={() => handleSelectSeat(seatCode)}
                    title={
                      isOccupied
                        ? `Assento ${seatCode} (Ocupado)`
                        : `Assento ${seatCode}`
                    }
                    className={`size-8 text-xs font-mono font-semibold rounded-md border transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                        : isOccupied
                          ? "bg-destructive/15 border-destructive/40 text-destructive/70 cursor-not-allowed opacity-80"
                          : "bg-card border-border text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {isSelected ? <Check className='size-3.5' /> : seatNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className='text-center pt-2 border-t border-border/40'>
        {selectedSeats.length > 0 ? (
          <div className='flex flex-wrap items-center justify-center gap-1.5'>
            <span className='text-xs text-muted-foreground mr-1'>
              Assento(s) selecionado(s):
            </span>
            {selectedSeats.map((seat) => (
              <Badge
                key={seat}
                variant='success'
                className='text-xs px-2.5 py-0.5 font-mono'
              >
                {seat}
              </Badge>
            ))}
          </div>
        ) : (
          <span className='text-xs text-muted-foreground italic'>
            Clique em uma ou mais cadeiras disponíveis no mapa acima para
            escolher seus lugares.
          </span>
        )}
      </div>
    </div>
  );
}
