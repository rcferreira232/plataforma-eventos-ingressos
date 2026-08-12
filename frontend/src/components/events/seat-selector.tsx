"use client";

import { useState } from "react";
import { Ticket, Grid3X3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ReservationType = "pista" | "seat";

interface SeatSelectorProps {
  onSelectionChange: (selection: {
    type: ReservationType;
    quantity: number;
    seatCode?: string;
  }) => void;
  occupiedSeats?: string[];
  disabled?: boolean;
}

const ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;

export function SeatSelector({
  onSelectionChange,
  occupiedSeats = [],
  disabled = false,
}: SeatSelectorProps) {
  const [activeTab, setActiveTab] = useState<ReservationType>("pista");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleTabChange = (tab: ReservationType) => {
    setActiveTab(tab);
    if (tab === "pista") {
      onSelectionChange({ type: "pista", quantity });
    } else {
      onSelectionChange({
        type: "seat",
        quantity: 1,
        seatCode: selectedSeat || undefined,
      });
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, Math.min(10, newQty));
    setQuantity(validQty);
    onSelectionChange({ type: "pista", quantity: validQty });
  };

  const handleSelectSeat = (seatCode: string) => {
    if (occupiedSeats.includes(seatCode) || disabled) return;

    if (selectedSeat === seatCode) {
      setSelectedSeat(null);
      onSelectionChange({ type: "seat", quantity: 1, seatCode: undefined });
    } else {
      setSelectedSeat(seatCode);
      onSelectionChange({ type: "seat", quantity: 1, seatCode });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Abas de Seleção */}
      <div className='flex border-b border-border'>
        <button
          type='button'
          onClick={() => handleTabChange("pista")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "pista"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Ticket className='size-4' />
          Ingresso de Pista (Quantidade)
        </button>

        <button
          type='button'
          onClick={() => handleTabChange("seat")}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "seat"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid3X3 className='size-4' />
          Mapa de Assentos (Cadeira Marcar)
        </button>
      </div>

      {/* Conteúdo Aba Pista */}
      {activeTab === "pista" && (
        <div className='p-6 rounded-xl border border-border bg-card/60 space-y-4'>
          <label className='block text-sm font-medium text-foreground'>
            Selecione a quantidade de ingressos:
          </label>
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || disabled}
              className='size-10 text-lg font-bold'
            >
              -
            </Button>
            <span className='font-mono text-xl font-bold w-12 text-center text-foreground'>
              {quantity}
            </span>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10 || disabled}
              className='size-10 text-lg font-bold'
            >
              +
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            * Limite máximo de 10 ingressos por reserva de pista.
          </p>
        </div>
      )}

      {/* Conteúdo Aba Mapa de Assentos */}
      {activeTab === "seat" && (
        <div className='p-6 rounded-xl border border-border bg-card/60 space-y-6'>
          {/* Tela Simula Palco / Cinema */}
          <div className='w-full max-w-md mx-auto py-1.5 px-4 rounded-lg bg-primary/20 border border-primary/30 text-center'>
            <span className='text-xs font-semibold tracking-widest text-primary uppercase'>
              PALCO / TELA
            </span>
          </div>

          {/* Legenda de Legibilidade */}
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
              <span className='size-3.5 rounded bg-muted/60 border border-muted opacity-50 cursor-not-allowed' />
              <span className='text-muted-foreground'>Ocupado</span>
            </div>
          </div>

          {/* Grid de Assentos */}
          <div className='space-y-2 max-w-md mx-auto'>
            {ROWS.map((row) => (
              <div key={row} className='flex items-center justify-center gap-2'>
                <span className='w-6 font-mono text-xs font-bold text-muted-foreground text-center'>
                  {row}
                </span>
                <div className='flex items-center gap-1.5'>
                  {Array.from({ length: SEATS_PER_ROW }).map((_, index) => {
                    const seatNumber = index + 1;
                    const seatCode = `${row}-${seatNumber}`;
                    const isOccupied = occupiedSeats.includes(seatCode);
                    const isSelected = selectedSeat === seatCode;

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
                              ? "bg-muted/40 border-muted text-muted-foreground/40 cursor-not-allowed line-through"
                              : "bg-card border-border text-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {isSelected ? (
                          <Check className='size-3.5' />
                        ) : (
                          seatNumber
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Indicação do Assento Selecionado */}
          <div className='text-center'>
            {selectedSeat ? (
              <Badge variant='success' className='text-xs px-3 py-1 font-mono'>
                Assento selecionado: {selectedSeat}
              </Badge>
            ) : (
              <span className='text-xs text-muted-foreground italic'>
                Clique em uma cadeira disponível no mapa acima para escolher o
                assento.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
