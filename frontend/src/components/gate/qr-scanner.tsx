"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QrScannerProps {
  onScanSuccess: (code: string) => void;
  disabled?: boolean;
}

export function QrScanner({ onScanSuccess, disabled = false }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const elementId = "qr-reader-view";

  const startScanner = async () => {
    if (isStarting || scannerRef.current?.isScanning) {
      return;
    }

    setIsStarting(true);
    setCameraError(null);

    try {
      const scanner = new Html5Qrcode(elementId);

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 220,
            height: 220,
          },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {},
      );

      setIsScanning(true);
    } catch (err: unknown) {
      scannerRef.current = null;
      setIsScanning(false);

      setCameraError(
        err instanceof Error
          ? err.message
          : "Não foi possível acessar a câmera. Certifique-se de conceder as permissões no navegador.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch {
      // O html5-qrcode pode lançar erro se o DOM
      // já tiver sido limpo durante o processo de parada.
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
      setIsStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (!scanner) {
        return;
      }

      const cleanup = async () => {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch {}

        try {
          await scanner.clear();
        } catch {}

        scannerRef.current = null;
      };

      void cleanup();
    };
  }, []);

  return (
    <div className='space-y-4 text-center'>
      <div
        id={elementId}
        className='w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-border bg-slate-900 min-h-65 relative shadow-inner'
      />

      {cameraError && (
        <div className='text-xs text-destructive flex items-center justify-center gap-1 max-w-sm mx-auto'>
          <AlertCircle className='size-3.5 shrink-0' />
          <span>{cameraError}</span>
        </div>
      )}

      {!isScanning && !isStarting && !cameraError && (
        <p className='text-xs text-muted-foreground'>
          Aponte o QR Code do bilhete para o leitor de câmera.
        </p>
      )}

      <Button
        type='button'
        variant={isScanning ? "destructive" : "default"}
        onClick={isScanning ? stopScanner : startScanner}
        disabled={disabled || isStarting}
        className='gap-2'
      >
        {isScanning ? (
          <>
            <CameraOff className='size-4' />
            Desativar Câmera
          </>
        ) : isStarting ? (
          <>
            <LoadingSpinner size='sm' />
            Ativando câmera...
          </>
        ) : (
          <>
            <Camera className='size-4' />
            Ativar Câmera de Leitura
          </>
        )}
      </Button>
    </div>
  );
}
