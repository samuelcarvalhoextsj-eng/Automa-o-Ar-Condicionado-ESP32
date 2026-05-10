import { useState, useEffect, useRef } from 'react';
import { Thermometer, Droplets, Radio, Power, User } from 'lucide-react';
// @ts-ignore
import Paho from 'paho-mqtt';

export default function App() {
  // --- 1. ESTADOS VISUAIS (Originais) ---
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [selectedTemp, setSelectedTemp] = useState<number | null>(null);
  
  // --- 2. ESTADOS DOS SENSORES (Agora dinâmicos para receber do MQTT) ---
  const [currentTemp, setCurrentTemp] = useState('23.5');
  const [humidity, setHumidity] = useState('45');
  const [presence, setPresence] = useState('Vazio');
  
  // --- 3. ESTADOS DE CONEXÃO ---
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<any>(null);

  const tempPresets = [
    { temp: 18, label: 'Turbo', sublabel: 'Congelar' },
    { temp: 20, label: 'Frio', sublabel: '' },
    { temp: 22, label: 'Conforto', sublabel: '' },
    { temp: 24, label: 'Econômico', sublabel: '' }
  ];

  // --- 4. MOTOR DO MQTT (Conexão e Leitura - ATUALIZADO PARA HIVEMQ) ---
  useEffect(() => {
    const broker = "broker.hivemq.com"; // <-- Servidor alterado
    const porta = 8000;                 // <-- Porta alterada para 8000
    const idCliente = "FigmaApp-" + Math.random().toString(16).substring(2, 10);

    const client = new Paho.Client(broker, porta, idCliente);
    clientRef.current = client;

    client.onConnectionLost = (responseObject: any) => {
      setIsConnected(false);
      console.log("Conexão perdida:", responseObject.errorMessage);
    };

    client.onMessageArrived = (message: any) => {
      const topico = message.destinationName;
      const valor = message.payloadString;

      if (topico === "sala/sensores/temperatura") setCurrentTemp(valor);
      else if (topico === "sala/sensores/umidade") setHumidity(valor);
      else if (topico === "sala/sensores/presenca") setPresence(valor);
    };

    client.connect({
      useSSL: false, // <-- SSL desativado para a porta 8000 funcionar
      onSuccess: () => {
        setIsConnected(true);
        client.subscribe("sala/sensores/temperatura");
        client.subscribe("sala/sensores/umidade");
        client.subscribe("sala/sensores/presenca");
        console.log("Conectado ao HiveMQ com sucesso!");
      },
      onFailure: (erro: any) => {
        console.log("Falha ao conectar no HiveMQ:", erro.errorMessage);
      }
    });

    return () => {
      if (client.isConnected()) client.disconnect();
    };
  }, []);

  // --- 5. FUNÇÃO DE DISPARO PARA O ESP32 ---
  const enviarComando = (comando: string) => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message(comando);
      message.destinationName = "sala/ar/comando";
      clientRef.current.send(message);
      console.log("Enviado:", comando);
    }
  };

  // --- 6. LOGICA DOS BOTÕES ---
  const handlePowerClick = () => {
    const novoEstado = !isPowerOn;
    setIsPowerOn(novoEstado);
    
    if (!novoEstado) {
      // Se estiver desligando
      enviarComando('DESLIGAR');
      setSelectedTemp(null); // Reseta a cor do botão de temperatura
    }
  };

  const handlePresetClick = (temp: number) => {
    setSelectedTemp(temp);
    enviarComando(`LIGAR_${temp}`);
  };

  return (
    <div className="size-full flex items-center justify-center bg-zinc-950">
      {/* Mobile Frame Container */}
      <div className="w-[390px] h-[844px] bg-gradient-to-br from-zinc-900 to-black overflow-y-auto relative">
        
        {/* Indicador de Conexão (Pequena bolinha ao lado do título) */}
        <div className="absolute top-4 left-0 w-full flex justify-center">
          <span className={`text-[10px] uppercase tracking-widest ${isConnected ? 'text-cyan-500' : 'text-red-500 animate-pulse'}`}>
            {isConnected ? '• Conectado' : '• Desconectado'}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6">
          <h1 className="text-2xl font-bold text-white">Controle do Ar</h1>
          <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <User className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Sensor Dashboard */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-3 gap-3">
            {/* Temperature Card */}
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-4 border border-zinc-700/50">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentTemp}°C</div>
                <div className="text-xs text-zinc-400 mt-1">Temp</div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-4 border border-zinc-700/50">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-white">{humidity}%</div>
                <div className="text-xs text-zinc-400 mt-1">Umidade</div>
              </div>
            </div>

            {/* Presence Card */}
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-4 border border-zinc-700/50">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                  <Radio className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm font-bold text-white">{presence}</div>
                <div className="text-xs text-zinc-400 mt-1">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Power Control */}
        <div className="flex flex-col items-center mb-10">
          <button
            onClick={handlePowerClick}
            className={`
              w-36 h-36 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-2xl
              ${isPowerOn
                ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/50'
                : 'bg-zinc-800 shadow-zinc-900/50'}
            `}
          >
            <Power
              className={`w-16 h-16 transition-colors ${isPowerOn ? 'text-white' : 'text-zinc-500'}`}
            />
          </button>
          <div className="mt-4 text-sm font-medium text-zinc-400">
            {isPowerOn ? 'Sistema Ligado' : 'Sistema Desligado'}
          </div>
        </div>

        {/* Temperature Presets */}
        <div className="px-6">
          <h2 className="text-lg font-semibold text-white mb-4">Predefinições</h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {tempPresets.map((preset) => (
              <button
                key={preset.temp}
                onClick={() => handlePresetClick(preset.temp)}
                disabled={!isPowerOn}
                className={`
                  h-24 rounded-2xl p-4 flex flex-col items-center justify-center
                  transition-all duration-200 border
                  ${!isPowerOn
                    ? 'bg-zinc-800/30 border-zinc-700/30 opacity-40 cursor-not-allowed'
                    : selectedTemp === preset.temp
                      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-zinc-800/50 border-zinc-700/50 hover:border-cyan-500/50 hover:bg-zinc-800'
                  }
                `}
              >
                <div className={`text-3xl font-bold ${
                  isPowerOn && selectedTemp === preset.temp ? 'text-white' : 'text-cyan-400'
                }`}>
                  {preset.temp}°C
                </div>
                <div className={`text-xs mt-1 ${
                  isPowerOn && selectedTemp === preset.temp ? 'text-cyan-50' : 'text-zinc-400'
                }`}>
                  {preset.label}
                </div>
                {preset.sublabel && (
                  <div className={`text-xs ${
                    isPowerOn && selectedTemp === preset.temp ? 'text-cyan-100' : 'text-zinc-500'
                  }`}>
                    {preset.sublabel}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}