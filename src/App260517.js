import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Mic, Square, Download, Settings, X } from 'lucide-react';

// 🎨 글로벌 해상도 락 스타일시트
const BOX_STYLE = {
  container: { backgroundColor: '#050a14', width: '1920px', height: '1080px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' },
  contentWrapper: { width: '1080px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  routeBtn: { padding: '10px 24px', borderRadius: '12px', border: '1px solid #374151', fontSize: '15px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.15s ease-in-out', display: 'flex', alignItems: 'center', gap: '6px' },
  selectBox: { background: '#1e293b', color: '#60a5fa', border: '2px solid #334155', borderRadius: '14px', padding: '8px 20px', fontSize: '20px', fontWeight: '900', outline: 'none' },
  micBtn: { padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' },
  settingsBtn: { backgroundColor: '#1f2937', color: 'white', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' },
  gridContainer: { display: 'flex', gap: '8px', padding: '10px 0', width: '100%', justifyContent: 'space-between', marginBottom: '25px', boxSizing: 'border-box' },
  holeNumber: { width: '90px', height: '60px', border: '2px solid #475569', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '26px', color: '#94a3b8', backgroundColor: '#1e293b', margin: '8px 0', userSelect: 'none' }
};

const DASHBOARD_STYLE = {
  inlineDashboard: { width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '55px', backgroundColor: '#111827', padding: '16px', borderRadius: '24px', border: '1px solid #374151', boxSizing: 'border-box' },
  controlBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1f2937', padding: '12px 18px', borderRadius: '18px', border: '1px solid #374151', minWidth: 0, boxSizing: 'border-box', width: '100%', height: '70px' },
  playBtn: { border: 'none', backgroundColor: '#22c55e', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '3px' }
};

const MODAL_STYLE = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#111827', width: '480px', borderRadius: '24px', padding: '35px', border: '1px solid #374151', color: 'white' },
  saveBtn: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#10b981', color: 'black', fontWeight: '900', fontSize: '18px', cursor: 'pointer', marginTop: '12px' }
};

// 🎯 [도면 100% 동기화 데이터셋] 8번 홀 bottom(F), 10번 홀 draw(A) 구조 완벽 매핑
const HARP_LAYOUT = {
  holes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  blow: [0, 4, 7, 12, 16, 19, 24, 28, 31, 36],       // C4, E4, G4, C5, E5, G5, C6, E6, G6, C7
  draw: [2, 7, 11, 14, 17, 21, 23, 26, 29, 33],      // D4, G4, B4, D5, F5, A5, B5, D6, F6, A6 (10번 Draw A6 일치 완결)
  topSpecial: [3, 8, 12, 15, 18, 22, null, 27, 30, 35], 
  bottomSpecials: [
    [1],                   // 1번 홀: 파랑 Db4 (1칸)
    [6, 5],                // 2번 홀: 파랑 Gb4 -> F4 (2칸)
    [10, 9, 8],            // 3번 홀: 파랑 Bb4 -> A4 -> Ab4 (3칸)
    [13],                  // 4번 홀: 파랑 Db5 (1칸)
    [],                    // 5번 홀: 완벽 빈 공간 유지
    [20],                  // 6번 홀: 파랑 Ab5 (1칸)
    [25],                  // 7번 홀: 주황 Db6 (1칸)
    [29],                  // 8번 홀: 주황 F6 (1칸 - 이미지 도면 동기화)
    [32],                  // 9번 홀: 주황 Ab6 (1칸)
    [37]                   // 10번 홀: 주황 Db7 (1칸)
  ]
};

const standardKeys = {
  'C': { semi: 0, oct: 4 }, 'Db': { semi: 1, oct: 4 }, 'D': { semi: 2, oct: 4 },
  'Eb': { semi: 3, oct: 4 }, 'E': { semi: 4, oct: 4 }, 'F': { semi: 5, oct: 4 },
  'Gb': { semi: 6, oct: 4 }, 'G': { semi: 7, oct: 3 }, 'Ab': { semi: 8, oct: 3 },
  'A': { semi: 9, oct: 3 }, 'Bb': { semi: 10, oct: 3 }, 'B': { semi: 11, oct: 3 },
  'High G': { semi: 7, oct: 4 }
};

const lowKeys = {
  'LC': { semi: 0, oct: 3 }, 'LDb': { semi: 1, oct: 3 }, 'LD': { semi: 2, oct: 3 },
  'LEb': { semi: 3, oct: 3 }, 'LE': { semi: 4, oct: 3 }, 'LF': { semi: 5, oct: 3 },
  'LGb': { semi: 6, oct: 2 }, 'LG': { semi: 7, oct: 2 }, 'LAb': { semi: 8, oct: 2 },
  'LA': { semi: 9, oct: 2 }, 'LBb': { semi: 10, oct: 2 }, 'LB': { semi: 11, oct: 2 },
  'LLF': { semi: 5, oct: 2 }
};

const keysCircleData = [
  { major: "C",  minor: "Am",  angle: 0,    idx: 0,  displaySig: "0",   type: "none" },
  { major: "G",  minor: "Em",  angle: 30,   idx: 1,  displaySig: "♯1",  type: "sharp" },
  { major: "D",  minor: "Bm",  angle: 60,   idx: 2,  displaySig: "♯2",  type: "sharp" },
  { major: "A",  minor: "F#m", angle: 90,   idx: 3,  displaySig: "♯3",  type: "sharp" },
  { major: "E",  minor: "C#m", angle: 120,  idx: 4,  displaySig: "♯4",  type: "sharp" },
  { major: "B",  minor: "G#m", angle: 150,  idx: 5,  displaySig: "♯5",  type: "sharp" },
  { major: "F#", minor: "D#m", angle: 180,  idx: 6,  displaySig: "♯6",  type: "sharp" },
  { major: "Db", minor: "Bbm", angle: 210,  idx: 7,  displaySig: "♭5",  type: "flat" },
  { major: "Ab", minor: "Fm",  angle: 240,  idx: 8,  displaySig: "♭4",  type: "flat" },
  { major: "Eb", minor: "Cm",  angle: 270,  idx: 9,  displaySig: "♭3",  type: "flat" },
  { major: "Bb", minor: "Gm",  angle: 300,  idx: 10, displaySig: "♭2",  type: "flat" },
  { major: "F",  minor: "Dm",  angle: 330,  idx: 11, displaySig: "♭1",  type: "flat" }
];

const romanDegrees = [
  { angle: 0,    text: "I" }, { angle: 30,   text: "V" }, { angle: 60,   text: "IIm" },
  { angle: 90,   text: "VIm" }, { angle: 120,  text: "IIIm" }, { angle: 150,  text: "VIIdim7" },
  { angle: 330,  text: "IV" }
];

const fixedPositionLabels = [
  { text: "1st",  harmonicaAngle: 0,   songAngle: 0 },
  { text: "2nd",  harmonicaAngle: 30,  songAngle: 330 },
  { text: "3rd",  harmonicaAngle: 60,  songAngle: 300 },
  { text: "4th",  harmonicaAngle: 90,  songAngle: 270 },
  { text: "5th",  harmonicaAngle: 120, songAngle: 240 },
  { text: "12th", harmonicaAngle: 330, songAngle: 30 }
];
function HarmonicaRoom({ showOverbanding, setShowOverbanding, onRouteClick }) {
  const [currentKey, setCurrentKey] = useState('C');
  const [isLowKey, setIsLowKey] = useState(false);
  const [baseFreq, setBaseFreq] = useState(440);
  
  const [activeNote, setActiveNote] = useState(null);
  const [activeAbsoluteSemi, setActiveAbsoluteSemi] = useState(null); 
  const [centsOff, setCentsOff] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [tolerance, setTolerance] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState("No file");

  const [mrVolume, setMrVolume] = useState(0.8);
  const [micVolume, setMicVolume] = useState(0.8);
  const [synthVolume, setSynthVolume] = useState(0.5);
  const [useReverb, setUseReverb] = useState(true);

  const audioCtxRef = useRef(null);
  const mixedBus = useRef(null);
  
  // 🎯 [믹스 녹음용 고이득 라우팅 노드 정비]
  const recordDestNode = useRef(null); 
  const mrGainNode = useRef(null);
  const micGainNode = useRef(null);
  const synthGainNode = useRef(null);
  
  // 🎯 [풍부한 잔향용 습도 조절 게인 브릿지 완결]
  const reverbWetGainNode = useRef(null); 
  const analyser = useRef(null);
  const micInput = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordedPlaying, setIsRecordedPlaying] = useState(false);

  const activeOscillators = useRef({});
  const clickedCellKey = useRef(null); 
  const audioPlaybackRef = useRef(null);
  const mrSourceRef = useRef(null);
  const mrBufferRef = useRef(null);
  const isListeningRef = useRef(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (mrGainNode.current) mrGainNode.current.gain.value = mrVolume;
  }, [mrVolume]);

  useEffect(() => {
    if (micGainNode.current) micGainNode.current.gain.value = micVolume * 1.5; // 하모니카 기본 입력 레벨 150% 부스팅
  }, [micVolume]);

  useEffect(() => {
    if (reverbWetGainNode.current && audioCtxRef.current) {
      reverbWetGainNode.current.gain.setValueAtTime(useReverb ? 0.75 : 0.0, audioCtxRef.current.currentTime);
    }
  }, [useReverb]);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    mixedBus.current = ctx.createGain();
    mixedBus.current.connect(ctx.destination);

    // 녹음 전용 가상 믹싱 버스 바인딩
    recordDestNode.current = ctx.createMediaStreamDestination();

    mrGainNode.current = ctx.createGain();
    mrGainNode.current.gain.value = mrVolume;
    mrGainNode.current.connect(mixedBus.current);
    mrGainNode.current.connect(recordDestNode.current); // 반주 신호 녹음 전송

    micGainNode.current = ctx.createGain();
    micGainNode.current.gain.value = micVolume * 1.5; 
    micGainNode.current.connect(mixedBus.current);
    
    // 🎯 [녹음 소리 크기 버그 해결] 마이크 녹음 수집 음량을 250% 고이득 증폭하여 녹음 버스에 다이렉트 도킹
    const micRecordBooster = ctx.createGain();
    micRecordBooster.gain.value = 2.5; 
    micGainNode.current.connect(micRecordBooster);
    micRecordBooster.connect(recordDestNode.current);

    // 🎯 [콘서트홀 이펙터 아키텍처 개조] 잔향이 살아나도록 Wet 통제 및 상향 딜레이 배치 완결
    reverbWetGainNode.current = ctx.createGain();
    reverbWetGainNode.current.gain.value = useReverb ? 0.75 : 0.0;

    const delayA = ctx.createDelay(); delayA.delayTime.value = 0.20;
    const delayB = ctx.createDelay(); delayB.delayTime.value = 0.28;
    const feedbackA = ctx.createGain(); feedbackA.gain.value = 0.45; // 잔향 지속도 상승
    const feedbackB = ctx.createGain(); feedbackB.gain.value = 0.35;
    
    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.value = 3200; 

    micGainNode.current.connect(delayA);
    micGainNode.current.connect(delayB);

    delayA.connect(feedbackA);
    feedbackA.connect(reverbFilter);
    reverbFilter.connect(delayB); 

    delayB.connect(feedbackB);
    feedbackB.connect(reverbWetGainNode.current);

    reverbWetGainNode.current.connect(mixedBus.current);
    reverbWetGainNode.current.connect(recordDestNode.current); // 풍부한 리버브 잔향까지 함께 안전하게 녹음 고정

    synthGainNode.current = ctx.createGain();
    synthGainNode.current.gain.value = 1.0; 
    synthGainNode.current.connect(mixedBus.current);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // 🎯 [옥타브 분리 추적 교정] 절대 주파수 산출을 위해 하프 기준값을 포함한 미디 원형 코드 리턴 장치 이식
  const getAbsoluteSemiTone = (semi) => {
    if (semi === null) return null;
    const keyData = isLowKey ? (lowKeys[currentKey] || { semi: 0, oct: 4 }) : (standardKeys[currentKey] || { semi: 0, oct: 4 });
    return semi + keyData.semi + (keyData.oct * 12);
  };

  const getNoteName = (semi) => {
    if (semi === null) return null;
    const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const absSemi = getAbsoluteSemiTone(semi);
    return names[((absSemi % 12) + 12) % 12];
  };

  const getNoteFreq = (semi) => {
    const absSemi = getAbsoluteSemiTone(semi);
    return baseFreq * Math.pow(2, (absSemi - 69) / 12);
  };

  const handleNoteStart = async (semi, boxKey) => {
    if (semi === null) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      if (activeOscillators.current[boxKey]) {
        try { activeOscillators.current[boxKey].osc.stop(); } catch(e){}
        activeOscillators.current[boxKey] = null;
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(getNoteFreq(semi), ctx.currentTime);
      gainNode.gain.setValueAtTime(synthVolume * 1.0, ctx.currentTime); 
      
      osc.connect(gainNode);
      gainNode.connect(synthGainNode.current);
      
      osc.start();
      activeOscillators.current[boxKey] = { osc, gainNode };
      
      clickedCellKey.current = boxKey;
      setActiveAbsoluteSemi(getAbsoluteSemiTone(semi));
      setActiveNote(getNoteName(semi));
      setCentsOff(0); 
    } catch (e) {}
  };

  const handleNoteStop = (boxKey) => {
    if (activeOscillators.current[boxKey]) {
      try {
        activeOscillators.current[boxKey].osc.stop();
        activeOscillators.current[boxKey].osc.disconnect();
        activeOscillators.current[boxKey].gainNode.disconnect();
      } catch(e) {}
      delete activeOscillators.current[boxKey];
    }
    if (clickedCellKey.current === boxKey) {
      clickedCellKey.current = null;
      if (!isListeningRef.current) {
        setActiveNote(null);
        setActiveAbsoluteSemi(null);
      }
    }
  };

  function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / SIZE) < 0.012) return -1;

    let yinBuffer = new Float32Array(SIZE / 2);
    for (let tau = 0; tau < SIZE / 2; tau++) {
      for (let i = 0; i < SIZE / 2; i++) {
        let delta = buf[i] - buf[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }

    let runningSum = 0;
    for (let tau = 1; tau < SIZE / 2; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / (runningSum || 1);
    }

    let threshold = 0.15, tauFound = -1;
    for (let tau = 1; tau < SIZE / 2; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < SIZE / 2 && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        tauFound = tau;
        break;
      }
    }

    if (tauFound === -1) return -1;
    return sampleRate / tauFound;
  }

  // 🎯 [마이크 자동 녹음 버그 전면 해결] startMic 내부에서 리코더를 강제 실행하던 구문을 완벽히 적출 제거했습니다.
  const startMic = async () => {
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micInput.current = stream;
      
      const source = ctx.createMediaStreamSource(stream);
      
      const highPassFilter = ctx.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 85; // 노이즈 및 초저음 컷오프

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-22, ctx.currentTime);
      compressor.knee.setValueAtTime(25, ctx.currentTime);
      compressor.ratio.setValueAtTime(10, ctx.currentTime);
      compressor.attack.setValueAtTime(0.004, ctx.currentTime);
      compressor.release.setValueAtTime(0.20, ctx.currentTime);

      analyser.current = ctx.createAnalyser();
      analyser.current.fftSize = 2048;
      
      source.connect(highPassFilter);
      highPassFilter.connect(compressor);
      compressor.connect(analyser.current);
      
      // 🎯 실시간 마이크 유입 신호를 공간 이펙터 파이프 가상 입력 노드에 전격 브릿징
      compressor.connect(micGainNode.current);

      setIsListening(true);
      isListeningRef.current = true;
      
      const updateLoop = () => {
        if (!analyser.current || !isListeningRef.current) return;
        const buf = new Float32Array(2048);
        analyser.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, ctx.sampleRate);
        if (freq !== -1 && freq >= 50 && freq <= 3200) {
          const n = 12 * Math.log2(freq / baseFreq) + 69;
          const roundedN = Math.round(n);
          
          const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
          setActiveNote(names[roundedN % 12]);
          
          if (!clickedCellKey.current) {
            // 🎯 [1:1 단독 격리 튜너 핵심 매핑] 자판의 C4와 C5 구별을 위해 절대 세미톤 미디 번호(roundedN)를 다이렉트로 주입
            setActiveAbsoluteSemi(roundedN);
            setCentsOff(Math.floor((n - roundedN) * 100));
          }
        } else {
          if (!clickedCellKey.current) {
            setActiveNote(null);
            setActiveAbsoluteSemi(null);
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      };
      updateLoop();
    } catch (err) { alert("Mic access denied or HTTPS security issue."); }
  };

  const stopMic = () => {
    cancelAnimationFrame(animationFrameRef.current);
    if (micInput.current) {
      micInput.current.getTracks().forEach(track => track.stop());
      micInput.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    setActiveNote(null);
    setActiveAbsoluteSemi(null);
    // 마이크 정지 시 작동 중인 녹음이 있다면 함께 안전 마감 마감
    if (isRecording) stopRecordingSession();
  };

  // 🎯 [기능 격리 완결] REC 버튼을 누를 때만 가상 반주 가상 믹싱 버스로부터 안전하게 추출 레코딩
  const startRecordingSession = () => {
    if (!audioCtxRef.current || !recordDestNode.current) return alert("Initialize audio layer first!");
    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(recordDestNode.current.stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch(e) { alert("Recording system initialization failed."); }
  };

  const stopRecordingSession = () => {
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch(e){}
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files;
      setFileName(file.name);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const ctx = audioCtxRef.current;
        ctx.decodeAudioData(arrayBuffer, (buffer) => {
          mrBufferRef.current = buffer;
        });
      } catch (err) { alert("Error parsing audio file."); }
    }
  };

  const toggleTrack = async () => {
    if (!mrBufferRef.current) return alert("Upload MR file first!");
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    if (isPlaying) {
      if (mrSourceRef.current) {
        try { mrSourceRef.current.stop(); } catch(e){}
        mrSourceRef.current.disconnect();
        mrSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const source = ctx.createBufferSource();
      source.buffer = mrBufferRef.current;
      source.connect(mrGainNode.current);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      mrSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  const toggleRecordedPlayback = () => {
    if (!audioPlaybackRef.current) return;
    if (isRecordedPlaying) { audioPlaybackRef.current.pause(); setIsRecordedPlaying(false); }
    else { audioPlaybackRef.current.play(); setIsRecordedPlaying(true); }
  };
  return (
    <div style={BOX_STYLE.contentWrapper}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '25px', boxSizing: 'border-box' }}>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={onRouteClick} style={{ ...BOX_STYLE.routeBtn, backgroundColor: '#1f2937', color: 'white' }}>Circle of Fifths</button>
        </div>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#94a3b8' }}>Harp Key</span>
          <select style={BOX_STYLE.selectBox} value={currentKey} onChange={(e) => setCurrentKey(e.target.value)}>
            {!isLowKey ? Object.keys(standardKeys).map(k => <option key={k} value={k}>{k}</option>) : Object.keys(lowKeys).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
          <button onClick={isListening ? stopMic : startMic} style={{...BOX_STYLE.micBtn, backgroundColor: isListening ? '#ef4444' : '#2563eb', padding: '12px 35px', width: '190px', justifyContent: 'center'}}>
            <Mic size={22} /> {isListening ? 'MIC ACTIVE' : 'START MIC'}
          </button>
        </div>
        <div style={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowSettings(true)} style={BOX_STYLE.settingsBtn}><Settings size={22} /> Settings</button>
        </div>
      </div>

      <div style={BOX_STYLE.gridContainer}>
        {HARP_LAYOUT.holes.map((h, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {h === 10 ? <NoteBox semi={46} getNote={getNoteName} getAbsSemi={getAbsoluteSemiTone} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isTopBb={true} showOverbanding={showOverbanding} boxKey={`top-bb-${i}`} clickedCellKey={clickedCellKey} /> : <div style={{ height: '90px', width: '90px', margin: '3px 0' }}></div>}
            <NoteBox semi={HARP_LAYOUT.topSpecial[i]} getNote={getNoteName} getAbsSemi={getAbsoluteSemiTone} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isBlowZone={true} holeNum={h} showOverbanding={showOverbanding} boxKey={`top-spec-${i}`} clickedCellKey={clickedCellKey} />
            <NoteBox semi={HARP_LAYOUT.blow[i]} getNote={getNoteName} getAbsSemi={getAbsoluteSemiTone} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} holeNum={h} showOverbanding={showOverbanding} boxKey={`blow-${i}`} clickedCellKey={clickedCellKey} />
            <div style={BOX_STYLE.holeNumber}>{h}</div>
            <NoteBox semi={HARP_LAYOUT.draw[i]} getNote={getNoteName} getAbsSemi={getAbsoluteSemiTone} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} holeNum={h} showOverbanding={showOverbanding} boxKey={`draw-${i}`} clickedCellKey={clickedCellKey} />
            
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '280px', gap: '4px' }}>
              {HARP_LAYOUT.bottomSpecials[i].map((semiVal, sIdx) => (
                <NoteBox key={sIdx} semi={semiVal} getNote={getNoteName} getAbsSemi={getAbsoluteSemiTone} activeAbsoluteSemi={activeAbsoluteSemi} cents={centsOff} limit={tolerance} onStart={handleNoteStart} onStop={handleNoteStop} isDrawZone={true} holeNum={h} showOverbanding={showOverbanding} boxKey={`bot-spec-${i}-${sIdx}`} clickedCellKey={clickedCellKey} />
              ))}
            </div>

            {h === 10 && (
              <div style={{ position: 'absolute', bottom: '-5px', right: '0px', width: '650px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', zIndex: 10, fontFamily: 'sans-serif', lineHeight: '1.4' }}>
                <div style={{ fontSize: '34.2px', fontWeight: '900', color: '#10b981', marginBottom: '16px', letterSpacing: '-0.5px' }}>Harmonica Training Center</div>
                <div style={{ color: '#475569', fontSize: '12.6px', fontWeight: '600' }}>Copyright ⓒ 2026 CoffeeBada Lee, Choong-Koo All Rights Reserved.</div>
                <div style={{ color: '#64748b', fontSize: '12.6px', fontWeight: '600', marginTop: '2px' }}>Contact : 279.lee@gmail.com</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={DASHBOARD_STYLE.inlineDashboard}>
        <div style={DASHBOARD_STYLE.controlBox}>
          <label style={{ cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
            <Upload size={22} />
            <span style={{ fontSize: '14px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{fileName}</span>
            <input type="file" onChange={handleFileUpload} hidden accept="audio/*" />
          </label>
          <button onClick={toggleTrack} style={DASHBOARD_STYLE.playBtn}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
          <div style={{ flex: 1, minWidth: 0, marginLeft: '8px' }}><span style={DASHBOARD_STYLE.label}>MR VOL</span><input type="range" min="0" max="1" step="0.01" value={mrVolume} onChange={(e) => setMrVolume(parseFloat(e.target.value))} style={{ width: '100%' }} /></div>
        </div>

        {/* 🎯 [오작동 결함 해결 완료] 마이크 활성화와 차단 분리 및 독립 REC 토글 스위치 배치 */}
        <div style={{ ...DASHBOARD_STYLE.controlBox, justifyContent: 'center' }}>
          <button onClick={isRecording ? stopRecordingSession : startRecordingSession} style={{ backgroundColor: isRecording ? '#ef4444' : '#374151', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isRecording ? <Square size={14} /> : <Mic size={14} />} {isRecording ? "STOP MIX" : "REC MIX"}
          </button>
          {recordedUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #4b5563', overflow: 'hidden' }}>
              <audio ref={audioPlaybackRef} src={recordedUrl} onEnded={() => setIsRecordedPlaying(false)} style={{ display: 'none' }} />
              <button onClick={toggleRecordedPlayback} style={{ border: 'none', backgroundColor: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isRecordedPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <a href={recordedUrl} download="harmonica_session.wav" style={{ color: '#10b981', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Download size={22} /></a>
            </div>
          )}
        </div>

        <div style={DASHBOARD_STYLE.controlBox}>
          <Mic size={22} color="#94a3b8" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, marginLeft: '8px' }}><span style={DASHBOARD_STYLE.label}>MIC VOL</span><input type="range" min="0" max="1" step="0.01" value={micVolume} onChange={(e) => setMicVolume(parseFloat(e.target.value))} style={{ width: '100%' }} /></div>
          {isListening && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '55px', flexShrink: 0, marginLeft: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: '900', fontSize: '18px' }}>{activeNote || '---'}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{centsOff}¢</span>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div style={MODAL_STYLE.modalOverlay} onClick={() => setShowSettings(false)}>
          <div style={MODAL_STYLE.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#10b981' }}>Settings</h2>
              <X size={28} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowSettings(false)} />
            </div>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #374151' }}>
              <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold' }}>Show Overbends</span>
              <button onClick={() => setShowOverbanding(!showOverbanding)} style={{ padding: '8px 18px', backgroundColor: showOverbanding ? '#10b981' : '#4b5563', border: 'none', color: showOverbanding ? 'black' : 'white', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.15s ease' }}>{showOverbanding ? 'ON' : 'OFF'}</button>
            </div>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 'bold' }}>Mic Reverb Effect</span>
              <button onClick={() => setUseReverb(!useReverb)} style={{ padding: '8px 18px', backgroundColor: useReverb ? '#10b981' : '#ef4444', border: 'none', color: useReverb ? 'black' : 'white', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>{useReverb ? 'ON' : 'OFF'}</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '15px', color: '#94a3b8' }}>Standard Pitch: A={baseFreq}Hz</span>
              <input type="range" min="430" max="450" step="1" value={baseFreq} onChange={(e) => setBaseFreq(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <button style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: isLowKey ? '#7c2d12' : '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }} onClick={() => { const nm = !isLowKey; setIsLowKey(nm); setCurrentKey(nm ? 'LF' : 'C'); }}>{isLowKey ? 'LOW KEY MODE' : 'STANDARD KEY MODE'}</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '15px', color: '#94a3b8' }}>Tolerance (±{tolerance}c)</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                {['5', '10', '15', '20'].map(val => <button key={val} onClick={() => setTolerance(parseInt(val))} style={{ flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none', backgroundColor: tolerance === parseInt(val) ? '#10b981' : '#374151', color: 'white', cursor: 'pointer', fontSize: '14px' }}>Base ±{val}</button>)}
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} style={MODAL_STYLE.saveBtn}>SAVE & CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
// 📦 서브 컴포넌트: 사각형 유닛 (1:1 절대 옥타브 음정 격리 매핑 시스템 탑재)
function NoteBox({ semi, getNote, getAbsSemi, activeAbsoluteSemi, cents, limit, onStart, onStop, isBlowZone, isDrawZone, isTopBb, holeNum, showOverbanding, boxKey, clickedCellKey }) {
  const noteName = getNote(semi);
  if (semi === null || !noteName) return <div style={{ height: '90px', width: '90px', margin: '3px 0' }}></div>;
  
  // 🎯 [옥타브 단독 격리 완료] 1번 홀 C4와 4번 홀 C5의 충돌을 방지하기 위해 절대 주파수 인덱스(absSemi)를 대조
  const currentBoxAbsSemi = getAbsSemi(semi);
  const isCurrentlyListening = activeAbsoluteSemi === currentBoxAbsSemi && !clickedCellKey.current;
  const isCurrentlyClicked = clickedCellKey.current === boxKey;
  
  const isActive = isCurrentlyListening || isCurrentlyClicked;
  const safeCents = Math.max(-limit, Math.min(limit, cents));
  
  // 🎯 마우스로 터치하거나 누를 때 튜닝 바늘 정중앙(50%) 고정 연동
  const indicatorLeft = isCurrentlyClicked ? 50 : (50 + (safeCents / limit) * 40);

  const isOverblowCell = isBlowZone && (holeNum === 1 || holeNum === 2 || holeNum === 3 || holeNum === 4 || holeNum === 5 || holeNum === 6);
  const isOverdrawCell = isDrawZone && (holeNum >= 7 && holeNum <= 10) && (semi === 25 || semi === 29 || semi === 32 || semi === 37);
  const hideContent = !showOverbanding && (isOverblowCell || isOverdrawCell);

  let bgColor = '#1e293b'; let borderStyle = '1px solid #334155';
  
  if (isActive && !hideContent) {
    // 🎯 [3색 튜너 피드백 적용] 센트 오차 범위에 따라 녹색, 낮으면 빨간색, 높으면 노란색 실시간 스위칭
    if (isCurrentlyClicked) {
      bgColor = '#22c55e'; // 마우스 클릭 소리는 완벽 무결 합격 녹색 고정
    } else {
      bgColor = Math.abs(cents) <= limit ? '#22c55e' : (cents > limit ? '#eab308' : '#ef4444');
    }
  } else if (hideContent) {
    bgColor = 'transparent'; borderStyle = '1px solid transparent';
  } else {
    if (isTopBb) {
      bgColor = '#93c5fd';
    } else if (isOverblowCell || isOverdrawCell) {
      bgColor = '#f59e0b';
    } else if (isBlowZone) {
      bgColor = (holeNum === 8 || holeNum === 9 || holeNum === 10) ? '#93c5fd' : '#ffffff';
      if(holeNum <= 4 || holeNum === 5 || holeNum === 6 || holeNum === 7) bgColor = '#ffffff';
    } else if (isDrawZone) {
      if (semi === 1 || semi === 6 || semi === 5 || semi === 10 || semi === 9 || semi === 8 || semi === 13 || semi === 11 || semi === 7 || semi === 21 || holeNum === 6) {
        bgColor = '#93c5fd';
      } else {
        bgColor = '#ffffff';
      }
    }
  }

  return (
    <div style={{ width: '90px', height: '90px', margin: '3px 0', borderRadius: '14px', border: borderStyle, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: hideContent ? 'default' : 'pointer', userSelect: 'none' }} onMouseDown={() => !hideContent && onStart(semi, boxKey)} onMouseUp={() => onStop(boxKey)} onMouseLeave={() => onStop(boxKey)} onTouchStart={(e) => { if (e.cancelable) e.preventDefault(); if (!hideContent) onStart(semi, boxKey); }} onTouchEnd={() => onStop(boxKey)}>
      <span style={{ fontWeight: '900', fontSize: '24px', color: hideContent ? 'transparent' : ((isActive || isBlowZone || isDrawZone || isTopBb) ? 'black' : '#94a3b8') }}>{noteName}</span>
      {isActive && !hideContent && <div style={{ position: 'absolute', left: `${indicatorLeft}%`, width: '4px', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', transition: 'left 0.04s ease-out' }}></div>}
    </div>
  );
}

// 🎯 5도권 모듈 컴포넌트 (`getMouseAngle` 궤도 함수 정의 내장형 완결본)
function NewFeaturePage({ onRouteClick }) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState('harmonica'); 
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const mainWrapperRef = useRef(null);
  const dragStartAngle = useRef(0);
  const baseRotationOnDragStart = useRef(0);

  const majorCircleRadius = 298.0;
  const minorCircleRadius = 181.0;
  const staffCircleRadius = 412.0;    
  const romanCircleRadius = 345.0;    
  const positionCircleRadius = 245.5;

  const currentSelectedKey = keysCircleData[activeIndex];

  const getKeyByOffsetAngle = (offsetAngle) => {
    const slotOffset = offsetAngle / 30;
    return keysCircleData[(activeIndex + slotOffset + 12) % 12];
  };

  const rotateWheelToKey = (item) => {
    const targetBaseAngle = item.angle;
    let currentNormalized = rotationAngle % 360;
    let diff = (-targetBaseAngle - currentNormalized) % 360;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const finalAngle = rotationAngle + diff;
    setRotationAngle(finalAngle);
    
    const finalCalculatedIndex = (Math.round(-finalAngle / 30) % 12 + 12) % 12;
    setActiveIndex(finalCalculatedIndex);
  };

  // 🎯 [정의 유실 해결] 마우스 및 터치 드래그 추적 물리 각도 변환 필터 수립 완결
  const getMouseAngle = (clientX, clientY) => {
    if (!mainWrapperRef.current) return 0;
    const rect = mainWrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const onDragStart = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    const clientX = e.clientX || (e.touches && e.touches.clientX);
    const clientY = e.clientY || (e.touches && e.touches.clientY);
    setIsDragging(true);
    dragStartAngle.current = getMouseAngle(clientX, clientY);
    baseRotationOnDragStart.current = rotationAngle;
  };

  useEffect(() => {
    const onDragMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches.clientX);
      const clientY = e.clientY || (e.touches && e.touches.clientY);
      
      const currentMouseAngle = getMouseAngle(clientX, clientY);
      let angleDifference = currentMouseAngle - dragStartAngle.current;

      if (angleDifference > 180) angleDifference -= 360;
      if (angleDifference < -180) angleDifference += 360;

      const nextAngle = baseRotationOnDragStart.current + angleDifference;
      setRotationAngle(nextAngle);

      const currentSnappedIndex = (Math.round(-nextAngle / 30) % 12 + 12) % 12;
      setActiveIndex(currentSnappedIndex);
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const targetSnapAngle = Math.round(rotationAngle / 30) * 30;
      setRotationAngle(targetSnapAngle);

      const finalCalculatedIndex = (Math.round(-targetSnapAngle / 30) % 12 + 12) % 12;
      setActiveIndex(finalCalculatedIndex);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isDragging, rotationAngle]);

  const toggleDisplayMode = () => {
    setDisplayMode(prev => (prev === 'harmonica' ? 'song' : 'harmonica'));
  };

  return (
    <div style={CIRCLE_STYLE.container}>
      <div style={{ position: 'absolute', top: '30px', left: '420px', zIndex: 5000 }}>
        <button onClick={onRouteClick} style={{ ...BOX_STYLE.routeBtn, backgroundColor: '#1f2937', color: 'white' }}>Harmonica Training</button>
      </div>

      <div ref={mainWrapperRef} style={CIRCLE_STYLE.circleWrapper} onMouseDown={onDragStart} onTouchStart={onDragStart}>
        <div style={CIRCLE_STYLE.rotatableWheel(rotationAngle, isDragging)}>
          <div style={CIRCLE_STYLE.wheelBg}></div>
          <div style={CIRCLE_STYLE.innerMask}></div>
          
          <div style={CIRCLE_STYLE.textLayerWrapper}>
            {keysCircleData.map((item) => {
              const rad = ((item.angle - 90) * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              const isHoveredActive = hoveredIdx === item.idx;

              return (
                <React.Fragment key={item.idx}>
                  <button 
                    style={{ ...CIRCLE_STYLE.nodeSectorBtn, ...CIRCLE_STYLE.btnStyleMaj, left: `calc(50% + ${majorCircleRadius * cos}px)`, top: `calc(50% + ${majorCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}
                    onMouseEnter={() => setHoveredIdx(item.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={(e) => { e.stopPropagation(); rotateWheelToKey(item); }}
                  >
                    {item.major}
                  </button>
                  <button 
                    style={{ ...CIRCLE_STYLE.nodeSectorBtn, ...CIRCLE_STYLE.btnStyleMin, left: `calc(50% + ${minorCircleRadius * cos}px)`, top: `calc(50% + ${minorCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}
                    onMouseEnter={() => setHoveredIdx(item.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={(e) => { e.stopPropagation(); rotateWheelToKey(item); }}
                  >
                    {item.minor}
                  </button>
                  <div style={{ ...CIRCLE_STYLE.signatureTextBadge(isHoveredActive ? 1 : 0, item.type === 'sharp', item.type === 'flat'), left: `calc(50% + ${staffCircleRadius * cos}px)`, top: `calc(50% + ${staffCircleRadius * sin}px)`, transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)` }}>
                    {item.displaySig}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ ...CIRCLE_STYLE.centerCore, left: 'calc(50% - 90px)', top: 'calc(50% - 90px)' }}>
          <div style={CIRCLE_STYLE.coreCenterContent}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '4px', color: displayMode === 'harmonica' ? '#e51c23' : '#00a8ff', transition: 'color 0.3s' }}>
              {displayMode === 'harmonica' ? 'Harp Key' : 'Song Key'}
            </span>
            <span style={{ fontWeight: '900', fontSize: displayMode === 'harmonica' ? '39px' : '22px', color: displayMode === 'harmonica' ? '#0056b3' : '#2ed573', transition: 'color 0.3s, font-size 0.3s' }}>
              {displayMode === 'harmonica' ? currentSelectedKey.major : `${currentSelectedKey.major} Maj / ${currentSelectedKey.major}m`}
            </span>
          </div>

          <svg style={CIRCLE_STYLE.staticCurvedSvgOverlay} viewBox="0 0 184 184">
            <defs>
              <path id="core-top-path" d="M 17,92 A 75,75 0 1,1 167,92" />
              <path id="core-bottom-path" d="M 6,92 A 86,86 0 0,0 178,92" /> 
            </defs>
            <text fontSize="16.7px" fontWeight="black" fill="#f59e0b" letterSpacing="0.2px">
              <textPath href="#core-top-path" startOffset="50%" textAnchor="middle">The Circle of Fifths</textPath>
            </text>
            <text fontSize="11.7px" fontWeight="bold" fill="#94a3b8" letterSpacing="-0.3px">
              <textPath href="#core-bottom-path" startOffset="50%" textAnchor="middle">Copyright © 2026. coffeebada All rights reserved.</textPath>
            </text>
          </svg>
        </div>

        <div style={CIRCLE_STYLE.staticOverlayLayer}>
          {romanDegrees.map((degree, dIdx) => {
            const rad = ((degree.angle - 90) * Math.PI) / 180;
            return (
              <div key={dIdx} style={{ ...CIRCLE_STYLE.romanDegreeBadge, left: `calc(50% + ${romanCircleRadius * Math.cos(rad)}px)`, top: `calc(50% + ${romanCircleRadius * Math.sin(rad)}px)`, transform: 'translate(-50%, -50%)' }}>
                {degree.text}
              </div>
            );
          })}
          {fixedPositionLabels.map((pos, pIdx) => {
            const targetAngle = displayMode === 'harmonica' ? pos.harmonicaAngle : pos.songAngle;
            const rad = ((targetAngle - 90) * Math.PI) / 180;
            return (
              <div key={pIdx} style={{ ...CIRCLE_STYLE.staticFixedPositionBadge, left: `calc(50% + ${positionCircleRadius * Math.cos(rad)}px - 25px)`, top: `calc(50% + ${positionCircleRadius * Math.sin(rad)}px - 15px)` }}>
                {pos.text}
              </div>
            );
          })}
        </div>
      </div>

      <div style={CIRCLE_STYLE.tablePanel}>
        <div style={CIRCLE_STYLE.clickablePanelTitle} onClick={toggleDisplayMode}>
          <span style={{ fontWeight: '900', color: '#ffffff' }}>{displayMode === 'harmonica' ? 'Harmonica Key' : 'Song Key'}</span>
          <span style={CIRCLE_STYLE.dynamicTitleValue(displayMode === 'harmonica')}>
            {displayMode === 'harmonica' ? currentSelectedKey.major : `${currentSelectedKey.major} Maj / ${currentSelectedKey.major}m`}
          </span>
        </div>

        <table style={CIRCLE_STYLE.table}>
          <thead>
            <tr>
              <th colSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.headerTheme(displayMode === 'harmonica') }}>
                {displayMode === 'harmonica' ? 'Song Key' : 'Harp Key'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.bgGray, width: '25%' }}>Major</td>
              <td style={{ ...CIRCLE_STYLE.thTd, width: '40%' }}>1st Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold', color: '#cbd5e1' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(0).major : getKeyByOffsetAngle(0).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>2nd Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(30).major : getKeyByOffsetAngle(-30).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>12th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(-30).major : getKeyByOffsetAngle(30).major}
              </td>
            </tr>
            <tr>
              <td rowSpan="3" style={{ ...CIRCLE_STYLE.thTd, ...CIRCLE_STYLE.bgGray }}>minor</td>
              <td style={CIRCLE_STYLE.thTd}>3rd Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(60).major + "m" : getKeyByOffsetAngle(-60).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>4th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? currentSelectedKey.minor : getKeyByOffsetAngle(-90).major}
              </td>
            </tr>
            <tr>
              <td style={CIRCLE_STYLE.thTd}>5th Position</td>
              <td style={{ ...CIRCLE_STYLE.thTd, fontWeight: 'bold' }}>
                {displayMode === 'harmonica' ? getKeyByOffsetAngle(120).major + "m" : getKeyByOffsetAngle(-120).major}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CIRCLE_STYLE = {
  container: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '80px', width: '100%', height: '100%', boxSizing: 'border-box' },
  circleWrapper: { position: 'relative', width: '920px', height: '920px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rotatableWheel: (angle, isDragging) => ({ position: 'absolute', width: '740px', height: '740px', borderRadius: '50%', zIndex: 10, transform: `rotate(${angle}deg)`, cursor: isDragging ? 'grabbing' : 'grab', overflow: 'visible', transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }),
  wheelBg: { width: '100%', height: '100%', borderRadius: '50%', position: 'absolute', background: 'conic-gradient(#e51c23 0deg 30deg, #f57c00 30deg 60deg, #ffb74d 60deg 90deg, #fdd835 90deg 120deg, #aeea00 120deg 150deg, #4caf50 150deg 180deg, #00b0ff 180deg 210deg, #00e5ff 210deg 240deg, #2979ff 240deg 270deg, #3f51b5 270deg 300deg, #673ab7 300deg 330deg, #e91e63 330deg 360deg)', transform: 'rotate(-15deg)', zIndex: 1 },
  innerMask: { position: 'absolute', width: '448px', height: '448px', backgroundColor: '#050a14', borderRadius: '50%', top: '146px', left: '146px', zIndex: 2, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)' }, 
  centerCore: { position: 'absolute', width: '180px', height: '180px', backgroundColor: '#111827', borderRadius: '50%', zIndex: 30, border: '2px solid #374151', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', overflow: 'visible' },
  coreCenterContent: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 35, textAlign: 'center', width: '170px' },
  staticCurvedSvgOverlay: { position: 'absolute', top: '-2px', left: '-2px', width: '184px', height: '184px', zIndex: 32 },
  textLayerWrapper: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 5 },
  nodeSectorBtn: { position: 'absolute', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0, zIndex: 12 },
  btnStyleMaj: { width: '70px', height: '50px', fontSize: '30px', fontWeight: '900', color: '#ffffff', textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px -1px 0 #000, 2px 1px 0 #000, 0px -2px 0 #000, 0px 2px 0 #000, 0px 3px 5px rgba(0,0,0,0.9)' },
  btnStyleMin: { width: '60px', height: '40px', fontSize: '18px', fontWeight: '800', color: '#a3b8cc', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' },
  signatureTextBadge: (opacity, isSharp, isFlat) => ({ position: 'absolute', zIndex: 11, fontSize: opacity === 1 ? '34px' : '28px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: opacity, color: isSharp ? '#ef4444' : (isFlat ? '#3b82f6' : '#64748b'), transition: 'opacity 0.15s ease, transform 0.4s' }),
  romanDegreeBadge: { position: 'absolute', zIndex: 8, fontSize: '20px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  staticOverlayLayer: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 20, pointerEvents: 'none' },
  staticFixedPositionBadge: { position: 'absolute', zIndex: 25, width: '50px', height: '30px', fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.65)' },
  tablePanel: { width: '450px' },
  clickablePanelTitle: { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #374151', padding: '0 16px', borderRadius: '12px', backgroundColor: '#111827', height: '55px', border: '1px solid #374151', boxSizing: 'border-box' },
  dynamicTitleValue: (isBlue) => ({ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.3px', color: isBlue ? '#3b82f6' : '#10b981' }),
  table: { width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' },
  thTd: { border: '1px solid #374151', padding: '16px 14px', textAlign: 'center', fontSize: '18px', color: '#cbd5e1' },
  headerTheme: (isGreen) => ({ backgroundColor: isGreen ? '#10b981' : '#2563eb', color: 'white', fontWeight: 'bold', fontSize: '20px' }),
  bgGray: { backgroundColor: '#1f2937', fontWeight: 'bold', fontSize: '18px', color: '#94a3b8' }
};

// 🎯 [마스터 마운트 진입로 개설]
export default function App() {
  const [currentPage, setCurrentPage] = useState('harmonica'); 
  const [showOverbanding, setShowOverbanding] = useState(false);

  return (
    <div style={{ backgroundColor: '#050a14', width: '1920px', height: '1080px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
      {currentPage === 'harmonica' ? (
        <HarmonicaRoom showOverbanding={showOverbanding} setShowOverbanding={setShowOverbanding} onRouteClick={() => setCurrentPage('newFeature')} />
      ) : (
        <NewFeaturePage onRouteClick={() => setCurrentPage('harmonica')} />
      )}
    </div>
  );
}
