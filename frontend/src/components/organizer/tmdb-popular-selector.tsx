"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, Film, Check, RefreshCw } from "lucide-react";
import { getPopularMovies } from "@/services/events.service";
import { TMDBMovie } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";

interface TmdbPopularSelectorProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  selectedMovieId?: string | number | null;
}

export function TmdbPopularSelector({
  onSelectMovie,
  selectedMovieId,
}: TmdbPopularSelectorProps) {
  const page = 1;

  const {
    data: movies,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tmdbPopularMovies", page],
    queryFn: () => getPopularMovies(page),
  });

  return (
    <div className='space-y-4 border border-border/80 rounded-xl p-4 bg-card/50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Film className='size-5 text-primary' />
          <h3 className='font-semibold text-lg'>
            Catálogo TMDB - Filmes Populares
          </h3>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isLoading}
            className='gap-1.5 text-xs'
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>
      <p className='text-xs text-muted-foreground'>
        Selecione um filme do TMDB para preencher automaticamente o título e
        obter capa, sinopse e nota.
      </p>

      {isLoading ? (
        <div className='py-12 flex flex-col items-center justify-center gap-3'>
          <LoadingSpinner size='lg' />
          <span className='text-sm text-muted-foreground'>
            Carregando catálogo TMDB...
          </span>
        </div>
      ) : isError ? (
        <div className='p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center'>
          Não foi possível carregar os filmes do TMDB. Verifique a configuração
          da chave de API.
        </div>
      ) : !movies || movies.length === 0 ? (
        <div className='p-4 text-sm text-muted-foreground text-center'>
          Nenhum filme popular encontrado.
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-105 overflow-y-auto pr-1'>
          {movies.map((movie) => {
            const isSelected = String(movie.id) === String(selectedMovieId);
            const posterUrl = movie.posterPath
              ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
              : "/placeholder-poster.png";

            return (
              <Card
                key={movie.id}
                className={`overflow-hidden flex flex-col transition-all border ${
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                <div className='relative h-44 w-full bg-muted overflow-hidden'>
                  {movie.posterPath ? (
                    <Image
                      src={posterUrl}
                      alt={movie.title}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-secondary text-muted-foreground text-xs'>
                      Sem Capa
                    </div>
                  )}
                  <div className='absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 text-xs font-bold flex items-center gap-1'>
                    <Star className='size-3 fill-amber-400' />
                    {movie.voteAverage ? movie.voteAverage.toFixed(1) : "N/A"}
                  </div>
                </div>

                <div className='p-3 flex-1 flex flex-col justify-between space-y-2'>
                  <div>
                    <h4 className='font-semibold text-sm line-clamp-1'>
                      {movie.title}
                    </h4>
                    <p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                      {movie.overview || "Sem sinopse disponível."}
                    </p>
                  </div>

                  <Button
                    type='button'
                    size='sm'
                    variant={isSelected ? "default" : "secondary"}
                    className='w-full mt-2 gap-1.5 text-xs'
                    onClick={() => onSelectMovie(movie)}
                  >
                    {isSelected ? (
                      <>
                        <Check className='size-3.5' />
                        Filme Selecionado
                      </>
                    ) : (
                      "Selecionar Filme"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
