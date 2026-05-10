# Automação de Ar-Condicionado Inteligente (IoT) ❄️📱

## 📖 Sobre o Projeto
Projeto universitário de automação focado no controle de aparelhos de ar-condicionado via interface web. O sistema utiliza um microcontrolador ESP32 para se comunicar com um broker MQTT, ler dados do ambiente (temperatura, umidade e presença) e enviar sinais infravermelhos (IR) para os aparelhos de ar-condicionado (com foco nos modelos da Carrier/Coolix).

## 🛠️ Componentes e Tecnologias
**Hardware:**
* Microcontrolador: ESP32
* Sensores: DHT11 (Temperatura e Umidade) e PIR (Movimento/Presença)
* Atuador: Emissor Infravermelho (IR LED)

**Software & Protocolos:**
* Linguagem Embarcada: C++ (Arduino IDE)
* Bibliotecas: PubSubClient, IRremoteESP8266, DHT Sensor Library
* Front-end: React + TypeScript + Tailwind CSS
* Comunicação: Protocolo MQTT (via HiveMQ Público)

## ⚡ Funcionalidades
* **Monitoramento em Tempo Real:** Leitura constante de temperatura e umidade da sala.
* **Detecção de Presença:** Informa se a sala está ocupada ou vazia através do sensor PIR.
* **Controle Remoto Web:** Botões de acionamento para presets de temperatura (18°C, 20°C, 22°C, 24°C) e desligamento do ar-condicionado diretamente pelo navegador.

## 📅 Linha do Tempo de Desenvolvimento
1. Definição do tema.
2. Elaboração do pseudocódigo e discussão das funções que o projeto teria.
3. Pesquisa sobre componentes.
4. Montagem do hardware.
5. Elaboração do código para mapear o controle do ar-condicionado de casa.
6. Elaboração do código com os arrays para serem enviados pelo led IR (ar de casa).