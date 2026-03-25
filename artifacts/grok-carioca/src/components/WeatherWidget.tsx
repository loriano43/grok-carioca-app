import { Cloud, Sun, CloudRain, Wind, Loader2 } from "lucide-react";
import { useGetRioWeather } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function WeatherWidget({ className }: { className?: string }) {
  const { data, isLoading, isError } = useGetRioWeather({
    query: {
      refetchInterval: 1000 * 60 * 30, // refetch every 30 mins
      retry: 2
    }
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 px-4 py-2 bg-card/40 backdrop-blur-md rounded-full border border-border/50 shadow-sm", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Olhando o céu...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={cn("flex items-center gap-2 px-4 py-2 bg-card/40 backdrop-blur-md rounded-full border border-border/50 shadow-sm", className)}>
        <Cloud className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Tempo off</span>
      </div>
    );
  }

  // Simple icon mapper based on basic weather codes or description
  const renderIcon = () => {
    const desc = data.description.toLowerCase();
    if (desc.includes('chuva') || desc.includes('rain')) return <CloudRain className="w-5 h-5 text-accent" />;
    if (desc.includes('nuvem') || desc.includes('cloud')) return <Cloud className="w-5 h-5 text-muted-foreground" />;
    if (desc.includes('vento') || desc.includes('wind')) return <Wind className="w-5 h-5 text-accent" />;
    return <Sun className="w-5 h-5 text-secondary" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-lg rounded-full border border-border/50 shadow-sm", 
        className
      )}
    >
      <div className="flex items-center justify-center">
        {data.icon ? <span className="text-xl leading-none mr-1">{data.icon}</span> : renderIcon()}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-tight">
          {Math.round(data.temperature)}°C <span className="text-xs font-normal text-muted-foreground">Rio</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-tight line-clamp-1 max-w-[100px] truncate">
          {data.description}
        </span>
      </div>
    </motion.div>
  );
}
